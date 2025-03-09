import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Animated as RNAnimated, Keyboard } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Container } from 'components/Container';
import { DistanceMonitor } from 'components/DistanceMonitor';
import { CONFIG } from './config';
import { BlurView } from 'expo-blur';

// URL validation regex
const WS_URL_REGEX = /^(ws|wss):\/\/([a-zA-Z0-9_-]+\.)*[a-zA-Z0-9_-]+(:[0-9]+)?(\/[a-zA-Z0-9_\-\.~:\/\?#\[\]@!$&'\(\)\*\+,;=]*)?$/;

export default function App() {
  const [showSettings, setShowSettings] = useState(false);
  const [wsUrl, setWsUrl] = useState(CONFIG.WS_URL);
  const [editingUrl, setEditingUrl] = useState('');
  const [isValidUrl, setIsValidUrl] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  
  const fadeAnim = useRef(new RNAnimated.Value(0)).current;
  const shakeAnim = useRef(new RNAnimated.Value(0)).current;
  
  // Initialize editing URL when settings are opened
  useEffect(() => {
    if (showSettings) {
      setEditingUrl(wsUrl);
      setIsValidUrl(true);
      setIsSaved(false);
    }
  }, [showSettings]);
  
  // Fade animation for success message
  useEffect(() => {
    if (isSaved) {
      RNAnimated.sequence([
        RNAnimated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        RNAnimated.delay(2000),
        RNAnimated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => setIsSaved(false));
    }
  }, [isSaved, fadeAnim]);
  
  // Shake animation for invalid input
  const shakeAnimation = () => {
    shakeAnim.setValue(0);
    RNAnimated.sequence([
      RNAnimated.timing(shakeAnim, { 
        toValue: 10, 
        duration: 50, 
        useNativeDriver: true 
      }),
      RNAnimated.timing(shakeAnim, { 
        toValue: -10, 
        duration: 50, 
        useNativeDriver: true 
      }),
      RNAnimated.timing(shakeAnim, { 
        toValue: 10, 
        duration: 50, 
        useNativeDriver: true 
      }),
      RNAnimated.timing(shakeAnim, { 
        toValue: 0, 
        duration: 50, 
        useNativeDriver: true 
      })
    ]).start();
  };
  
  // Validate and handle URL changes
  const handleUrlChange = (text: string) => {
    setEditingUrl(text);
    setIsValidUrl(WS_URL_REGEX.test(text));
  };
  
  // Save the URL if valid
  const saveUrl = () => {
    if (isValidUrl && editingUrl !== '') {
      setWsUrl(editingUrl);
      CONFIG.WS_URL = editingUrl; // Update the config as well
      setIsSaved(true);
      Keyboard.dismiss();
    } else {
      shakeAnimation();
    }
  };
  
  return (
    <SafeAreaProvider>
      <Container>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Distance Buddy</Text>
            <TouchableOpacity 
              onPress={() => setShowSettings(!showSettings)}
              style={styles.settingsButton}
            >
              <Text style={styles.buttonText}>
                {showSettings ? 'Close' : 'Settings'}
              </Text>
            </TouchableOpacity>
          </View>
          
          {showSettings ? (
            <View style={styles.settingsPanel}>
              <Text style={styles.settingsTitle}>ESP32 WebSocket URL</Text>
              
              <View style={styles.inputContainer}>
                <BlurView intensity={20} tint="light" style={styles.inputBlur}>
                  <RNAnimated.View 
                    style={[
                      styles.inputWrapper,
                      { 
                        borderColor: isValidUrl 
                          ? 'rgba(167, 243, 208, 0.8)' // Green for valid
                          : 'rgba(254, 202, 202, 0.8)', // Red for invalid
                        transform: [{ translateX: shakeAnim }]
                      }
                    ]}
                  >
                    <TextInput
                      style={[
                        styles.input,
                        { color: isValidUrl ? '#059669' : '#ef4444' }
                      ]}
                      value={editingUrl}
                      onChangeText={handleUrlChange}
                      placeholder="ws://server-address/ws"
                      placeholderTextColor="#94a3b8"
                      autoCapitalize="none"
                      autoCorrect={false}
                      spellCheck={false}
                    />
                    <TouchableOpacity 
                      style={[
                        styles.saveButton,
                        { 
                          backgroundColor: isValidUrl 
                            ? 'rgba(167, 243, 208, 0.8)' 
                            : 'rgba(226, 232, 240, 0.5)' 
                        }
                      ]}
                      onPress={saveUrl}
                      disabled={!isValidUrl}
                    >
                      <Text 
                        style={[
                          styles.saveButtonText,
                          { color: isValidUrl ? '#059669' : '#94a3b8' }
                        ]}
                      >
                        Save
                      </Text>
                    </TouchableOpacity>
                  </RNAnimated.View>
                </BlurView>
              </View>
              
              <RNAnimated.View 
                style={[
                  styles.successMessage,
                  { opacity: fadeAnim }
                ]}
              >
                <Text style={styles.successText}>
                  URL saved successfully!
                </Text>
              </RNAnimated.View>
              
              {!isValidUrl && editingUrl !== '' && (
                <Text style={styles.errorText}>
                  Please enter a valid WebSocket URL (ws:// or wss://)
                </Text>
              )}
              
              <Text style={styles.settingsHelp}>
                Current connection: {wsUrl}
              </Text>
              
              <Text style={styles.settingsHelp}>
                Proximity threshold: {CONFIG.PROXIMITY_THRESHOLD}cm
              </Text>
            </View>
          ) : null}
          
          <View style={styles.monitorContainer}>
            <DistanceMonitor wsUrl={wsUrl} />
          </View>
        </View>
        <StatusBar style="dark" />
      </Container>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#334155',
  },
  settingsButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
  },
  buttonText: {
    color: '#334155',
    fontWeight: '600',
  },
  settingsPanel: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#334155',
  },
  inputContainer: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  inputBlur: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    height: 50,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: 'System',
  },
  saveButton: {
    paddingHorizontal: 16,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    fontWeight: '600',
  },
  successMessage: {
    marginBottom: 16,
    padding: 8,
    backgroundColor: 'rgba(167, 243, 208, 0.5)',
    borderRadius: 8,
    alignItems: 'center',
  },
  successText: {
    color: '#059669',
    fontWeight: '500',
  },
  errorText: {
    color: '#ef4444',
    marginBottom: 16,
    fontSize: 14,
  },
  settingsHelp: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  monitorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
});
