const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withNetworkSecurity(config) {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults.manifest;
    const mainActivity = androidManifest.application[0].activity[0];
    
    // 1. Ensure usesCleartextTraffic is true at the manifest level
    androidManifest.application[0].$['android:usesCleartextTraffic'] = 'true';
    
    // 2. Add extra network settings if needed
    // In many cases, just having usesCleartextTraffic: true is enough if 
    // it's correctly applied to the AndroidManifest.
    
    return config;
  });
};
