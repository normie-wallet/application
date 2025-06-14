import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  Modal,
} from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

interface QRScannerScreenProps {
  visible: boolean;
  onClose: () => void;
  onScan: (data: string) => void;
}

const QRScannerScreen: React.FC<QRScannerScreenProps> = ({
  visible,
  onClose,
  onScan,
}) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const isProcessingRef = useRef(false);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    // If we're already processing a scan or have scanned, ignore
    if (isProcessingRef.current || scanned) return;
    
    // Set processing flag to prevent multiple scans
    isProcessingRef.current = true;
    
    // Immediately set scanned to true
    setScanned(true);
    
    // Stop the camera preview
    if (cameraRef.current) {
      cameraRef.current.pausePreview();
    }
    
    // Process the scan with a small delay to ensure we don't process multiple scans
    setTimeout(() => {
      onScan(data);
    }, 100);
  };

  // Reset states when modal becomes visible
  useEffect(() => {
    if (visible) {
      setScanned(false);
      isProcessingRef.current = false;
    }
  }, [visible]);

  if (!visible) {
    return null;
  }

  if (hasPermission === null) {
    return (
      <Modal visible={visible} animationType="slide">
        <View style={styles.container}>
          <Text>Requesting camera permission...</Text>
        </View>
      </Modal>
    );
  }

  if (hasPermission === false) {
    return (
      <Modal visible={visible} animationType="slide">
        <View style={styles.container}>
          <Text>No access to camera</Text>
          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFillObject}
          facing="back"
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
        />
        <View style={styles.overlay}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <MaterialIcons name="close" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerText}>Scan QR Code</Text>
          </View>
          <View style={styles.scanArea}>
            <View style={styles.scanFrame} />
          </View>
          <Text style={styles.instructions}>
            Position the QR code within the frame
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 48,
  },
  closeButton: {
    padding: 8,
  },
  headerText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 16,
  },
  scanArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#7c3aed',
    backgroundColor: 'transparent',
  },
  instructions: {
    color: 'white',
    textAlign: 'center',
    padding: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#7c3aed',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default QRScannerScreen; 