import React from 'react';
import { View, Button, Text, StyleSheet, Alert, Platform } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

export default function PDFScreen() {
  const generatePDF = async () => {
    try {
      // Define your HTML content
      const html = `
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          </head>
          <body>
            <h1>My PDF Document</h1>
            <p>This is a PDF document generated from HTML.</p>
          </body>
        </html>
      `;

      // Generate PDF file
      const { uri } = await Print.printToFileAsync({ html });
      console.log('File has been saved to:', uri);

      // Optionally move the file to a more accessible location
      const newPath = `${FileSystem.documentDirectory}MyGeneratedPDF.pdf`;
      await FileSystem.moveAsync({
        from: uri,
        to: newPath,
      });

      // Share the PDF file
      if (Platform.OS === 'android' && !(await Sharing.isAvailableAsync())) {
        Alert.alert('Sharing is not available on this device');
        return;
      }

      await Sharing.shareAsync(newPath);
      Alert.alert('PDF Generated', `PDF saved at ${newPath}`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      Alert.alert('Error', 'Failed to generate PDF');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Generate PDF</Text>
      <Button title="Generate PDF" onPress={generatePDF} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
  },
});
