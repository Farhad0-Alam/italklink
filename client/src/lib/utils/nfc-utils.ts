// Web NFC API utilities for reading and writing NFC tags

export interface NFCReadResult {
  url?: string;
  text?: string;
  records?: any[];
}

export interface NFCWriteOptions {
  url: string;
  overwrite?: boolean;
}

// Check if device supports Web NFC API
export function hasNFCSupport(): boolean {
  return 'nfc' in navigator && typeof navigator.nfc !== 'undefined';
}

// Get browser/device support info
export function getNFCSupportInfo(): {
  supported: boolean;
  message: string;
  isAndroid: boolean;
} {
  const ua = navigator.userAgent.toLowerCase();
  const isAndroid = ua.includes('android');
  const isChrome = ua.includes('chrome') || ua.includes('chromium');
  const isEdge = ua.includes('edg');
  
  const supported = hasNFCSupport();
  
  if (supported) {
    return {
      supported: true,
      message: '✅ NFC supported on this device',
      isAndroid,
    };
  }
  
  if (!isAndroid) {
    return {
      supported: false,
      message: '❌ NFC works best on Android devices',
      isAndroid,
    };
  }
  
  if (!isChrome && !isEdge) {
    return {
      supported: false,
      message: '❌ Please use Chrome or Edge browser on Android',
      isAndroid,
    };
  }
  
  return {
    supported: false,
    message: '❌ NFC not supported on this device/browser',
    isAndroid,
  };
}

// Read data from an NFC tag
export async function readNFCTag(): Promise<NFCReadResult> {
  try {
    if (!hasNFCSupport()) {
      throw new Error('NFC is not supported on this device. Please use Chrome on Android.');
    }

    const ndef = await (navigator as any).nfc.scan();
    const result: NFCReadResult = {
      records: ndef.records,
    };

    // Extract URL and text from records
    for (const record of ndef.records) {
      if (record.recordType === 'url' || record.recordType === 'absolute-url') {
        const decoder = new TextDecoder();
        result.url = decoder.decode(record.data);
      }
      if (record.recordType === 'text') {
        const decoder = new TextDecoder();
        const text = decoder.decode(record.data);
        result.text = text.substring(3); // Skip language code
      }
    }

    return result;
  } catch (error: any) {
    if (error.name === 'NotAllowedError') {
      throw new Error('NFC read cancelled by user');
    }
    throw error;
  }
}

// Write a URL to an NFC tag
export async function writeNFCTag(options: NFCWriteOptions): Promise<void> {
  try {
    if (!hasNFCSupport()) {
      throw new Error('NFC is not supported on this device. Please use Chrome on Android.');
    }

    const message = {
      records: [
        {
          recordType: 'url',
          data: options.url,
        },
      ],
    };

    await (navigator as any).nfc.write(message);
  } catch (error: any) {
    if (error.name === 'NotAllowedError') {
      throw new Error('NFC write cancelled by user');
    }
    throw error;
  }
}

// Format NFC read result for display
export function formatNFCData(data: NFCReadResult): string {
  if (data.url) {
    return `URL: ${data.url}`;
  }
  if (data.text) {
    return `Text: ${data.text}`;
  }
  if (data.records && data.records.length > 0) {
    return `Records: ${data.records.length} found`;
  }
  return 'Empty tag';
}
