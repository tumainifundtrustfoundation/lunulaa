import firebaseConfig from '../../firebase-applet-config.json';

export interface DiagnosticsResult {
  success: boolean;
  apiKeyValid: boolean;
  apiEnabled: boolean;
  noKeyRestrictions: boolean;
  domainAuthorized: boolean;
  errorType: 'NONE' | 'API_KEY_INVALID' | 'RESTRICTED_KEY' | 'API_DISABLED' | 'UNAUTHORIZED_DOMAIN' | 'NETWORK_ERROR' | 'UNKNOWN';
  rawMessage: string;
  adviceSwahili: string;
  adviceEnglish: string;
}

export async function runFirebaseDiagnostics(): Promise<DiagnosticsResult> {
  const apiKey = firebaseConfig.apiKey;
  const projectId = firebaseConfig.projectId;
  const currentDomain = window.location.hostname;

  if (!apiKey) {
    return {
      success: false,
      apiKeyValid: false,
      apiEnabled: false,
      noKeyRestrictions: false,
      domainAuthorized: false,
      errorType: 'API_KEY_INVALID',
      rawMessage: 'API Key haipo kwenye faili la usakinishaji.',
      adviceSwahili: 'Tafadhali hakikisha umeingiza API Key sahihi kwenye mipangilio yako.',
      adviceEnglish: 'Please ensure you have configured a valid API Key in your setup.'
    };
  }

  try {
    // Attempt to make a request to the Identity Toolkit signUp endpoint with empty parameters to test API Key validation
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          returnSecureToken: true,
        }),
      }
    );

    const data = await response.json().catch(() => ({}));
    
    if (response.ok) {
      // Should not be ok since we didn't pass email/password, but if it is, the key is fully functional
      return {
        success: true,
        apiKeyValid: true,
        apiEnabled: true,
        noKeyRestrictions: true,
        domainAuthorized: true,
        errorType: 'NONE',
        rawMessage: 'Kila kitu kiko sawa kulingana na vipimo.',
        adviceSwahili: 'Muunganisho wako wa Firebase uko salama na unafanya kazi kikamilifu!',
        adviceEnglish: 'Your Firebase connection is secure and fully functional!'
      };
    }

    const errorCode = data?.error?.message || '';
    const status = response.status;

    // Analyze Google API responses
    if (status === 403) {
      if (errorCode.includes('API_KEY_SERVICE_BLOCKED') || errorCode.includes('not authorized to use this service')) {
        return {
          success: false,
          apiKeyValid: true,
          apiEnabled: false,
          noKeyRestrictions: false,
          domainAuthorized: true,
          errorType: 'RESTRICTED_KEY',
          rawMessage: `HTTP 403 Forbidden: ${errorCode}`,
          adviceSwahili: `API Key yako imezuiliwa (API Key Restrictions)! Kwenye Google Cloud Console > Credentials > bonyeza API Key yako ya sasa, kisha chini kabisa kwenye sehemu ya "API restrictions", hakikisha umechagua ama "Don't restrict key" (Inashauriwa wakati wa majaribio), AU umechagua "Restrict key" na ukaongeza "Identity Toolkit API" na "Token Service API" kwenye orodha ya huduma zilizoruhusiwa. Baada ya kubadilisha, subiri dakika 5 ili mabadiliko yaanze kufanya kazi.`,
          adviceEnglish: `Your API Key is restricted from using Firebase Auth! In Google Cloud Console > Credentials > click your active API Key, then scroll down to "API restrictions". Make sure to either set it to "Don't restrict key" (recommended for development), OR select "Restrict key" and explicitly check both "Identity Toolkit API" and "Token Service API" in the allowed APIs list. Allow up to 5 minutes for Google's servers to apply the changes.`
        };
      }
      
      if (errorCode.includes('HTTP_REFERER_BLOCKED') || errorCode.includes('referer') || errorCode.includes('domain')) {
        return {
          success: false,
          apiKeyValid: true,
          apiEnabled: true,
          noKeyRestrictions: false,
          domainAuthorized: false,
          errorType: 'UNAUTHORIZED_DOMAIN',
          rawMessage: `HTTP 403 Forbidden: ${errorCode}`,
          adviceSwahili: `Kivinjari cha Google kimezuia ombi hili kwa sababu ya vizuizi vya domain (Referrer Restrictions) kwenye API Key yako! Kwenye Google Cloud Console > Credentials, chagua API Key yako. Chini ya "Application restrictions", chagua "None" (Inashauriwa kwa maendeleo) au ongeza domain zifuatazo kwenye orodha: "lupanulla.co.tz", "*.europe-west1.run.app", na "*.google.com".`,
          adviceEnglish: `Google Cloud has blocked this request due to domain/referrer restrictions on your API Key! In Google Cloud Console > Credentials, select your API Key. Under "Application restrictions", choose "None" (recommended for development) or explicitly add these domains to your allowed list: "lupanulla.co.tz", "*.europe-west1.run.app", and "*.google.com".`
        };
      }

      return {
        success: false,
        apiKeyValid: true,
        apiEnabled: false,
        noKeyRestrictions: false,
        domainAuthorized: true,
        errorType: 'API_DISABLED',
        rawMessage: `HTTP 403 Forbidden: ${errorCode}`,
        adviceSwahili: `Huduma ya Identity Toolkit haijawezeshwa kwenye Google Cloud Project yako. Tafadhali nenda kwenye Google Cloud Console > Library, tafuta "Identity Toolkit API", na uibonyeze "Enable".`,
        adviceEnglish: `The Identity Toolkit API is not enabled on your Google Cloud Project. Please go to Google Cloud Console > Library, search for "Identity Toolkit API", and click "Enable".`
      };
    }

    if (errorCode === 'API_KEY_INVALID') {
      return {
        success: false,
        apiKeyValid: false,
        apiEnabled: false,
        noKeyRestrictions: false,
        domainAuthorized: false,
        errorType: 'API_KEY_INVALID',
        rawMessage: `HTTP 400 Bad Request: ${errorCode}`,
        adviceSwahili: `API Key iliyowekwa si sahihi au imefutwa kwenye Google Cloud Console. Tafadhali thibitisha API Key yako ya sasa.`,
        adviceEnglish: `The configured API Key is invalid or has been deleted from Google Cloud Console. Please double-check your active API Key.`
      };
    }

    if (errorCode === 'MISSING_EMAIL') {
      // The API key successfully connected and the request was evaluated!
      // This means the API key is 100% valid, has no restrictions, and Firebase Auth is enabled!
      return {
        success: true,
        apiKeyValid: true,
        apiEnabled: true,
        noKeyRestrictions: true,
        domainAuthorized: true,
        errorType: 'NONE',
        rawMessage: 'Muunganisho umefanikiwa kikamilifu!',
        adviceSwahili: 'API Key na Firebase Auth viko tayari na vinafanya kazi kikamilifu! Kama bado unapata "auth/internal-error", hakikisha mbinu ya "Email/Password" imewezeshwa chini ya Authentication > Sign-in method kwenye Firebase Console yako.',
        adviceEnglish: 'API Key and Firebase Auth are 100% ready and operational! If you still experience "auth/internal-error", please make sure that the "Email/Password" sign-in method is enabled under Authentication > Sign-in method in your Firebase Console.'
      };
    }

    return {
      success: false,
      apiKeyValid: true,
      apiEnabled: true,
      noKeyRestrictions: true,
      domainAuthorized: true,
      errorType: 'UNKNOWN',
      rawMessage: `Hitilafu ya Google API: ${errorCode || 'Haijulikani'} (Status: ${status})`,
      adviceSwahili: `Kuna hitilafu isiyojulikana imerejeshwa kutoka Firebase: ${errorCode || 'Hakuna maelezo'}. Tafadhali thibitisha ikiwa mradi wako wa Firebase umewezeshwa vizuri kwa kuingia.`,
      adviceEnglish: `An unknown error was returned from Firebase: ${errorCode || 'No details'}. Please check if your Firebase project is properly configured for authentication.`
    };

  } catch (err: any) {
    console.error('Firebase diagnostics fetch failed:', err);
    return {
      success: false,
      apiKeyValid: false,
      apiEnabled: false,
      noKeyRestrictions: false,
      domainAuthorized: false,
      errorType: 'NETWORK_ERROR',
      rawMessage: `Mtandao umefeli: ${err.message || err}`,
      adviceSwahili: `Imeshindwa kuwasiliana na seva za Firebase Identity. Tafadhali thibitisha kuwa haujafunga huduma hii kwa kizuia matangazo (AdBlocker/Brave Shield) au vizuizi vingine vya mtandao.`,
      adviceEnglish: `Failed to contact Firebase Identity servers. Please verify that your network connection is unrestricted, and you are not using aggressive AdBlockers or Brave Shields that block Google APIs.`
    };
  }
}
