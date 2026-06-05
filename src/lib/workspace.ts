import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User, signOut } from 'firebase/auth';
import type { GoogleContactAPIResponse, Contact } from '../types';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App gracefully (no double-initialization)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
// Required Scope permissions for Contacts lookup & raw Gmail transmission
provider.addScope('https://www.googleapis.com/auth/gmail.send');
provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
provider.addScope('https://www.googleapis.com/auth/userinfo.profile');
provider.addScope('https://www.googleapis.com/auth/userinfo.email');

// Force Google Account Selector
provider.setCustomParameters({
  prompt: 'select_account'
});

let isSigningIn = false;
let cachedAccessToken: string | null = null;

// Initialize auth state and listen for login success
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else {
        // Since Firebase SDK state persists on reload but credentialFromResult doesn't,
        // we handle interactive login. However, for seamless fallback, we can trigger login or mark state
        if (!isSigningIn) {
          if (onAuthFailure) onAuthFailure();
        }
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to extract Google Access Token from Firebase auth credential result.');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Workspace login error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const googleSignOut = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

/**
 * Searches the user's real Google Contacts for a contact containing the requested phone number.
 */
export const searchGoogleContactsByPhone = async (phoneNumber: string, token: string): Promise<Contact | null> => {
  try {
    // Sanitize search digits
    const queryDigits = phoneNumber.replace(/[^0-9]/g, '');
    if (queryDigits.length < 5) return null;

    // Direct fetch to people API connections list
    const response = await fetch(
      'https://people.googleapis.com/v1/people/me/connections?personFields=names,phoneNumbers,emailAddresses&pageSize=1000',
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Google People API responded with status ${response.status}`);
    }

    const data = await response.json();
    const connections = data.connections || [];

    for (const person of connections) {
      const phones = person.phoneNumbers || [];
      const emails = person.emailAddresses || [];
      const names = person.names || [];

      // Check if any registered number matches the searched digits
      const matchPhone = phones.find((p: any) => {
        const canonical = p.canonicalForm || p.value || '';
        const cleanCanonical = canonical.replace(/[^0-9]/g, '');
        return cleanCanonical.includes(queryDigits) || queryDigits.includes(cleanCanonical);
      });

      if (matchPhone && emails.length > 0) {
        const primaryName = names.find((n: any) => n.metadata?.primary) || names[0];
        const primaryEmail = emails.find((e: any) => e.metadata?.primary) || emails[0];

        return {
          name: primaryName?.displayName || 'Autodetected Contact',
          phone: matchPhone.value,
          email: primaryEmail?.value || '',
          companyName: 'Google Contacts Sync',
          syncedFrom: 'Google Workspace'
        };
      }
    }
    return null;
  } catch (err) {
    console.error('Error querying Google Contacts connection endpoints:', err);
    return null;
  }
};

/**
 * Encodes an HTML message to URL-Safe MIME-raw format
 */
export const constructMimeMessage = (
  to: string,
  fromName: string,
  fromEmail: string,
  subject: string,
  htmlContent: string,
  textContent: string
): string => {
  const boundary = "work_automation_envelope_boundary";
  const messageParts = [
    `To: <${to}>`,
    `Subject: ${subject}`,
    `From: "${fromName}" <${fromEmail}>`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: 7bit',
    '',
    textContent,
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    'Content-Transfer-Encoding: 7bit',
    '',
    htmlContent,
    '',
    `--${boundary}--`
  ];

  const fullMime = messageParts.join('\r\n');
  
  // Safe btoa transformation supporting Unicode characters
  return btoa(unescape(encodeURIComponent(fullMime)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

/**
 * Transmits a Raw Email payload via the logged-in user's Gmail Send API
 */
export const sendRawGmail = async (toEmail: string, subject: string, htmlBody: string, textBody: string, token: string): Promise<any> => {
  // Get sender's info
  const profileRes = await fetch('https://www.googleapis.com/oauth2/v1/userinfo?alt=json', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  let senderName = "Official Integration Admin";
  let senderEmail = "me";
  if (profileRes.ok) {
    const profile = await profileRes.json();
    senderName = profile.name || senderName;
    senderEmail = profile.email || senderEmail;
  }

  const rawMime = constructMimeMessage(toEmail, senderName, senderEmail, subject, htmlBody, textBody);

  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ raw: rawMime })
  });

  if (!response.ok) {
    const errorDetail = await response.text();
    throw new Error(`Gmail API error (${response.status}): ${errorDetail}`);
  }

  return response.json();
};
