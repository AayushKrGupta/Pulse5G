import { useRouter } from 'expo-router';
import { ChevronLeft, Globe, RefreshCw, Save, Server, Wifi } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../../constants/theme";
import { discoverServer, getServerIp, setServerIp } from "../../src/services/config";

export default function NetworkScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = Colors.dark;

  const [ipInput, setIpInput] = useState(getServerIp());
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [currentIp, setCurrentIp] = useState(getServerIp());

  // Keep internal state in sync with global config
  useEffect(() => {
    setCurrentIp(getServerIp());
    setIpInput(getServerIp());

    const { subscribeToIpChanges } = require("../../src/services/config");
    const unsubscribe = subscribeToIpChanges((newIp: string) => {
      setCurrentIp(newIp);
      setIpInput(newIp);
    });

    return () => unsubscribe();
  }, []);

  const handleManualSave = () => {
    const ipPattern = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

    if (ipPattern.test(ipInput)) {
      setServerIp(ipInput);
      setCurrentIp(ipInput);
      Alert.alert("Success", "Edge Server IP updated. App services will now reconnect.");
    } else {
      Alert.alert("Invalid IP", "Please enter a valid IPv4 address (e.g. 192.168.1.100)");
    }
  };

  const startDiscovery = async () => {
    setIsScanning(true);
    setScanProgress(0);

    // If the user has typed something like "172.16.0", use it as a hint
    const segments = ipInput.split('.');
    const subnetHint = segments.length >= 3 ? segments.slice(0, 3).join('.') : undefined;

    try {
      const foundIp = await discoverServer(subnetHint, (progress: number) => {
        setScanProgress(progress);
      });

      if (foundIp) {
        setIpInput(foundIp);
        setCurrentIp(foundIp);
        Alert.alert("Server Found!", `Successfully discovered Pulse5G Edge at ${foundIp}`);
      } else {
        Alert.alert("Not Found", "Auto-discovery could not find the edge server on the current subnet. Please enter it manually.");
      }
    } catch (err) {
      Alert.alert("Scan Error", "Something went wrong during the discovery scan.");
    } finally {
      setIsScanning(false);
      setScanProgress(0);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.cardBorder, paddingTop: Platform.OS === 'android' ? insets.top : 10 }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backButton, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
        >
          <ChevronLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Network Settings</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* Connection Status Card */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(34, 197, 94, 0.1)' }]}>
              <Wifi size={24} color="#22C55E" />
            </View>
            <View style={{ flex: 1, marginLeft: 15 }}>
              <Text style={[styles.cardTitle, { color: theme.textSecondary }]}>Active Core Node</Text>
              <Text style={[styles.cardValue, { color: theme.text }]}>{currentIp}</Text>
            </View>
            <View style={styles.statusBadge}>
              <View style={[styles.statusDot, { backgroundColor: '#22C55E' }]} />
              <Text style={styles.statusText}>ONLINE</Text>
            </View>
          </View>
        </View>

        {/* Auto Discovery Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Auto-Discovery (5G Edge)</Text>
          <Text style={[styles.sectionDesc, { color: theme.textSecondary }]}>
            Automatically scan your local 5G subnet to find the Pulse5G Edge Node.
          </Text>

          <TouchableOpacity
            style={[styles.scanButton, isScanning && { opacity: 0.7 }]}
            onPress={startDiscovery}
            disabled={isScanning}
          >
            {isScanning ? (
              <View style={styles.scanningRow}>
                <ActivityIndicator color="#fff" style={{ marginRight: 10 }} />
                <Text style={styles.buttonText}>Scanning Subnet... {Math.round(scanProgress * 100)}%</Text>
              </View>
            ) : (
              <View style={styles.scanningRow}>
                <RefreshCw size={20} color="#fff" style={{ marginRight: 10 }} />
                <Text style={styles.buttonText}>Start Proactive Scan</Text>
              </View>
            )}
          </TouchableOpacity>

          {isScanning && (
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${scanProgress * 100}%` }]} />
            </View>
          )}
        </View>

        <View style={styles.divider} />

        {/* Manual Configuration Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Manual Configuration</Text>
          <Text style={[styles.sectionDesc, { color: theme.textSecondary }]}>
            Enter the IP address of the laptop or VM running the FastAPI model.
          </Text>

          <View style={[styles.inputContainer, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <Globe size={20} color={theme.textSecondary} style={{ marginLeft: 15 }} />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              value={ipInput}
              onChangeText={setIpInput}
              placeholder="e.g. 192.168.1.103"
              placeholderTextColor={theme.textSecondary}
              keyboardType="numeric"
            />
            <TouchableOpacity style={styles.saveIcon} onPress={handleManualSave}>
              <Save size={20} color={theme.accent} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: theme.accent }]}
            onPress={handleManualSave}
          >
            <Text style={styles.buttonText}>Apply Configuration</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoBox}>
          <Server size={18} color={theme.textSecondary} />
          <Text style={[styles.infoText, { color: theme.textSecondary }]}>
            Ensure the FastAPI server is running with --host 0.0.0.0 and your firewall is open on port 8000.
          </Text>
        </View>

        {/* Help Section */}
        <View style={styles.helpSection}>
          <Text style={[styles.helpTitle, { color: theme.text }]}>How to find your Server IP?</Text>

          <View style={styles.helpItem}>
            <Text style={[styles.osLabel, { color: theme.accent }]}>WINDOWS</Text>
            <Text style={[styles.helpStep, { color: theme.textSecondary }]}>Open Command Prompt and type <Text style={styles.code}>ipconfig</Text>. Look for "IPv4 Address" under your WiFi adapter.</Text>
          </View>

          <View style={styles.helpItem}>
            <Text style={[styles.osLabel, { color: theme.accent }]}>LINUX / MAC</Text>
            <Text style={[styles.helpStep, { color: theme.textSecondary }]}>Open Terminal and type <Text style={styles.code}>hostname -I</Text> or <Text style={styles.code}>ip addr show</Text>.</Text>
          </View>

          <View style={styles.helpItem}>
            <Text style={[styles.osLabel, { color: theme.accent }]}>PROTIP</Text>
            <Text style={[styles.helpStep, { color: theme.textSecondary }]}>Make sure your phone and laptop are on the same WiFi network!</Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // ... (rest of styles)
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  scrollContent: {
    padding: 20,
  },
  card: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 1.5,
    marginBottom: 30,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  cardValue: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    color: '#22C55E',
    fontSize: 10,
    fontWeight: '800',
  },
  section: {
    marginBottom: 20,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginVertical: 10,
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
  sectionDesc: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  scanButton: {
    backgroundColor: '#3B82F6',
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanningRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  inputContainer: {
    height: 56,
    borderRadius: 18,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 15,
    fontSize: 16,
    fontWeight: '600',
  },
  saveIcon: {
    padding: 15,
  },
  saveButton: {
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    marginTop: 15,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 16,
    borderRadius: 16,
    marginTop: 20,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
  helpSection: {
    marginTop: 10,
    marginBottom: 40,
    paddingHorizontal: 4,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 16,
  },
  helpItem: {
    marginBottom: 16,
  },
  osLabel: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 4,
  },
  helpStep: {
    fontSize: 13,
    lineHeight: 20,
  },
  code: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '700',
    backgroundColor: 'rgba(255,255,255,0.05)',
  }
});
