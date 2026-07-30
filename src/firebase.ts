import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signInAnonymously
} from 'firebase/auth';
import {
  initializeFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  addDoc,
  deleteDoc,
  increment,
  arrayUnion,
  arrayRemove,
  orderBy,
  onSnapshot,
  persistentLocalCache,
  persistentMultipleTabManager,
  memoryLocalCache,
  getDocFromServer,
  serverTimestamp
} from 'firebase/firestore';
import { UserProfile, DocumentMetadata, Comment, UserRole, SubscriptionTier, DocumentStatus, Announcement, Product, Video, Order, AppNotification, Feedback, Certificate, ExamResult, AuditLog, SystemConfig, EducationalResource, HighlightAnnotation, UserBookmark, WebsiteNews, PaymentTransaction, QuickBuyOrder, NectaProgress, StudyEvent } from './types';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Use initializeFirestore with a highly resilient fallback chain to handle sandboxed iframe restrictions and proxy limitations
const firestoreDbId = (firebaseConfig as any).firestoreDatabaseId;
const dbId = firestoreDbId && firestoreDbId !== '(default)' ? firestoreDbId : undefined;

let dbInstance: any;

try {
  // Try 1: Resilient long polling connection with persistent cache (best compatibility in sandboxed iframes & proxies)
  dbInstance = initializeFirestore(app, {
    experimentalForceLongPolling: true,
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  }, dbId);
} catch (err1) {
  console.warn("Long-polling persistent cache init failed, trying memory cache with long-polling:", err1);
  try {
    // Try 2: Resilient long-polling connection with memory cache (resolves blocked IndexedDB inside iframes)
    dbInstance = initializeFirestore(app, {
      experimentalForceLongPolling: true,
      localCache: memoryLocalCache()
    }, dbId);
  } catch (err2) {
    console.warn("Long-polling memory cache init failed, trying standard connection with persistent cache:", err2);
    try {
      // Try 3: Standard connection (WebSockets) with persistent cache
      dbInstance = initializeFirestore(app, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager()
        })
      }, dbId);
    } catch (err3) {
      console.warn("Standard persistent cache failed, trying standard with memory cache:", err3);
      try {
        // Try 4: Standard connection with memory cache
        dbInstance = initializeFirestore(app, {
          localCache: memoryLocalCache()
        }, dbId);
      } catch (err4) {
        console.error("All Firestore initializations failed, falling back to default:", err4);
        dbInstance = initializeFirestore(app, {}, dbId);
      }
    }
  }
}

export const db = dbInstance;

// Validate Connection to Firestore (Skill Requirement)
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firestore connection test completed successfully.");
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firestore offline mode active: Please check your Firebase configuration if you expect live sync.");
    } else {
      console.warn("Firestore offline warning / validation check info:", error);
    }
  }
}
testConnection();

// --- Firestore Error Handling (Skill Requirement) ---
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error Details:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
// ----------------------------------------------------

// Configure Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
// Request drive scope to view and upload files, gmail, documents, and classroom data
googleProvider.addScope('https://www.googleapis.com/auth/drive');
googleProvider.addScope('https://mail.google.com/');
googleProvider.addScope('https://www.googleapis.com/auth/documents');
googleProvider.addScope('https://www.googleapis.com/auth/classroom.courses.readonly');
googleProvider.addScope('https://www.googleapis.com/auth/classroom.coursework.me.readonly');
googleProvider.addScope('https://www.googleapis.com/auth/classroom.coursework.students.readonly');

// In-memory token cache
let cachedAccessToken: string | null = null;
let isSigningIn = false;

/**
 * Custom sign in with Google that returns the user and OAuth access token
 */
export const signInWithGoogle = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken;
    if (!token) {
      throw new Error('Hukuweza kupata Token ya Google Drive. Tafadhali hakikisha umekubali ruhusa zote.');
    }
    cachedAccessToken = token;
    
    // Auto-create or fetch user profile
    await ensureUserProfile(result.user, result.user.displayName || 'Google User');
    
    return { user: result.user, accessToken: token };
  } catch (err: any) {
    console.error('Google Sign In Error:', err);
    
    if (err.code === 'auth/popup-closed-by-user') {
      throw new Error('Dirisha la kuingia limefungwa kabla ya kumaliza. Tafadhali ruhusu "Popups" kwenye kivinjari chako na usifunge dirisha mapema.');
    } else if (err.code === 'auth/cancelled-popup-request') {
      throw new Error('Ombi la kuingia lilighairiwa. Tafadhali jaribu tena.');
    } else if (err.code === 'auth/popup-blocked') {
      throw new Error('Kivinjari chako kimezuia dirisha la kuingia (Popup). Tafadhali ruhusu Popups kwa tovuti hii ili uweze kuingia.');
    } else if (err.code === 'auth/unauthorized-domain' || (err.message && err.message.includes('auth/unauthorized-domain'))) {
      const hostname = window.location.hostname;
      const errorObj = {
        code: 'auth/unauthorized-domain',
        message: `Domain '${hostname}' haijaidhinishwa kwenye Firebase Console yako ya mradi wa Lupanulla.`,
        hostname,
        projectId: firebaseConfig.projectId
      };
      throw new Error(JSON.stringify(errorObj));
    }
    
    throw err;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Custom sign in anonymously as a Guest student
 */
export const signInAsGuest = async (): Promise<User | null> => {
  try {
    const result = await signInAnonymously(auth);
    try {
      await updateProfile(result.user, { displayName: 'Mgeni Lupanulla' });
    } catch (pErr) {
      console.warn('Could not update guest profile name:', pErr);
    }
    await ensureUserProfile(result.user, 'Mgeni Lupanulla');
    return result.user;
  } catch (err: any) {
    if (err.code === 'auth/admin-restricted-operation' || err.code === 'auth/operation-not-allowed') {
      console.warn('Firebase Anonymous Auth is disabled on Firebase Console (admin-restricted-operation). App will use local guest profile fallback.');
      return null;
    }
    console.warn('Guest Sign In warning:', err?.message || err);
    return null;
  }
};

/**
 * Sign out of Firebase and clear cached token
 */
export const logoutUser = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

/**
 * Retrieve the current cached access token (or prompt re-login if expired/missing)
 */
export const getAccessToken = (): string | null => {
  return cachedAccessToken;
};

/**
 * Setup access token manually (for debugging or direct updates)
 */
export const setAccessToken = (token: string | null) => {
  cachedAccessToken = token;
};

/**
 * Submits student feedback to Firestore
 */
export const submitFeedback = async (feedback: Omit<Feedback, 'id' | 'createdAt' | 'status'>): Promise<string> => {
  const path = 'feedback';
  try {
    const colRef = collection(db, path);
    const docRef = await addDoc(colRef, {
      ...feedback,
      createdAt: Date.now(),
      status: 'new'
    });
    return docRef.id;
  } catch (err: any) {
    handleFirestoreError(err, OperationType.CREATE, path);
    throw err;
  }
};

/**
 * Helper to ensure a profile exists in Firestore for the authenticated user
 */
export const ensureUserProfile = async (user: User, displayName: string, additionalFields?: Partial<UserProfile>): Promise<UserProfile> => {
  const isSuperAdmin = user.uid === 'a9wJ0DcKpkN9I9iyO2yQzcI7VlT2' || user.email?.toLowerCase() === 'lupanulla.co.tz@gmail.com';
  
  // Google sign in or anonymous guest sign in should be pre-verified. 
  // Custom email/password signups should specify emailVerified: false in additionalFields.
  const defaultVerified = user.emailVerified || user.isAnonymous || false;

  const profile: UserProfile = {
    uid: user.uid,
    name: displayName,
    email: user.email || '',
    role: isSuperAdmin ? 'super_admin' : 'student',
    subscription: isSuperAdmin ? 'premium' : 'free',
    createdAt: Date.now(),
    emailVerified: defaultVerified,
    xp: 0,
    studyTime: 0,
    ...additionalFields
  };

  try {
    const userRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userRef);
    
    if (snap.exists()) {
      const existing = snap.data() as UserProfile;
      // If super_admin, always ensure they are super_admin and have premium subscription
      if (isSuperAdmin && (existing.role !== 'super_admin' || existing.subscription !== 'premium')) {
        const updates: Partial<UserProfile> = {};
        if (existing.role !== 'super_admin') updates.role = 'super_admin';
        if (existing.subscription !== 'premium') updates.subscription = 'premium';
        await updateDoc(userRef, updates);
        existing.role = 'super_admin';
        existing.subscription = 'premium';
      }
      return existing;
    }
    
    await setDoc(userRef, profile);
  } catch (err: any) {
    console.warn('ensureUserProfile offline/network fallback triggered:', err.message || err);
  }
  
  return profile;
};

/**
 * User Bookmarks (Hifadhi)
 */
export const toggleBookmark = async (
  userId: string, 
  resource: { id: string; type: 'document' | 'exam' | 'video' | 'news'; title: string }
): Promise<boolean> => {
  const path = 'user_bookmarks';
  try {
    const colRef = collection(db, path);
    const q = query(colRef, where('userId', '==', userId), where('resourceId', '==', resource.id));
    const snap = await getDocs(q);

    if (!snap.empty) {
      // Remove bookmark
      const bookmarkId = snap.docs[0].id;
      await deleteDoc(doc(db, path, bookmarkId));
      return false; // Not bookmarked anymore
    } else {
      // Add bookmark
      await addDoc(colRef, {
        userId,
        resourceId: resource.id,
        resourceTitle: resource.title,
        resourceType: resource.type,
        addedAt: Date.now()
      });
      return true; // Bookmarked
    }
  } catch (err: any) {
    console.error('toggleBookmark error:', err);
    return false;
  }
};

export const fetchUserBookmarks = async (userId: string): Promise<UserBookmark[]> => {
  const path = 'user_bookmarks';
  try {
    const colRef = collection(db, path);
    const q = query(colRef, where('userId', '==', userId), orderBy('addedAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as UserBookmark));
  } catch (err: any) {
    // Fallback if index not ready
    try {
      const colRef = collection(db, path);
      const q = query(colRef, where('userId', '==', userId));
      const snap = await getDocs(q);
      return snap.docs
        .map(d => ({ id: d.id, ...d.data() } as UserBookmark))
        .sort((a, b) => b.addedAt - a.addedAt);
    } catch (e) {
      console.error('fetchUserBookmarks error:', e);
      return [];
    }
  }
};

/**
 * Update user's profile metadata in Firestore
 */
export const updateUserProfile = async (uid: string, updates: Partial<UserProfile>): Promise<void> => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, updates);
  } catch (err: any) {
    console.warn('updateUserProfile failed (likely offline):', err.message || err);
  }
};

/**
 * Award study points and track study time
 */
export const awardStudyPoints = async (uid: string, points: number, durationMinutes: number): Promise<void> => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      xp: increment(points),
      studyTime: increment(durationMinutes)
    });
  } catch (err: any) {
    console.warn('awardStudyPoints offline/network fallback triggered:', err.message || err);
  }
};

/**
 * Fetch a user's profile from Firestore
 */
export const fetchUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    return snap.exists() ? (snap.data() as UserProfile) : null;
  } catch (err: any) {
    console.warn('fetchUserProfile offline/network fallback triggered:', err.message || err);
    return null;
  }
};

/**
 * Get all users (Admin only)
 */
export const fetchAllUsers = async (): Promise<UserProfile[]> => {
  const colRef = collection(db, 'users');
  const snap = await getDocs(colRef);
  return snap.docs.map(d => d.data() as UserProfile);
};

/**
 * Toggle a topic in user's favorites
 */
export const toggleTopicFavorite = async (uid: string, topicId: string, isAdding: boolean): Promise<void> => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      favorites: isAdding ? arrayUnion(topicId) : arrayRemove(topicId)
    });
  } catch (err: any) {
    console.warn('toggleTopicFavorite failed:', err.message || err);
    throw err;
  }
};

/**
 * Upload a document record to Firestore
 */
export const saveDocumentMetadata = async (
  docData: Omit<DocumentMetadata, 'id' | 'createdAt' | 'views' | 'status'> & { 
    status?: DocumentStatus,
    createdAt?: number,
    views?: number
  }
): Promise<string> => {
  const docRef = doc(collection(db, 'documents'));
  const fullDoc: DocumentMetadata = {
    ...docData,
    id: docRef.id,
    createdAt: docData.createdAt || Date.now(),
    views: docData.views || 0,
    status: docData.status || 'pending', // Requires admin approval by default
    rating: 5,
    downloadsCount: 0
  };
  await setDoc(docRef, fullDoc);
  return docRef.id;
};

/**
 * Get a specific document by its Firestore ID
 */
export const fetchDocumentById = async (id: string): Promise<DocumentMetadata | null> => {
  try {
    const docRef = doc(db, 'documents', id);
    const snap = await getDoc(docRef);
    return snap.exists() ? (snap.data() as DocumentMetadata) : null;
  } catch (err: any) {
    console.warn(`fetchDocumentById error for ${id} (likely offline):`, err.message || err);
    return null;
  }
};

/**
 * Increment views on a document
 */
export const incrementDocumentViews = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, 'documents', id);
    await updateDoc(docRef, { views: increment(1) });
  } catch (err: any) {
    console.warn(`incrementDocumentViews error for ${id} (likely offline):`, err.message || err);
  }
};

/**
 * Increment downloads on a document
 */
export const incrementDocumentDownloads = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, 'documents', id);
    await updateDoc(docRef, { downloadsCount: increment(1) });
  } catch (err: any) {
    console.warn(`incrementDocumentDownloads error for ${id} (likely offline):`, err.message || err);
  }
};

/**
 * Update document status or info
 */
export const updateDocument = async (id: string, updates: Partial<DocumentMetadata>): Promise<void> => {
  try {
    const docRef = doc(db, 'documents', id);
    await updateDoc(docRef, updates);
  } catch (err: any) {
    console.warn(`updateDocument error for ${id} (likely offline):`, err.message || err);
  }
};

/**
 * Delete a document from Firestore
 */
export const deleteDocumentMetadata = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, 'documents', id);
    await deleteDoc(docRef);
  } catch (err: any) {
    console.warn(`deleteDocumentMetadata error for ${id} (likely offline):`, err.message || err);
  }
};

/**
 * Fetch list of documents with filters
 */
export const fetchDocuments = async (filters?: {
  category?: string;
  uploadedBy?: string;
  status?: DocumentStatus;
}): Promise<DocumentMetadata[]> => {
  const path = 'documents';
  try {
    const colRef = collection(db, path);
    let q = query(colRef);
    
    if (filters?.category) {
      q = query(q, where('category', '==', filters.category));
    }
    if (filters?.uploadedBy) {
      q = query(q, where('uploadedBy', '==', filters.uploadedBy));
    }
    if (filters?.status) {
      q = query(q, where('status', '==', filters.status));
    }
    
    // Note: We avoid adding orderBy('createdAt', 'desc') here to prevent "missing index" errors
    // unless the developer has specifically created the composite indexes in Firebase Console.
    // Sorting is handled in-memory in the components for better reliability.
    
    const snap = await getDocs(q);
    
    // Auto-seed initial documents if collection is empty
    if (snap.empty && !filters?.uploadedBy) {
      console.log('Seeding initial documents to Firestore...');
      const INITIAL_DOCS: Omit<DocumentMetadata, 'id'>[] = [
        {
          title: "You Can't Beat God Givin'",
          description: "Miracle Testimonies from Ordinary People Serving an Extraordinary God. Jifunze kanuni ya kiungu ya baraka kupitia utoaji wa moyo.",
          category: "Maendeleo Binafsi",
          subject: "Maendeleo Binafsi",
          tags: ["Motivation", "Giving", "R.W. Schambach"],
          fileId: "seed-schambach-book",
          driveUrl: "https://example.com/books/you-cant-beat-god-givin.pdf",
          uploadedBy: "system",
          uploadedByName: "Lupanulla Admin",
          createdAt: Date.now(),
          views: 1200,
          status: "approved",
          downloadsCount: 450,
          rating: 5,
          type: "books"
        },
        {
          title: "NECTA Form 4 Basic Math - 2025",
          description: "Mtihani wa Taifa wa Kidato cha Nne (CSEE) - Hisabati ya Kawaida. Maswali na Majibu yaliyohakikiwa.",
          category: "Mathematics",
          subject: "Mathematics",
          tags: ["NECTA", "CSEE", "Past Papers"],
          fileId: "seed-necta-math",
          driveUrl: "https://necta.go.tz",
          uploadedBy: "system",
          uploadedByName: "Lupanulla Admin",
          createdAt: Date.now() - 86400000,
          views: 3500,
          status: "approved",
          downloadsCount: 890,
          rating: 4.8,
          type: "past_papers"
        }
      ];

      for (const docData of INITIAL_DOCS) {
        await saveDocumentMetadata(docData as any);
      }

      // Re-run query after seeding
      const reSnap = await getDocs(q);
      return reSnap.docs.map(d => ({ id: d.id, ...d.data() } as DocumentMetadata));
    }

    return snap.docs.map(d => ({ id: d.id, ...d.data() } as DocumentMetadata));
  } catch (err: any) {
    if (err.code === 'permission-denied') {
      console.warn('fetchDocuments: Permission denied. Access restricted or user not signed in.');
      return [];
    }
    
    // If it's a missing index error, don't throw, just log and return empty to trigger local seeds
    if (err.code === 'failed-precondition' || (err.message && err.message.includes('index'))) {
      console.warn('Firestore index missing for complex query, falling back to simple query or memory sort.');
      // Simple fallback query
      try {
        const simpleQ = query(collection(db, path), where('status', '==', 'approved'));
        const snap = await getDocs(simpleQ);
        return snap.docs.map(d => ({ id: d.id, ...d.data() } as DocumentMetadata));
      } catch (innerErr) {
        return [];
      }
    }

    try {
      handleFirestoreError(err, OperationType.LIST, path);
    } catch (e) {
      // Just log and return empty to avoid crashing UI
    }
    return [];
  }
};

/**
 * Fetch and post comments/reviews for a document
 */
export const fetchComments = async (documentId: string): Promise<Comment[]> => {
  const colRef = collection(db, 'comments');
  try {
    const q = query(colRef, where('documentId', '==', documentId), orderBy('createdAt', 'desc'));
    try {
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Comment));
    } catch (e) {
      // If indexing is building or missing order by index, fallback to sorting in memory
      const simpleQ = query(colRef, where('documentId', '==', documentId));
      const simpleSnap = await getDocs(simpleQ);
      return simpleSnap.docs
        .map(d => ({ id: d.id, ...d.data() } as Comment))
        .sort((a, b) => b.createdAt - a.createdAt);
    }
  } catch (err: any) {
    console.warn('fetchComments offline/network error:', err.message || err);
    return [];
  }
};

export const addComment = async (documentId: string, userId: string, userName: string, text: string): Promise<Comment> => {
  const commentData = {
    documentId,
    userId,
    userName,
    text,
    createdAt: Date.now()
  };
  try {
    const colRef = collection(db, 'comments');
    const docRef = await addDoc(colRef, commentData);
    return {
      id: docRef.id,
      ...commentData
    };
  } catch (err: any) {
    console.warn('addComment error (offline):', err.message || err);
    return {
      id: 'local_temp_' + Date.now(),
      ...commentData
    };
  }
};

/**
 * Lupanulla Announcements (Matangazo)
 */
export const fetchAnnouncements = async (): Promise<Announcement[]> => {
  const path = 'matangazo';
  try {
    const colRef = collection(db, path);
    const snap = await getDocs(colRef);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Announcement));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};

export const saveAnnouncement = async (annData: Omit<Announcement, 'id' | 'createdAt'>): Promise<string> => {
  try {
    const colRef = collection(db, 'matangazo');
    const payload = {
      ...annData,
      createdAt: Date.now()
    };
    const docRef = await addDoc(colRef, payload);
    
    // Broadcast notification to ALL users
    await addNotification({
      userId: 'all',
      title: 'Tangazo Jipya! 📢',
      message: `${annData.title} - ${annData.desc.substring(0, 80)}${annData.desc.length > 80 ? '...' : ''}`,
      type: 'update',
      link: 'matangazo'
    });
    
    return docRef.id;
  } catch (err: any) {
    console.warn('saveAnnouncement error:', err.message || err);
    return 'offline_' + Date.now();
  }
};

export const updateAnnouncement = async (id: string, updates: Partial<Announcement>): Promise<void> => {
  try {
    const docRef = doc(db, 'matangazo', id);
    await updateDoc(docRef, updates);
  } catch (err: any) {
    console.warn('updateAnnouncement error:', err.message || err);
  }
};

export const deleteAnnouncement = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, 'matangazo', id);
    await deleteDoc(docRef);
  } catch (err: any) {
    console.warn('deleteAnnouncement error:', err.message || err);
  }
};

/**
 * Lupanulla Products (Duka)
 */
export const fetchProducts = async (): Promise<Product[]> => {
  const path = 'products';
  try {
    const colRef = collection(db, path);
    const snap = await getDocs(colRef);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Product));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};

export const saveProduct = async (prodData: Omit<Product, 'id'>): Promise<string> => {
  try {
    const colRef = collection(db, 'products');
    const docRef = await addDoc(colRef, prodData);
    
    // Broadcast notification to ALL users
    await addNotification({
      userId: 'all',
      title: 'Bidhaa Mpya Dukani! 🛒',
      message: `Tumeongeza "${prodData.name}" kwenye duka letu la Lupanulla Elimu Hub. Bonyeza hapa kuagiza sasa!`,
      type: 'update',
      link: 'duka'
    });
    
    return docRef.id;
  } catch (err: any) {
    console.warn('saveProduct error:', err.message || err);
    return 'offline_' + Date.now();
  }
};

export const updateProduct = async (id: string, updates: Partial<Product>): Promise<void> => {
  try {
    const docRef = doc(db, 'products', id);
    await updateDoc(docRef, updates);
  } catch (err: any) {
    console.warn('updateProduct error:', err.message || err);
  }
};

export const deleteProduct = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, 'products', id);
    await deleteDoc(docRef);
  } catch (err: any) {
    console.warn('deleteProduct error:', err.message || err);
  }
};

/**
 * Lupanulla Videos (Lupa+ Video Class)
 */
export const fetchVideos = async (): Promise<Video[]> => {
  const path = 'videos';
  try {
    const colRef = collection(db, path);
    const snap = await getDocs(colRef);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Video));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};

export const saveVideo = async (vidData: Omit<Video, 'id'>): Promise<string> => {
  try {
    const colRef = collection(db, 'videos');
    const payload = {
      ...vidData,
      views: 0,
      createdAt: Date.now()
    };
    const docRef = await addDoc(colRef, payload);
    
    // Broadcast notification to ALL users
    await addNotification({
      userId: 'all',
      title: 'Darasani Video Mpya! 🎥',
      message: `Darasa jipya la video "${vidData.title}" limeongezwa chini ya somo la ${vidData.subject || 'Lupanulla'}. Jifunze sasa hapa!`,
      type: 'update',
      link: 'videos'
    });
    
    return docRef.id;
  } catch (err: any) {
    console.warn('saveVideo error:', err.message || err);
    return 'offline_' + Date.now();
  }
};

export const updateVideo = async (id: string, updates: Partial<Video>): Promise<void> => {
  try {
    const docRef = doc(db, 'videos', id);
    await updateDoc(docRef, updates);
  } catch (err: any) {
    console.warn('updateVideo error:', err.message || err);
  }
};

export const deleteVideo = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, 'videos', id);
    await deleteDoc(docRef);
  } catch (err: any) {
    console.warn('deleteVideo error:', err.message || err);
  }
};

/**
 * Lupanulla Orders (Agiza Checkout)
 */
export const saveOrder = async (orderData: Order): Promise<string> => {
  try {
    const colRef = collection(db, 'orders');
    const payload = {
      ...orderData,
      createdAt: Date.now()
    };
    const docRef = await addDoc(colRef, payload);
    return docRef.id;
  } catch (err: any) {
    console.warn('saveOrder error:', err.message || err);
    return 'offline_' + Date.now();
  }
};

export const fetchOrders = async (): Promise<Order[]> => {
  try {
    const colRef = collection(db, 'orders');
    const snap = await getDocs(colRef);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Order));
  } catch (error) {
    console.error('fetchOrders error:', error);
    return [];
  }
};

/**
 * Lupanulla Notifications system using Firestore Subscriptions
 */
export const addNotification = async (notifData: Omit<AppNotification, 'id' | 'createdAt' | 'read'>): Promise<string> => {
  try {
    const colRef = collection(db, 'notifications');
    const payload = {
      ...notifData,
      read: false,
      createdAt: Date.now()
    };
    const docRef = await addDoc(colRef, payload);
    return docRef.id;
  } catch (err: any) {
    console.warn('addNotification error (likely offline):', err.message || err);
    return 'offline_' + Date.now();
  }
};

export const subscribeNotifications = (
  userId: string,
  callback: (notifications: AppNotification[]) => void
): (() => void) => {
  try {
    const colRef = collection(db, 'notifications');
    // Query notifications for this user or for 'all' (system wide)
    const q = query(colRef, where('userId', 'in', [userId, 'all']));
    
    return onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as AppNotification));
      
      // Sort in memory by createdAt desc to avoid missing index errors
      list.sort((a, b) => b.createdAt - a.createdAt);
      callback(list);
    }, (error) => {
      console.warn('subscribeNotifications error (likely offline or rules):', error);
      callback([]);
    });
  } catch (err) {
    console.warn('subscribeNotifications setup failed:', err);
    callback([]);
    return () => {};
  }
};

export const markNotificationAsRead = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, 'notifications', id);
    await updateDoc(docRef, { read: true });
  } catch (err: any) {
    console.warn(`markNotificationAsRead error for ${id}:`, err.message || err);
  }
};

export const markAllNotificationsAsRead = async (userId: string, notifications: AppNotification[]): Promise<void> => {
  try {
    for (const notif of notifications) {
      if (!notif.read && (notif.userId === userId || notif.userId === 'all')) {
        const docRef = doc(db, 'notifications', notif.id);
        await updateDoc(docRef, { read: true });
      }
    }
  } catch (err: any) {
    console.warn('markAllNotificationsAsRead error:', err.message || err);
  }
};

// --- Certificates and Exam Results Core Database Helpers ---

export const addCertificate = async (cert: Omit<Certificate, 'id'>): Promise<string> => {
  const path = 'certificates';
  try {
    const colRef = collection(db, path);
    const docRef = await addDoc(colRef, cert);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    throw error;
  }
};

export const fetchCertificates = async (): Promise<Certificate[]> => {
  const path = 'certificates';
  try {
    const colRef = collection(db, path);
    const snap = await getDocs(colRef);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Certificate));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};

export const fetchCertificateByCode = async (code: string): Promise<Certificate | null> => {
  const path = 'certificates';
  try {
    const colRef = collection(db, path);
    const q = query(colRef, where('verificationCode', '==', code.trim().toUpperCase()));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const doc = snap.docs[0];
    return { id: doc.id, ...doc.data() } as Certificate;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
};

export const deleteCertificate = async (id: string): Promise<void> => {
  const path = `certificates/${id}`;
  try {
    const docRef = doc(db, 'certificates', id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};

export const addExamResult = async (result: Omit<ExamResult, 'id'>): Promise<string> => {
  const path = 'exam_results';
  try {
    const colRef = collection(db, path);
    const docRef = await addDoc(colRef, result);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    throw error;
  }
};

export const fetchExamResults = async (): Promise<ExamResult[]> => {
  const path = 'exam_results';
  try {
    const colRef = collection(db, path);
    const snap = await getDocs(colRef);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as ExamResult));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};

export const fetchExamResultByCode = async (candidateCode: string): Promise<ExamResult | null> => {
  const path = 'exam_results';
  try {
    const colRef = collection(db, path);
    const codeUpper = candidateCode.trim().toUpperCase();
    const q = query(colRef, where('candidateCode', '==', codeUpper));
    const snap = await getDocs(q);
    
    if (!snap.empty) {
      const doc = snap.docs[0];
      return { id: doc.id, ...doc.data() } as ExamResult;
    }
    
    // Check if the entire exam_results collection is empty
    const allResultsSnap = await getDocs(colRef);
    if (allResultsSnap.empty) {
      console.log('Seeding default exam results to Firestore...');
      const DEFAULT_SEEDED_RESULTS: Omit<ExamResult, 'id'>[] = [
        {
          studentName: "Yohana Marco Bahati",
          candidateCode: "S0101/0001/2026",
          examType: "NECTA Mock Examination",
          level: "Form IV",
          year: 2026,
          division: "Division I",
          gpa: 1.14,
          subjects: [
            { subject: "Basic Mathematics", grade: "A", score: 88 },
            { subject: "Physics", grade: "A", score: 85 },
            { subject: "Chemistry", grade: "B", score: 76 },
            { subject: "Biology", grade: "A", score: 81 },
            { subject: "English Language", grade: "B", score: 78 },
            { subject: "Civics", grade: "A", score: 82 },
            { subject: "History", grade: "B", score: 74 }
          ],
          publishedAt: Date.now() - 3600000 * 24 * 10,
          status: "published"
        },
        {
          studentName: "Anna John Simba",
          candidateCode: "S0101/0002/2026",
          examType: "NECTA Mock Examination",
          level: "Form IV",
          year: 2026,
          division: "Division II",
          gpa: 2.43,
          subjects: [
            { subject: "Basic Mathematics", grade: "C", score: 58 },
            { subject: "Physics", grade: "B", score: 68 },
            { subject: "Chemistry", grade: "C", score: 55 },
            { subject: "Biology", grade: "B", score: 65 },
            { subject: "English Language", grade: "B", score: 70 },
            { subject: "Civics", grade: "C", score: 52 },
            { subject: "History", grade: "D", score: 48 }
          ],
          publishedAt: Date.now() - 3600000 * 24 * 10,
          status: "published"
        },
        {
          studentName: "Juma Shaban Mwinyi",
          candidateCode: "S1245/0050/2026",
          examType: "NECTA Terminal Examination",
          level: "Form IV",
          year: 2026,
          division: "Division III",
          gpa: 3.57,
          subjects: [
            { subject: "Basic Mathematics", grade: "D", score: 44 },
            { subject: "Physics", grade: "D", score: 41 },
            { subject: "Chemistry", grade: "C", score: 52 },
            { subject: "Biology", grade: "D", score: 43 },
            { subject: "English Language", grade: "C", score: 50 },
            { subject: "Civics", grade: "D", score: 40 },
            { subject: "History", grade: "F", score: 32 }
          ],
          publishedAt: Date.now() - 3600000 * 24 * 10,
          status: "published"
        }
      ];
      
      for (const res of DEFAULT_SEEDED_RESULTS) {
        await addDoc(colRef, res);
      }
      
      // Re-run search query after seeding
      const retrySnap = await getDocs(q);
      if (!retrySnap.empty) {
        const doc = retrySnap.docs[0];
        return { id: doc.id, ...doc.data() } as ExamResult;
      }
    }
    
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
};

export const deleteExamResult = async (id: string): Promise<void> => {
  const path = `exam_results/${id}`;
  try {
    const docRef = doc(db, 'exam_results', id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};

export const updateExamResult = async (id: string, updates: Partial<ExamResult>): Promise<void> => {
  const path = `exam_results/${id}`;
  try {
    const docRef = doc(db, 'exam_results', id);
    await updateDoc(docRef, updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

export const fetchFeedbacks = async (): Promise<Feedback[]> => {
  const path = 'feedback';
  try {
    const colRef = collection(db, path);
    const snap = await getDocs(colRef);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Feedback));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};

export const updateFeedbackStatus = async (id: string, status: 'new' | 'reviewed' | 'resolved'): Promise<void> => {
  const path = `feedback/${id}`;
  try {
    const docRef = doc(db, 'feedback', id);
    await updateDoc(docRef, { status });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

/**
 * Submits a new payment transaction verification request to Firestore
 */
export const submitPaymentTransaction = async (tx: Omit<PaymentTransaction, 'id' | 'status' | 'createdAt'>): Promise<string> => {
  const path = 'payment_transactions';
  try {
    const colRef = collection(db, path);
    const docRef = await addDoc(colRef, {
      ...tx,
      status: 'pending',
      createdAt: Date.now()
    });
    return docRef.id;
  } catch (err: any) {
    handleFirestoreError(err, OperationType.CREATE, path);
    throw err;
  }
};

/**
 * Fetches all payment transactions from Firestore
 */
export const fetchPaymentTransactions = async (): Promise<PaymentTransaction[]> => {
  const path = 'payment_transactions';
  try {
    const colRef = collection(db, path);
    const snap = await getDocs(colRef);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as PaymentTransaction));
  } catch (err: any) {
    handleFirestoreError(err, OperationType.LIST, path);
    return [];
  }
};

/**
 * Updates a payment transaction's status (approved or rejected) and elevates user subscription status if approved
 */
export const updatePaymentTransactionStatus = async (
  id: string, 
  status: 'approved' | 'rejected', 
  userId: string,
  rejectionReason?: string
): Promise<void> => {
  const path = `payment_transactions/${id}`;
  try {
    const docRef = doc(db, 'payment_transactions', id);
    const updates: Partial<PaymentTransaction> = {
      status,
      approvedAt: Date.now()
    };
    if (rejectionReason) {
      updates.rejectionReason = rejectionReason;
    }
    await updateDoc(docRef, updates);

    // If approved, update user's profile to premium!
    if (status === 'approved') {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { subscription: 'premium' });
    }

    // Send notification to student
    await addNotification({
      userId,
      title: status === 'approved' ? 'Uanachama wa Premium Umethibitishwa! 💎' : 'Malipo ya Premium Yamekataliwa ❌',
      message: status === 'approved' 
        ? 'Hongera! Sasa wewe ni mwanachama wa Premium. Unaweza kupakua na kusoma nyaraka zote bila kikomo.' 
        : `Samahani, malipo yako ya Premium hayajaweza kuthibitishwa. Sababu: ${rejectionReason || 'Taarifa hazijakamilika'}.`,
      type: status === 'approved' ? 'approval' : 'rejection',
      link: 'portal'
    });
  } catch (err: any) {
    handleFirestoreError(err, OperationType.UPDATE, path);
    throw err;
  }
};

export const createAuditLog = async (log: Omit<AuditLog, 'id' | 'timestamp'>): Promise<string> => {
  const path = 'audit_logs';
  try {
    const colRef = collection(db, path);
    const docRef = doc(colRef);
    const fullLog: AuditLog = {
      ...log,
      id: docRef.id,
      timestamp: Date.now()
    };
    await setDoc(docRef, fullLog);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    throw error;
  }
};

export const fetchAuditLogs = async (): Promise<AuditLog[]> => {
  const path = 'audit_logs';
  try {
    const colRef = collection(db, path);
    const q = query(colRef, orderBy('timestamp', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as AuditLog);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};

export const fetchSystemConfig = async (): Promise<SystemConfig | null> => {
  const path = 'system_configs/integrations';
  try {
    const docRef = doc(db, 'system_configs', 'integrations');
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return snap.data() as SystemConfig;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
};

export const updateSystemConfig = async (config: Partial<SystemConfig>): Promise<void> => {
  const path = 'system_configs/integrations';
  try {
    const docRef = doc(db, 'system_configs', 'integrations');
    await setDoc(docRef, { ...config, id: 'integrations' }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
};

export const fetchEducationalResources = async (): Promise<EducationalResource[]> => {
  const path = 'educational_resources';
  try {
    const colRef = collection(db, path);
    const q = query(colRef, orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        title: data.title || '',
        description: data.description || '',
        url: data.url || '',
        category: data.category || '',
        isVerified: data.isVerified ?? false,
        clicksCount: data.clicksCount || 0,
        recommendationsCount: data.recommendationsCount || 0,
        recommendedByUsers: data.recommendedByUsers || [],
        createdAt: data.createdAt || Date.now(),
        createdBy: data.createdBy || '',
        createdByName: data.createdByName || '',
        institution: data.institution || '',
        region: data.region || 'Both',
        tags: data.tags || []
      } as EducationalResource;
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};

export const addEducationalResource = async (resource: Omit<EducationalResource, 'id' | 'clicksCount' | 'recommendationsCount' | 'recommendedByUsers' | 'createdAt'>): Promise<string> => {
  const path = 'educational_resources';
  try {
    const colRef = collection(db, path);
    const docRef = await addDoc(colRef, {
      ...resource,
      clicksCount: 0,
      recommendationsCount: 0,
      recommendedByUsers: [],
      createdAt: Date.now()
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    throw error;
  }
};

export const updateEducationalResource = async (id: string, resource: Partial<EducationalResource>): Promise<void> => {
  const path = `educational_resources/${id}`;
  try {
    const docRef = doc(db, 'educational_resources', id);
    await updateDoc(docRef, resource);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
    throw error;
  }
};

export const deleteEducationalResource = async (id: string): Promise<void> => {
  const path = `educational_resources/${id}`;
  try {
    const docRef = doc(db, 'educational_resources', id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    throw error;
  }
};

export const saveQuickBuyOrder = async (order: Omit<QuickBuyOrder, 'id'>): Promise<string> => {
  const path = 'quick_buy_orders';
  try {
    const colRef = collection(db, path);
    const docRef = await addDoc(colRef, order);
    return docRef.id;
  } catch (err: any) {
    handleFirestoreError(err, OperationType.CREATE, path);
    throw err;
  }
};

export const fetchQuickBuyOrders = async (): Promise<QuickBuyOrder[]> => {
  const path = 'quick_buy_orders';
  try {
    const colRef = collection(db, path);
    const snap = await getDocs(colRef);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as QuickBuyOrder));
  } catch (err: any) {
    handleFirestoreError(err, OperationType.LIST, path);
    return [];
  }
};

export const updateQuickBuyOrderStatus = async (
  id: string, 
  status: 'verified' | 'failed', 
  userId: string,
  productName: string
): Promise<void> => {
  const path = `quick_buy_orders/${id}`;
  try {
    const docRef = doc(db, 'quick_buy_orders', id);
    await updateDoc(docRef, { status });

    // Send notification to student
    await addNotification({
      userId,
      title: status === 'verified' ? 'Malipo Yamehakikiwa! ✅' : 'Malipo Yamekataliwa! ❌',
      message: status === 'verified' 
        ? `Hongera! Malipo yako ya kitabu "${productName}" yamehakikiwa kikamilifu. Sasa unaweza kukisoma.` 
        : `Samahani! Muamala wako wa kitabu "${productName}" haujaweza kuhakikiwa. Tafadhali wasiliana nasi kwa msaada zaidi.`,
      type: 'approval',
      link: 'dashboard'
    });
  } catch (err: any) {
    handleFirestoreError(err, OperationType.UPDATE, path);
    throw err;
  }
};

/**
 * Wishlist management
 */
export const addToWishlist = async (userId: string, productId: string): Promise<string> => {
  const path = 'wishlist';
  try {
    const wishId = `${userId}_${productId}`;
    const docRef = doc(db, path, wishId);
    await setDoc(docRef, {
      userId,
      productId,
      addedAt: Date.now()
    });
    return wishId;
  } catch (err: any) {
    handleFirestoreError(err, OperationType.WRITE, path);
    throw err;
  }
};

export const removeFromWishlist = async (userId: string, productId: string): Promise<void> => {
  const wishId = `${userId}_${productId}`;
  const path = `wishlist/${wishId}`;
  try {
    const docRef = doc(db, 'wishlist', wishId);
    await deleteDoc(docRef);
  } catch (err: any) {
    handleFirestoreError(err, OperationType.DELETE, path);
    throw err;
  }
};

export const fetchUserWishlist = async (userId: string): Promise<string[]> => {
  const path = 'wishlist';
  try {
    const colRef = collection(db, path);
    const q = query(colRef, where('userId', '==', userId));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data().productId as string);
  } catch (err: any) {
    handleFirestoreError(err, OperationType.LIST, path);
    return [];
  }
};

export const trackResourceClick = async (id: string): Promise<void> => {
  const path = `educational_resources/${id}/click`;
  try {
    const docRef = doc(db, 'educational_resources', id);
    await updateDoc(docRef, {
      clicksCount: increment(1)
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

export const toggleRecommendResource = async (id: string, userId: string): Promise<void> => {
  const path = `educational_resources/${id}/recommend`;
  try {
    const docRef = doc(db, 'educational_resources', id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return;
    const data = snap.data();
    const recommendedByUsers: string[] = data.recommendedByUsers || [];
    let updatedUsers = [...recommendedByUsers];
    let recCount = data.recommendationsCount || 0;

    if (updatedUsers.includes(userId)) {
      updatedUsers = updatedUsers.filter(uid => uid !== userId);
      recCount = Math.max(0, recCount - 1);
    } else {
      updatedUsers.push(userId);
      recCount += 1;
    }

    await updateDoc(docRef, {
      recommendedByUsers: updatedUsers,
      recommendationsCount: recCount
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
    throw error;
  }
};

/**
 * Save an annotation/highlight to Firestore (or fallback locally if offline)
 */
export const saveHighlight = async (highlight: Omit<HighlightAnnotation, 'id' | 'createdAt'>): Promise<string> => {
  const path = 'highlights';
  try {
    const docRef = doc(collection(db, path));
    const fullHighlight: HighlightAnnotation = {
      ...highlight,
      id: docRef.id,
      createdAt: Date.now()
    };
    await setDoc(docRef, fullHighlight);
    return docRef.id;
  } catch (err: any) {
    console.warn('saveHighlight offline fallback triggered:', err.message || err);
    const localHighlights = localStorage.getItem('local_highlights');
    const list = localHighlights ? JSON.parse(localHighlights) : [];
    const id = 'local_' + Math.random().toString(36).substring(2, 9);
    const fullHighlight: HighlightAnnotation = {
      ...highlight,
      id,
      createdAt: Date.now()
    };
    list.push(fullHighlight);
    localStorage.setItem('local_highlights', JSON.stringify(list));
    return id;
  }
};

/**
 * Fetch highlights for a user and optional documentId
 */
export const fetchHighlights = async (userId: string, documentId?: string): Promise<HighlightAnnotation[]> => {
  const path = 'highlights';
  try {
    const colRef = collection(db, path);
    let q = query(colRef, where('userId', '==', userId));
    if (documentId) {
      q = query(colRef, where('userId', '==', userId), where('documentId', '==', documentId));
    }
    const snap = await getDocs(q);
    const onlineList = snap.docs.map(d => d.data() as HighlightAnnotation);
    
    // Merge with local storage highlights
    const localHighlights = localStorage.getItem('local_highlights');
    const localList: HighlightAnnotation[] = localHighlights ? JSON.parse(localHighlights) : [];
    const filteredLocal = localList.filter(h => h.userId === userId && (!documentId || h.documentId === documentId));
    
    return [...onlineList, ...filteredLocal].sort((a, b) => b.createdAt - a.createdAt);
  } catch (err: any) {
    console.warn('fetchHighlights offline fallback triggered:', err.message || err);
    const localHighlights = localStorage.getItem('local_highlights');
    const localList: HighlightAnnotation[] = localHighlights ? JSON.parse(localHighlights) : [];
    return localList
      .filter(h => h.userId === userId && (!documentId || h.documentId === documentId))
      .sort((a, b) => b.createdAt - a.createdAt);
  }
};

/**
 * Delete a highlight from Firestore/local storage
 */
export const deleteHighlight = async (id: string): Promise<void> => {
  try {
    if (id.startsWith('local_')) {
      const localHighlights = localStorage.getItem('local_highlights');
      if (localHighlights) {
        let list: HighlightAnnotation[] = JSON.parse(localHighlights);
        list = list.filter(h => h.id !== id);
        localStorage.setItem('local_highlights', JSON.stringify(list));
      }
      return;
    }
    const docRef = doc(db, 'highlights', id);
    await deleteDoc(docRef);
  } catch (err: any) {
    console.warn(`deleteHighlight error for ${id}:`, err.message || err);
    const localHighlights = localStorage.getItem('local_highlights');
    if (localHighlights) {
      let list: HighlightAnnotation[] = JSON.parse(localHighlights);
      list = list.filter(h => h.id !== id);
      localStorage.setItem('local_highlights', JSON.stringify(list));
    }
  }
};

export interface LibraryConfig {
  subjects: string[];
  classes: string[];
  categories: string[];
  educationLevels: string[];
}

export const DEFAULT_LIBRARY_CONFIG: LibraryConfig = {
  educationLevels: ['Primary', 'O-Level', 'A-Level', 'Teachers'],
  classes: [
    'Darasa la 1', 'Darasa la 2', 'Darasa la 3', 'Darasa la 4', 'Darasa la 5', 'Darasa la 6', 'Darasa la 7',
    'Form 1', 'Form 2', 'Form 3', 'Form 4',
    'Form 5', 'Form 6',
    'Grade A Diploma', 'Diploma in Education', 'Bachelor of Education'
  ],
  subjects: [
    'Mathematics', 'English', 'Kiswahili', 'Biology', 'Chemistry', 'Physics', 'Geography', 'History', 'Civics',
    'General Studies', 'Basic Applied Mathematics', 'Advanced Mathematics', 'Literature in English',
    'Commerce', 'Bookkeeping', 'Bible Knowledge', 'Islamic Knowledge', 'ICT', 'Lesson Planning', 'Child Development'
  ],
  categories: [
    'Notes', 'Books', 'Past Papers', 'Mock Exams', 'Pre-Necta', 'Necta', 'Marking Schemes', 'Practicals', 'Syllabus', 'Lesson Notes', 'Revision Questions'
  ]
};

/**
 * Fetch Library Config from Firestore with a robust fallback
 */
export const fetchLibraryConfig = async (): Promise<LibraryConfig> => {
  try {
    const docRef = doc(db, 'system_configs', 'library_settings');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      return {
        educationLevels: data.educationLevels || DEFAULT_LIBRARY_CONFIG.educationLevels,
        classes: data.classes || DEFAULT_LIBRARY_CONFIG.classes,
        subjects: data.subjects || DEFAULT_LIBRARY_CONFIG.subjects,
        categories: data.categories || DEFAULT_LIBRARY_CONFIG.categories
      };
    }
    return DEFAULT_LIBRARY_CONFIG;
  } catch (err) {
    console.warn('fetchLibraryConfig offline fallback:', err);
    return DEFAULT_LIBRARY_CONFIG;
  }
};

/**
 * Save Library Config to Firestore
 */
export const saveLibraryConfig = async (config: LibraryConfig): Promise<void> => {
  try {
    const docRef = doc(db, 'system_configs', 'library_settings');
    await setDoc(docRef, config);
  } catch (err: any) {
    handleFirestoreError(err, OperationType.WRITE, 'system_configs/library_settings');
  }
};

/**
 * Website News Helpers (Kukusanya Habari & Idhini ya Admin)
 */
export const fetchWebsiteNews = async (filters?: { status?: 'pending' | 'approved' | 'rejected' }): Promise<WebsiteNews[]> => {
  const path = 'website_news';
  try {
    const colRef = collection(db, path);
    let q = query(colRef);
    if (filters?.status) {
      q = query(q, where('status', '==', filters.status));
    }
    const snap = await getDocs(q);
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as WebsiteNews));
    // Sort by createdAt desc in-memory to prevent "missing index" Firestore errors
    return list.sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    console.error('Error fetching website news:', error);
    return [];
  }
};

export const saveWebsiteNews = async (newsData: Omit<WebsiteNews, 'id' | 'createdAt'>): Promise<string> => {
  const path = 'website_news';
  try {
    const colRef = collection(db, path);
    const payload = {
      ...newsData,
      createdAt: Date.now()
    };
    const docRef = await addDoc(colRef, payload);
    return docRef.id;
  } catch (error: any) {
    handleFirestoreError(error, OperationType.CREATE, path);
    throw error;
  }
};

export const updateWebsiteNews = async (id: string, updates: Partial<WebsiteNews>): Promise<void> => {
  const path = `website_news/${id}`;
  try {
    const docRef = doc(db, 'website_news', id);
    await updateDoc(docRef, updates);
  } catch (error: any) {
    handleFirestoreError(error, OperationType.UPDATE, path);
    throw error;
  }
};

export const deleteWebsiteNews = async (id: string): Promise<void> => {
  const path = `website_news/${id}`;
  try {
    const docRef = doc(db, 'website_news', id);
    await deleteDoc(docRef);
  } catch (error: any) {
    handleFirestoreError(error, OperationType.DELETE, path);
    throw error;
  }
};

/**
 * NECTA Exam Progress functions
 */
export const saveNectaProgress = async (
  userId: string,
  level: string,
  subject: string,
  year: string,
  status: 'not_started' | 'in_progress' | 'completed',
  notes?: string
): Promise<string> => {
  const path = 'necta_progress';
  try {
    const progressId = `${userId}_${level}_${subject}_${year}`;
    const docRef = doc(db, path, progressId);
    
    const payload: any = {
      id: progressId,
      userId,
      level,
      subject,
      year,
      status,
      updatedAt: serverTimestamp()
    };

    if (notes !== undefined) {
      payload.notes = notes;
    }

    await setDoc(docRef, payload);
    return progressId;
  } catch (error: any) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
};

export const fetchNectaProgress = async (userId: string): Promise<NectaProgress[]> => {
  const path = 'necta_progress';
  try {
    const colRef = collection(db, path);
    const q = query(colRef, where('userId', '==', userId));
    const snap = await getDocs(q);
    
    return snap.docs.map(doc => {
      const data = doc.data();
      return {
        id: data.id,
        userId: data.userId,
        level: data.level,
        subject: data.subject,
        year: data.year,
        status: data.status,
        notes: data.notes,
        // Convert timestamp if it exists, otherwise use current time as fallback
        updatedAt: data.updatedAt?.toMillis ? data.updatedAt.toMillis() : Date.now()
      } as NectaProgress;
    });
  } catch (error: any) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};

/**
 * Study Events / Calendar Planner functions
 */
export const saveStudyEvent = async (event: Omit<StudyEvent, 'createdAt' | 'id'> & { id?: string }): Promise<string> => {
  const path = 'study_events';
  try {
    const id = event.id || doc(collection(db, path)).id;
    const docRef = doc(db, path, id);
    const payload = {
      ...event,
      id,
      createdAt: Date.now()
    };
    await setDoc(docRef, payload, { merge: true });
    return id;
  } catch (error: any) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
};

export const fetchStudyEvents = async (userId: string): Promise<StudyEvent[]> => {
  const path = 'study_events';
  try {
    const colRef = collection(db, path);
    const q = query(colRef, where('userId', '==', userId));
    const snap = await getDocs(q);
    
    return snap.docs.map(doc => {
      const data = doc.data();
      return {
        id: data.id,
        userId: data.userId,
        title: data.title,
        date: data.date,
        subject: data.subject,
        notes: data.notes,
        isCompleted: !!data.isCompleted,
        createdAt: data.createdAt || Date.now()
      } as StudyEvent;
    });
  } catch (error: any) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};

export const deleteStudyEvent = async (eventId: string): Promise<void> => {
  const path = 'study_events';
  try {
    const docRef = doc(db, path, eventId);
    await deleteDoc(docRef);
  } catch (error: any) {
    handleFirestoreError(error, OperationType.DELETE, path);
    throw error;
  }
};

/**
 * Toggle Completed Examination Paper status for a student in Firestore
 */
export const toggleCompletedExam = async (userId: string, docId: string): Promise<boolean> => {
  const path = 'completed_exams';
  try {
    const compId = `${userId}_${docId}`;
    const docRef = doc(db, path, compId);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      await deleteDoc(docRef);
      return false; // Uncompleted
    } else {
      await setDoc(docRef, {
        userId,
        docId,
        completedAt: Date.now()
      });
      return true; // Completed
    }
  } catch (err: any) {
    console.error('toggleCompletedExam error:', err);
    return false;
  }
};

/**
 * Fetch all completed examination paper IDs for a user
 */
export const fetchUserCompletedExams = async (userId: string): Promise<string[]> => {
  const path = 'completed_exams';
  try {
    const colRef = collection(db, path);
    const q = query(colRef, where('userId', '==', userId));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data().docId as string);
  } catch (err: any) {
    console.warn('fetchUserCompletedExams warning:', err);
    return [];
  }
};