import { useState } from 'react';
import {
  Alert,
  Button,
  NativeModules,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DocumentPicker from 'react-native-document-picker';

const { PdfSigner } = NativeModules;

const getPdfSignerMethod = (names: string[]) => {
  for (const name of names) {
    const fn = (PdfSigner as any)?.[name];
    if (typeof fn === 'function') {
      return fn;
    }
  }
  throw new Error('PdfSigner native module not available. Rebuild the Android app.');
};

export const HomeScreen = () => {
  const [inputPath, setInputPath] = useState<string | null>(null);
  const [signedPath, setSignedPath] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSelectPdf = async () => {
    setError(null);
    setSignedPath(null);
    try {
      const result = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.pdf],
        copyTo: 'cachesDirectory',
      });
      const uri = result.fileCopyUri || result.uri;
      setInputPath(uri);
    } catch (err: unknown) {
      if (DocumentPicker.isCancel(err)) {
        return;
      }
      const message = err instanceof Error ? err.message : 'Failed to select PDF';
      setError(message);
      Alert.alert('Error', message);
    }
  };

  const onSignPdf = async () => {
    if (!inputPath) {
      return;
    }
    setBusy(true);
    setError(null);
    setSignedPath(null);
    try {
      const signPdf = getPdfSignerMethod(['signPdf']);
      const outputPath = await signPdf(inputPath);
      setSignedPath(outputPath);
      Alert.alert('Signed', outputPath);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to sign PDF';
      setError(message);
      Alert.alert('Error', message);
    } finally {
      setBusy(false);
    }
  };

  const onShareSignedPdf = async () => {
    if (!signedPath) {
      return;
    }
    try {
      const sharePdf = getPdfSignerMethod(['sharePdf', 'sharePDF']);
      await sharePdf(signedPath);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to share PDF';
      setError(message);
      Alert.alert('Error', message);
    }
  };

  const onOpenSignedPdf = async () => {
    if (!signedPath) {
      return;
    }
    try {
      const openPdf = getPdfSignerMethod(['openPdf', 'openPDF']);
      await openPdf(signedPath);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to open PDF';
      setError(message);
      Alert.alert('Error', message);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.content}>
        <Text style={styles.title}>PDF PAdES Signer</Text>
        <Button title="Select PDF" onPress={onSelectPdf} />
        <View style={styles.spacer} />
        <Button title={busy ? 'Signing...' : 'Sign PDF'} onPress={onSignPdf} disabled={!inputPath || busy} />
        <View style={styles.spacer} />
        <Button title="Open Signed PDF" onPress={onOpenSignedPdf} disabled={!signedPath} />
        <View style={styles.spacer} />
        <Button title="Share Signed PDF" onPress={onShareSignedPdf} disabled={!signedPath} />
        <View style={styles.spacer} />
        {inputPath ? <Text style={styles.path}>Input: {inputPath}</Text> : null}
        {signedPath ? <Text style={styles.path}>Signed: {signedPath}</Text> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    padding: 16,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    color: '#111111',
  },
  spacer: {
    height: 8,
  },
  path: {
    fontSize: 12,
    color: '#222222',
  },
  error: {
    color: 'red',
    fontSize: 12,
  },
});
