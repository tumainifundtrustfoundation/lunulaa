import firebaseConfig from '../../firebase-applet-config.json';
import { getAccessToken } from '../firebase';

export interface PickedFile {
  id: string;
  name: string;
  mimeType: string;
  url: string;
  sizeBytes?: number;
  description?: string;
  thumbnailUrl?: string;
}

interface OpenPickerOptions {
  mimeType?: string;
  onSelected: (files: PickedFile[]) => void;
  onCancel?: () => void;
}

let isScriptLoading = false;
let scriptLoadPromise: Promise<void> | null = null;

/**
 * Dynamically load the Google API client script and Picker library
 */
export const loadGooglePicker = (): Promise<void> => {
  if (scriptLoadPromise) return scriptLoadPromise;

  scriptLoadPromise = new Promise((resolve, reject) => {
    // If already loaded
    if ((window as any).gapi?.load) {
      const gapi = (window as any).gapi;
      gapi.load('client:picker', {
        callback: () => resolve(),
        onerror: () => reject(new Error('Kushindwa kupakia Google Picker library.')),
        timeout: 10000,
        ontimeout: () => reject(new Error('Kupakia Google Picker kumesimama kwa muda mrefu (timeout).'))
      });
      return;
    }

    if (isScriptLoading) return;
    isScriptLoading = true;

    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      const gapi = (window as any).gapi;
      if (!gapi) {
        reject(new Error('Mazingira ya gapi hayajapatikana baada ya kupakia script.'));
        return;
      }
      
      gapi.load('client:picker', {
        callback: () => {
          isScriptLoading = false;
          resolve();
        },
        onerror: () => {
          isScriptLoading = false;
          reject(new Error('Kushindwa kuanzisha Google Picker.'));
        }
      });
    };

    script.onerror = () => {
      isScriptLoading = false;
      reject(new Error('Kushindwa kupakia faili la kuanzisha Google API (api.js).'));
    };

    document.body.appendChild(script);
  });

  return scriptLoadPromise;
};

/**
 * Open the Google Picker dialog
 */
export const openGooglePicker = async ({ mimeType, onSelected, onCancel }: OpenPickerOptions): Promise<void> => {
  await loadGooglePicker();

  const token = getAccessToken();
  if (!token) {
    throw new Error('OAuth Token haipatikani. Tafadhali unganisha akaunti yako ya Google kwanza.');
  }

  const gapi = (window as any).gapi;
  const google = (window as any).google;

  if (!google?.picker) {
    throw new Error('Google Picker API haijapakia kikamilifu.');
  }

  const apiKey = firebaseConfig.apiKey;
  const appId = firebaseConfig.projectId; // Or projectId

  // Setup view
  let view = new google.picker.DocsView(google.picker.ViewId.DOCS);
  if (mimeType) {
    view.setMimeTypes(mimeType);
  }

  const pickerCallback = (data: any) => {
    const action = data[google.picker.Response.ACTION];
    if (action === google.picker.Action.PICKED) {
      const documents = data[google.picker.Response.DOCUMENTS] || [];
      const pickedFiles: PickedFile[] = documents.map((doc: any) => ({
        id: doc[google.picker.Document.ID],
        name: doc[google.picker.Document.NAME],
        mimeType: doc[google.picker.Document.MIME_TYPE],
        url: doc[google.picker.Document.URL],
        sizeBytes: doc[google.picker.Document.SIZE_BYTES],
        description: doc[google.picker.Document.DESCRIPTION],
        thumbnailUrl: doc[google.picker.Document.THUMBNAIL_URL],
      }));
      onSelected(pickedFiles);
    } else if (action === google.picker.Action.CANCEL) {
      if (onCancel) {
        onCancel();
      }
    }
  };

  try {
    const builder = new google.picker.PickerBuilder()
      .setDeveloperKey(apiKey)
      .setAppId(appId)
      .setOAuthToken(token)
      .addView(view)
      .setCallback(pickerCallback);

    // Support multiselect optionally
    builder.enableFeature(google.picker.Feature.MULTISELECT_ENABLED);

    const picker = builder.build();
    picker.setVisible(true);
  } catch (err: any) {
    console.error('Picker initialization error:', err);
    throw new Error('Kuna shida katika kuanzisha Google Picker: ' + err.message);
  }
};
