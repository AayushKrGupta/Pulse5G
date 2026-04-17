import * as SecureStore from 'expo-secure-store';

// Global state for server configuration
let serverIp = "172.16.0.17"; // Default initial IP pointing to your Edge VM
let listeners: ((ip: string) => void)[] = [];

const STORAGE_KEY = 'pulse5g_server_ip';

// Initialize: Try to load from storage
SecureStore.getItemAsync(STORAGE_KEY).then(savedIp => {
    if (savedIp) {
        serverIp = savedIp;
        listeners.forEach(l => l(serverIp));
    }
});

export const getServerIp = () => serverIp;

export const setServerIp = (newIp: string) => {
    serverIp = newIp;
    // Save to permanent storage
    SecureStore.setItemAsync(STORAGE_KEY, newIp).catch(err => {
        console.error("Failed to save IP to storage:", err);
    });
    
    listeners.forEach(l => l(newIp));
};

export const subscribeToIpChanges = (callback: (ip: string) => void) => {
    listeners.push(callback);
    return () => {
        listeners = listeners.filter(l => l !== callback);
    };
};

export const getBaseUrl = () => `http://${serverIp}:8000`;
export const getWsUrl = () => `ws://${serverIp}:8000/ws`;

/**
 * Auto-Discovery logic
 * Scans the local network for the Pulse5G API
 */
export const discoverServer = async (
    subnetHint?: string,
    progressCallback?: (progress: number) => void
) => {
    // If user provides a hint (e.g. "172.16.0"), we only scan that.
    // Otherwise we scan the most common subnets.
    const subnets = subnetHint
        ? [subnetHint]
        : ["192.168.1", "192.168.0", "172.16.0", "10.0.0", "192.168.100", "10.0.1", "172.17.0"];

    const totalSteps = subnets.length * 254;
    let currentStep = 0;

    for (const subnet of subnets) {
        const promises = [];

        for (let i = 1; i <= 254; i++) {
            const ip = `${subnet}.${i}`;
            promises.push(
                fetch(`http://${ip}:8000/`, {
                    signal: AbortSignal.timeout(200),
                })
                    .then(res => {
                        if (res.ok) return ip;
                        throw new Error("not found");
                    })
                    .catch(() => null)
            );

            if (promises.length >= 25 || i === 254) {
                const results = await Promise.all(promises);
                const found = results.find(r => r !== null);
                if (found) {
                    setServerIp(found);
                    return found;
                }

                currentStep += promises.length;
                if (progressCallback) progressCallback(currentStep / totalSteps);
                promises.length = 0;
            }
        }
    }

    return null;
};
