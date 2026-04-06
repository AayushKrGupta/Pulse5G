import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react-native';
import { Colors } from '../../constants/theme';
import { getVideoStreamUrl } from '../../src/services/api';

interface LiveVideoStreamProps {
  cameraId?: string;
  style?: any;
}

/**
 * 5G Edge Camera - High Performance MJPEG Streamer
 * Uses WebView for native browser-grade MJPEG rendering support
 */
export default function LiveVideoStream({ cameraId = "CAM-01", style }: LiveVideoStreamProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const theme = Colors.dark;
  const streamUrl = `${getVideoStreamUrl()}?t=${refreshKey}`;

  const refreshStream = () => {
    setIsLoading(true);
    setError(null);
    setRefreshKey(prev => prev + 1);
  };

  useEffect(() => {
    setIsConnected(true);
    // Auto-hide the loading spinner after the webview initializes content
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, [refreshKey]);

  return (
    <View style={[styles.container, { backgroundColor: theme.card, borderColor: theme.cardBorder }, style]}>
      {/* Container for WebView */}
      <View style={styles.videoContainer}>
        {error ? (
          <View style={styles.errorContainer}>
            <WifiOff size={32} color={theme.error} />
            <Text style={[styles.errorText, { color: theme.error }]}>Connection Failed</Text>
            <TouchableOpacity 
              style={[styles.refreshButton, { backgroundColor: theme.error }]}
              onPress={refreshStream}
            >
              <RefreshCw size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <WebView
              key={refreshKey}
              source={{ html: `
                <html>
                  <body style="margin:0;padding:0;background-color:black;display:flex;justify-content:center;align-items:center;height:100vh;overflow:hidden;">
                    <img id="stream" src="${streamUrl}" style="width:100%;height:auto;max-height:100%;object-fit:contain;" />
                    <script>
                      const img = document.getElementById('stream');
                      img.onerror = () => { window.ReactNativeWebView.postMessage('error'); };
                      img.onload = () => { window.ReactNativeWebView.postMessage('loaded'); };
                    </script>
                  </body>
                </html>
              ` }}
              style={[styles.video, { opacity: isLoading ? 0 : 1 }]}
              scrollEnabled={false}
              onMessage={(event) => {
                if (event.nativeEvent.data === 'error') {
                  setError("Stream unreachable");
                } else if (event.nativeEvent.data === 'loaded') {
                  setIsLoading(false);
                }
              }}
              onError={() => setError("WebView failed")}
              allowsInlineMediaPlayback={true}
              mediaPlaybackRequiresUserAction={false}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              originWhitelist={['*']}
            />
            {isLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.accent} />
                <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Optimizing Edge Link...</Text>
              </View>
            )}
          </>
        )}
        
        {/* Overlay Controls */}
        <View style={styles.overlay} pointerEvents="box-none">
          <View style={styles.topOverlay} pointerEvents="box-none">
            <View style={[styles.statusBadge, { backgroundColor: isConnected ? 'rgba(34, 197, 94, 0.9)' : 'rgba(239, 68, 68, 0.9)' }]}>
              {isConnected ? <Wifi size={12} color="#fff" /> : <WifiOff size={12} color="#fff" />}
              <Text style={styles.statusText}>{isConnected ? 'LIVE' : 'OFFLINE'}</Text>
            </View>
            <Text style={[styles.cameraId, { color: '#fff' }]}>{cameraId}</Text>
          </View>
          
          <TouchableOpacity 
            style={[styles.expandButton, { backgroundColor: 'rgba(0, 0, 0, 0.6)' }]}
            onPress={refreshStream}
          >
            <RefreshCw size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Bottom Info */}
      <View style={styles.bottomInfo}>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Stream Quality</Text>
          <Text style={[styles.infoValue, { color: theme.text }]}>Ultra HD</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Node Latency</Text>
          <Text style={[styles.infoValue, { color: theme.text }]}>~2ms</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  videoContainer: {
    height: 220,
    position: 'relative',
    backgroundColor: '#000',
  },
  video: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    zIndex: 5,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 220,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
  },
  refreshButton: {
    marginTop: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    zIndex: 10,
  },
  topOverlay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  cameraId: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  expandButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 15,
  },
  bottomInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  infoRow: {
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
  },
});
