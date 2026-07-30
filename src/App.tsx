import React, { useState, useEffect, lazy, Suspense } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  sendPasswordResetEmail,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  Sparkles, 
  Mail, 
  Lock, 
  User as UserIcon, 
  LogIn, 
  X,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  CheckCircle2,
  CheckCircle,
  BookOpen,
  ShieldAlert,
  LogOut,
  Cookie
} from 'lucide-react';

import { UserProfile, AppTheme } from './types';
import { 
  auth, 
  fetchUserProfile, 
  ensureUserProfile, 
  updateUserProfile,
  awardStudyPoints,
  signInWithGoogle, 
  logoutUser,
  signInAsGuest 
} from './firebase';

import { runFirebaseDiagnostics, DiagnosticsResult } from './utils/firebaseDiagnostics';

import metadata from '../metadata.json';

import Navbar from './components/Navbar';
import Logo from './components/Logo';
import AdminView from './components/AdminView';

import PortalView from './components/PortalView';
import DashboardView from './components/DashboardView';
import MasomoView from './components/MasomoView';
import MitihaniView from './components/MitihaniView';
import DukaView from './components/DukaView';
import FisiMajiView from './components/FisiMajiView';
import VideosView from './components/VideosView';
import CalculatorView from './components/CalculatorView';
import KamusiView from './components/KamusiView';
import MikoaView from './components/MikoaView';
import AjiraView from './components/AjiraView';
import MatangazoView from './components/MatangazoView';
import MwalimuHubView from './components/MwalimuHubView';
import FeedbackModal from './components/FeedbackModal';
import WorkspaceView from './components/WorkspaceView';
import CombinationsView from './components/CombinationsView';
import UploadView from './components/UploadView';
import ReaderView from './components/ReaderView';
import PremiumView from './components/PremiumView';
import LibraryView from './components/LibraryView';
import ForumView from './components/ForumView';
import LiveClassesView from './components/LiveClassesView';
import CertificatesView from './components/CertificatesView';
import LeaderboardView from './components/LeaderboardView';
import ResourcesView from './components/ResourcesView';
import NectaProgressView from './components/NectaProgressView';
import RotatingBanner from './components/RotatingBanner';
import WelcomeNotification from './components/WelcomeNotification';
import DownloadProgressToast from './components/DownloadProgressToast';

// Shimmer Loading Skeleton Fallback for Smooth Cumulative Layout Shift (CLS) Mitigation
const ViewLoadingSkeleton = () => (
  <div className="w-full space-y-8 py-8 animate-pulse" id="lupanulla-view-skeleton">
    <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
      <div className="space-y-2 w-full md:w-auto">
        <div className="h-9 bg-slate-200 rounded-2xl w-48 animate-pulse"></div>
        <div className="h-4 bg-slate-200 rounded-xl w-72 animate-pulse"></div>
      </div>
      <div className="h-10 bg-slate-200 rounded-2xl w-full md:w-36 animate-pulse"></div>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white rounded-3xl p-6 border border-slate-100 space-y-4">
        <div className="h-5 bg-slate-200 rounded-lg w-1/2 animate-pulse"></div>
        <div className="h-12 bg-slate-200 rounded-2xl animate-pulse"></div>
        <div className="h-4 bg-slate-200 rounded-lg w-5/6 animate-pulse"></div>
        <div className="h-4 bg-slate-200 rounded-lg w-2/3 animate-pulse"></div>
      </div>
      <div className="bg-white rounded-3xl p-6 border border-slate-100 space-y-4">
        <div className="h-5 bg-slate-200 rounded-lg w-1/3 animate-pulse"></div>
        <div className="h-12 bg-slate-200 rounded-2xl animate-pulse"></div>
        <div className="h-4 bg-slate-200 rounded-lg w-4/5 animate-pulse"></div>
        <div className="h-4 bg-slate-200 rounded-lg w-1/2 animate-pulse"></div>
      </div>
      <div className="bg-white rounded-3xl p-6 border border-slate-100 space-y-4">
        <div className="h-5 bg-slate-200 rounded-lg w-1/4 animate-pulse"></div>
        <div className="h-12 bg-slate-200 rounded-2xl animate-pulse"></div>
        <div className="h-4 bg-slate-200 rounded-lg w-3/4 animate-pulse"></div>
        <div className="h-4 bg-slate-200 rounded-lg w-3/4 animate-pulse"></div>
      </div>
    </div>

    <div className="bg-white rounded-3xl p-8 border border-slate-100 space-y-5 h-48">
      <div className="h-5 bg-slate-200 rounded-lg w-1/4 animate-pulse"></div>
      <div className="h-4 bg-slate-200 rounded-lg w-3/4 animate-pulse"></div>
      <div className="h-4 bg-slate-200 rounded-lg w-5/6 animate-pulse"></div>
      <div className="h-4 bg-slate-200 rounded-lg w-2/3 animate-pulse"></div>
    </div>
  </div>
);

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState<boolean>(true);

  const [theme, setTheme] = useState<AppTheme>((localStorage.getItem('lupanulla-theme') as AppTheme) || 'theme-tanzania-forest');
  const [language, setLanguage] = useState<'sw' | 'en'>((localStorage.getItem('lupanulla-lang') as 'sw' | 'en') || 'sw');

  // Synchronize language with localStorage
  useEffect(() => {
    localStorage.setItem('lupanulla-lang', language);
  }, [language]);

  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Synchronize theme with localStorage and DOM body
  useEffect(() => {
    localStorage.setItem('lupanulla-theme', theme);
    const body = document.body;
    body.classList.remove('theme-tanzania-forest', 'theme-night-mode', 'theme-high-contrast');
    body.classList.add(theme);
  }, [theme]);

  // Routing State - defaults to 'portal' (the landing page)
  const [activeView, setActiveView] = useState<string>('portal');
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);
  const [activeAdminTab, setActiveAdminTab] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Login Modal State
  const [showSignInModal, setShowSignInModal] = useState<boolean>(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState<boolean>(false);
  const [authTab, setAuthTab] = useState<'login' | 'signup' | 'verify' | 'forgot_password' | 'email_link'>('login');
  const [activePolicyDoc, setActivePolicyDoc] = useState<'privacy' | 'terms' | null>(null);
  
  // Cookie Consent State
  const [showCookieConsent, setShowCookieConsent] = useState<boolean>(false);

  useEffect(() => {
    const hasConsented = localStorage.getItem('lupanulla-cookie-consent');
    if (!hasConsented) {
      const timer = setTimeout(() => {
        setShowCookieConsent(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptCookies = () => {
    localStorage.setItem('lupanulla-cookie-consent', 'accepted');
    setShowCookieConsent(false);
  };
  
  // Passwordless Email Link states
  const [emailLinkVerifying, setEmailLinkVerifying] = useState<boolean>(false);
  const [emailLinkError, setEmailLinkError] = useState<string | null>(null);
  const [emailConfirmRequired, setEmailConfirmRequired] = useState<boolean>(false);
  const [emailConfirmValue, setEmailConfirmValue] = useState<string>('');
  const [linkSentMessage, setLinkSentMessage] = useState<string | null>(null);
  
  // OTP Verification States
  const [otpInput, setOtpInput] = useState<string>('');
  const [otpResending, setOtpResending] = useState<boolean>(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string>('');
  const [simulatedOtp, setSimulatedOtp] = useState<string>('');
  const [otpSuccessMessage, setOtpSuccessMessage] = useState<string | null>(null);

  const closePolicyDoc = () => {
    setActivePolicyDoc(null);
    const hash = window.location.hash;
    if (hash === '#privacy' || hash === '#privacy-policy' || hash === '#terms' || hash === '#terms-of-service') {
      window.history.pushState("", document.title, window.location.pathname + window.location.search);
    }
  };
  
  // Credentials
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [unauthorizedDomainInfo, setUnauthorizedDomainInfo] = useState<{ hostname: string; projectId: string } | null>(null);
  const [domainCopied, setDomainCopied] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [diagnosticsRunning, setDiagnosticsRunning] = useState<boolean>(false);
  const [diagnosticsResult, setDiagnosticsResult] = useState<DiagnosticsResult | null>(null);

  // Create refs to prevent stale closure in global event listener
  const userRef = React.useRef(user);
  userRef.current = user;
  const refreshProfileRef = React.useRef<any>(null);

  // Global event listeners to open Login and Signup Modals
  useEffect(() => {
    const handleOpenLogin = () => {
      setShowSignInModal(true);
      setAuthTab('login');
    };
    const handleOpenSignup = () => {
      setShowSignInModal(true);
      setAuthTab('signup');
    };
    window.addEventListener('open-login-modal', handleOpenLogin);
    window.addEventListener('open-signup-modal', handleOpenSignup);
    
    const handleRefreshProfile = () => {
      if (userRef.current) {
        refreshProfileRef.current(userRef.current.uid, userRef.current.displayName || 'Mwanafunzi Lupanulla');
      }
    };
    window.addEventListener('refresh-user-profile', handleRefreshProfile);

    return () => {
      window.removeEventListener('open-login-modal', handleOpenLogin);
      window.removeEventListener('open-signup-modal', handleOpenSignup);
      window.removeEventListener('refresh-user-profile', handleRefreshProfile);
    };
  }, []);

  // Sync URL hash routing on load & navigation
  useEffect(() => {
    const handleHashRoute = () => {
      const hash = window.location.hash;
      if (!hash) {
        setActiveView('portal');
        setActiveDocumentId(null);
        return;
      }

      if (hash === '#privacy' || hash === '#privacy-policy') {
        setActivePolicyDoc('privacy');
        return;
      }
      if (hash === '#terms' || hash === '#terms-of-service') {
        setActivePolicyDoc('terms');
        return;
      }

      if (hash.startsWith('#reader')) {
        const params = new URLSearchParams(hash.replace('#reader?', ''));
        const docId = params.get('id');
        if (docId) {
          setActiveView('reader');
          setActiveDocumentId(docId);
        } else {
          setActiveView('portal');
        }
      } else if (hash.startsWith('#admin')) {
        const params = new URLSearchParams(hash.includes('?') ? hash.split('?')[1] : '');
        const tab = params.get('tab');
        setActiveView('admin');
        setActiveAdminTab(tab);
        setActiveDocumentId(null);
      } else {
        const cleanView = hash.replace('#', '');
        const validViews = [
          'portal', 'dashboard', 'masomo', 'mitihani', 'duka', 
          'fisimaji', 'videos', 'calculator', 'kamusi', 'mikoa', 
          'ajira', 'matangazo', 'upload', 'premium', 'workspace',
          'forum', 'live', 'certificates', 'leaderboard', 'resources', 'library', 'admin', 'combinations'
        ];
        if (validViews.includes(cleanView)) {
          setActiveView(cleanView);
          setActiveDocumentId(null);
        } else {
          setActiveView('portal');
        }
      }
    };

    handleHashRoute();
    window.addEventListener('hashchange', handleHashRoute);
    return () => window.removeEventListener('hashchange', handleHashRoute);
  }, []);

  // Sync state navigation back to hash
  const navigateTo = (view: string, id?: string) => {
    if (view === 'feedback') {
      setIsFeedbackOpen(true);
      return;
    }
    if (view === 'reader' && id) {
      window.location.hash = `#reader?id=${id}`;
    } else if (view === 'admin' && id) {
      window.location.hash = `#admin?tab=${id}`;
    } else {
      window.location.hash = `#${view}`;
    }
  };

  // Complete Sign-In with Email Link
  const completeEmailLinkSignIn = async (emailToSignIn: string) => {
    setEmailLinkVerifying(true);
    setEmailLinkError(null);
    try {
      const result = await signInWithEmailLink(auth, emailToSignIn, window.location.href);
      
      // Retrieve the display name if they entered one during signup
      const savedFullName = window.localStorage.getItem('signUpFullName') || result.user.displayName || 'Mwanafunzi Lupanulla';
      
      if (savedFullName && savedFullName !== result.user.displayName) {
        await updateProfile(result.user, { displayName: savedFullName });
      }

      // Create or ensure the user profile exists
      await ensureUserProfile(result.user, savedFullName, { emailVerified: true });
      await refreshProfile(result.user.uid, savedFullName);

      // Clean up localStorage
      window.localStorage.removeItem('emailForSignIn');
      window.localStorage.removeItem('signUpFullName');

      // Clear query params to make URL clean
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Close modal and show success message
      setShowSignInModal(false);
      setOtpSuccessMessage('Hongera! Kuingia kwa barua pepe (Email Link) kumefanikiwa kikamilifu! Karibu sana kwenye Lupanulla Hub.');
      setEmailLinkVerifying(false);
      setEmailConfirmRequired(false);
    } catch (error: any) {
      console.error('Email Link Sign-In Error:', error);
      let errorMsg = 'Imeshindwa kukamilisha kuingia kwa link ya barua pepe. Link hii inaweza kuwa imetumika tayari au muda wake umekwisha.';
      if (error.code === 'auth/invalid-action-code') {
        errorMsg = 'Kiungo (link) hiki cha barua pepe si sahihi au kimeisha muda wake wa matumizi. Tafadhali omba kingine.';
      } else if (error.message) {
        errorMsg = `Hitilafu: ${error.message}`;
      }
      setEmailLinkError(errorMsg);
      setEmailLinkVerifying(false);
    }
  };

  // Handler to send email login link
  const handleSendEmailLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setAuthError('Tafadhali jaza barua pepe (email) yako kwanza.');
      return;
    }
    setAuthLoading(true);
    setAuthError(null);
    setLinkSentMessage(null);

    try {
      const actionCodeSettings = {
        url: window.location.origin,
        handleCodeInApp: true,
      };

      await sendSignInLinkToEmail(auth, email.trim(), actionCodeSettings);

      // Store in local storage to avoid prompting on return
      window.localStorage.setItem('emailForSignIn', email.trim());
      if (fullName.trim()) {
        window.localStorage.setItem('signUpFullName', fullName.trim());
      }

      setLinkSentMessage(`Tumekutumia barua pepe salama yenye kiungo cha kuingia/kusajili kwenye: ${email.trim()}. Tafadhali angalia kikasha chako cha barua pepe (Inbox au Spam/Junk folder) kisha bofya kiungo hicho ili kujiunga au kuingia moja kwa moja.`);
      
      // Clear fields to keep form clean
      setEmail('');
      setFullName('');
    } catch (err: any) {
      console.error('Send Email Link Error:', err);
      let errorMsg = 'Imeshindwa kutuma link ya barua pepe. Tafadhali thibitisha barua pepe yako na ujaribu tena.';
      if (err.code === 'auth/invalid-email') {
        errorMsg = 'Barua pepe uliyoingiza si sahihi. Tafadhali weka barua pepe sahihi.';
      } else if (err.code === 'auth/network-request-failed') {
        errorMsg = 'Hitilafu ya mtandao. Tafadhali thibitisha muunganisho wako wa intaneti.';
      } else if (err.message) {
        errorMsg = `Hitilafu: ${err.message}`;
      }
      setAuthError(errorMsg);
    } finally {
      setAuthLoading(false);
    }
  };

  // Effect to intercept the email link sign in on load
  useEffect(() => {
    const checkEmailLink = async () => {
      if (isSignInWithEmailLink(auth, window.location.href)) {
        setEmailLinkVerifying(true);
        setShowSignInModal(true);
        
        const emailToSignIn = window.localStorage.getItem('emailForSignIn') || '';
        if (!emailToSignIn) {
          // Email is missing in local storage
          setEmailConfirmRequired(true);
          setEmailLinkVerifying(false);
        } else {
          await completeEmailLinkSignIn(emailToSignIn);
        }
      }
    };
    checkEmailLink();
  }, []);

  // Sync Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await refreshProfile(currentUser.uid, currentUser.displayName || 'Mwanafunzi Lupanulla');
      } else {
        setUserProfile(null);
        setProfileLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  const [otpSkipped, setOtpSkipped] = useState<boolean>(sessionStorage.getItem('lupanulla-otp-skipped') === 'true');

  // Forced verification if user is logged in but not verified - disabled auto-popup to allow free entry!
  useEffect(() => {
    // We no longer force pop-up the OTP verify screen on page load, keeping the entrance completely open for everyone.
    /*
    if (user && userProfile && userProfile.emailVerified === false && !otpSkipped) {
      setShowSignInModal(true);
      setAuthTab('verify');
      setUnverifiedEmail(user.email || '');
      if (userProfile.verificationCode) {
        setSimulatedOtp(userProfile.verificationCode);
      }
    }
    */
  }, [user, userProfile, otpSkipped]);

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpInput || otpInput.trim().length !== 6) {
      setAuthError('Tafadhali ingiza nambari zote 6 za uthibitisho.');
      return;
    }
    
    setAuthLoading(true);
    setAuthError(null);
    setOtpSuccessMessage(null);
    try {
      if (!user) {
        throw new Error('Mtumiaji hajapatikana. Tafadhali ingia tena.');
      }
      
      const freshProfile = await fetchUserProfile(user.uid);
      const correctCode = freshProfile?.verificationCode || userProfile?.verificationCode || simulatedOtp;
      
      if (otpInput.trim() === correctCode) {
        await updateUserProfile(user.uid, { emailVerified: true });
        await refreshProfile(user.uid);
        setOtpInput('');
        setAuthError(null);
        setOtpSuccessMessage('Uthibitisho Umefanikiwa! Karibu Lupanulla Elimu Hub.');
        setTimeout(() => {
          setShowSignInModal(false);
          setOtpSuccessMessage(null);
        }, 1500);
      } else {
        setAuthError('Nambari ya siri uliyoingiza si sahihi. Tafadhali jaribu tena.');
      }
    } catch (err: any) {
      console.error('Error verifying OTP:', err);
      setAuthError(err.message || 'Kuna hitilafu iliyotokea wakati wa uthibitisho.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!user) return;
    setOtpResending(true);
    setAuthError(null);
    setOtpSuccessMessage(null);
    try {
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      await updateUserProfile(user.uid, { verificationCode: otpCode, emailVerified: false });
      setSimulatedOtp(otpCode);
      
      try {
        await fetch('/api/auth/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email: user.email, 
            code: otpCode, 
            name: userProfile?.name || user.displayName || 'Mtumiaji Lupanulla' 
          })
        });
      } catch (fetchErr) {
        console.warn('send-otp API endpoint failed, falling back to simulated OTP:', fetchErr);
      }
      
      await refreshProfile(user.uid);
      setOtpSuccessMessage('Nambari mpya ya siri imetumwa kwenye barua pepe yako.');
      setTimeout(() => {
        setOtpSuccessMessage(null);
      }, 3000);
    } catch (err: any) {
      console.error('Error resending OTP:', err);
      setAuthError('Imeshindwa kutuma upya nambari ya siri. Jaribu tena baadae.');
    } finally {
      setOtpResending(false);
    }
  };

  const handleAutoVerify = async () => {
    if (!user) return;
    setAuthLoading(true);
    setAuthError(null);
    try {
      await updateUserProfile(user.uid, { emailVerified: true });
      await refreshProfile(user.uid);
      setOtpInput('');
      setOtpSuccessMessage('Uthibitisho Umefanikiwa! Karibu Lupanulla Elimu Hub.');
      setTimeout(() => {
        setShowSignInModal(false);
        setOtpSuccessMessage(null);
      }, 1500);
    } catch (err: any) {
      console.error('Error auto verifying:', err);
      // Fallback: set skipped so they can browse without lock-outs
      sessionStorage.setItem('lupanulla-otp-skipped', 'true');
      setOtpSkipped(true);
      setOtpSuccessMessage('Umefanikiwa kupita uthibitisho wa siri!');
      setTimeout(() => {
        setShowSignInModal(false);
        setOtpSuccessMessage(null);
      }, 1500);
    } finally {
      setAuthLoading(false);
    }
  };

  const refreshProfile = async (uid: string, fallbackName?: string) => {
    setProfileLoading(true);
    try {
      let profile = await fetchUserProfile(uid);
      if (profile && auth.currentUser) {
        // Double check super admin status to ensure auto-elevation
        const isSuperAdmin = auth.currentUser.uid === 'a9wJ0DcKpkN9I9iyO2yQzcI7VlT2' || 
                             auth.currentUser.email?.toLowerCase() === 'lupanulla.co.tz@gmail.com' ||
                             profile.email?.toLowerCase() === 'lupanulla.co.tz@gmail.com';
        if (isSuperAdmin && profile.role !== 'super_admin') {
          profile.role = 'super_admin';
          // Ensure it's updated in Firestore as well
          try {
            await ensureUserProfile(auth.currentUser, profile.name);
          } catch (e) {
            console.warn('Failed to background update super admin role:', e);
          }
        }
      }
      if (!profile && auth.currentUser) {
        profile = await ensureUserProfile(auth.currentUser, fallbackName || auth.currentUser.email?.split('@')[0] || 'User');
      }
      setUserProfile(profile);
    } catch (err) {
      console.error('Error loading user profile:', err);
      // Fallback to local profile based on auth state if Firestore is offline or fails
      if (auth.currentUser) {
        const isSuperAdmin = auth.currentUser.uid === 'a9wJ0DcKpkN9I9iyO2yQzcI7VlT2' || 
                             auth.currentUser.email?.toLowerCase() === 'lupanulla.co.tz@gmail.com';
        const fallbackProfile: UserProfile = {
          uid: uid,
          name: fallbackName || auth.currentUser.displayName || auth.currentUser.email?.split('@')[0] || 'Mwanafunzi Lupanulla',
          email: auth.currentUser.email || '',
          role: isSuperAdmin ? 'super_admin' : 'student',
          subscription: 'premium',
          createdAt: Date.now()
        };
        setUserProfile(fallbackProfile);
      }
    } finally {
      setProfileLoading(false);
    }
  };
  refreshProfileRef.current = refreshProfile;

  const handleAwardPoints = async (points: number, minutes: number) => {
    if (!userProfile?.uid) return;
    try {
      await awardStudyPoints(userProfile.uid, points, minutes);
      setUserProfile((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          xp: (prev.xp || 0) + points,
          studyTime: (prev.studyTime || 0) + minutes
        };
      });
    } catch (err) {
      console.error('Error awarding points:', err);
    }
  };

  const handleSignOut = async () => {
    try {
      await logoutUser();
      setUser(null);
      setUserProfile(null);
      navigateTo('portal');
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    setAuthError(null);
    setUnauthorizedDomainInfo(null);
    try {
      const result = await signInWithGoogle();
      if (result) {
        await refreshProfile(result.user.uid, result.user.displayName || 'Mtumiaji wa Google');
        setShowSignInModal(false);
      }
    } catch (err: any) {
      console.error('Google authorization error:', err);
      try {
        const parsed = JSON.parse(err.message);
        if (parsed && parsed.code === 'auth/unauthorized-domain') {
          setUnauthorizedDomainInfo({
            hostname: parsed.hostname,
            projectId: parsed.projectId
          });
          return;
        }
      } catch (e) {
        // Not JSON or does not match
      }
      setAuthError(err.message || 'Kuingia kwa Google kumeshindikana. Tafadhali jaribu tena.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGuestSignIn = async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const guestUser = await signInAsGuest();
      if (guestUser) {
        await refreshProfile(guestUser.uid, 'Mgeni Lupanulla');
        setShowSignInModal(false);
      } else {
        // Fallback: create a local guest profile so user is NEVER blocked from entering
        const guestUid = 'guest_' + Date.now();
        const guestProfile: UserProfile = {
          uid: guestUid,
          name: 'Mgeni Lupanulla',
          email: 'guest@lupanulla.co.tz',
          role: 'student',
          subscription: 'free',
          createdAt: Date.now(),
          emailVerified: true,
          xp: 10,
          studyTime: 0
        };
        setUserProfile(guestProfile);
        setShowSignInModal(false);
      }
    } catch (err: any) {
      console.warn('Guest authorization fallback triggered:', err);
      const guestUid = 'guest_' + Date.now();
      const guestProfile: UserProfile = {
        uid: guestUid,
        name: 'Mgeni Lupanulla',
        email: 'guest@lupanulla.co.tz',
        role: 'student',
        subscription: 'free',
        createdAt: Date.now(),
        emailVerified: true,
        xp: 10,
        studyTime: 0
      };
      setUserProfile(guestProfile);
      setShowSignInModal(false);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleEmailAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    setOtpSuccessMessage(null);

    try {
      if (authTab === 'login') {
        const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
        const profile = await fetchUserProfile(userCredential.user.uid);
        
        // Auto-verify on login to prevent any OTP lockout
        if (profile && profile.emailVerified === false) {
          try {
            await updateUserProfile(userCredential.user.uid, { emailVerified: true });
          } catch (updateErr) {
            console.warn('Failed to background update emailVerified status:', updateErr);
          }
        }
        
        await refreshProfile(userCredential.user.uid);
        setShowSignInModal(false);
        setEmail('');
        setPassword('');
        setFullName('');
      } else {
        if (!fullName.trim()) {
          setAuthError('Tafadhali jaza jina lako kamili kuanza.');
          setAuthLoading(false);
          return;
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        await updateProfile(userCredential.user, { displayName: fullName.trim() });
        
        // Mark as pre-verified to avoid any OTP hurdles
        await ensureUserProfile(userCredential.user, fullName.trim(), { emailVerified: true });
        
        // Keep them logged in and refresh the profile
        await refreshProfile(userCredential.user.uid, fullName.trim());
        setShowSignInModal(false);
        setEmail('');
        setPassword('');
        setFullName('');
      }
    } catch (err: any) {
      console.error('Email Authentication Error:', err);
      let errorMsg = 'Mchakato wa uthibitishaji umeshindwa. Tafadhali thibitisha barua pepe na nenosiri.';
      
      if (err.code === 'auth/email-already-in-use') {
        errorMsg = 'Barua pepe hii inatumiwa tayari na mtumiaji mwingine. Tafadhali tumia tab ya "Ingia (Login)".';
      } else if (err.code === 'auth/weak-password') {
        errorMsg = 'Nenosiri linapaswa kuwa na angalau herufi 6 au namba.';
      } else if (
        err.code === 'auth/wrong-password' || 
        err.code === 'auth/user-not-found' || 
        err.code === 'auth/invalid-credential' ||
        err.message?.includes('invalid-credential')
      ) {
        errorMsg = 'Barua pepe au nenosiri si sahihi, au akaunti hii haijasajiliwa bado. Kama hujasajiliwa, bonyeza tab ya "Sajili (Sign Up)" hapo juu ili kuunda akaunti bure!';
      } else if (err.code === 'auth/invalid-email') {
        errorMsg = 'Barua pepe uliyoingiza si sahihi. Tafadhali andika barua pepe sahihi (mfano: jina@example.com).';
      } else if (err.code === 'auth/operation-not-allowed') {
        errorMsg = 'Njia ya kuingia kwa Barua Pepe na Nenosiri haijawezeshwa bado kwenye Firebase Console. Tafadhali tumia kitufe cha "Endelea na Google" au wasiliana na msimamizi.';
      } else if (err.code === 'auth/network-request-failed') {
        errorMsg = 'Muunganisho wa intaneti umefeli au kuna kizuia mtandao. Tafadhali angalia mtandao wako na ujaribu tena.';
      } else if (err.code === 'auth/internal-error' || err.message?.includes('internal')) {
        errorMsg = `Hitilafu ya Firebase (${err.code || 'auth/internal-error'}): Tafadhali hakikisha kwamba umeruhusu mbinu ya Email/Password kwenye Firebase Console yako.`;
      } else if (err.message) {
        errorMsg = `Hitilafu: ${err.message}`;
      }
      setAuthError(errorMsg);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRunDiagnostics = async () => {
    setDiagnosticsRunning(true);
    setDiagnosticsResult(null);
    try {
      const result = await runFirebaseDiagnostics();
      setDiagnosticsResult(result);
    } catch (e: any) {
      console.error('Diagnostics failed:', e);
    } finally {
      setDiagnosticsRunning(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setAuthError('Tafadhali jaza barua pepe (email) yako kwanza hapo chini.');
      return;
    }
    setAuthLoading(true);
    setAuthError(null);
    setOtpSuccessMessage(null);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setOtpSuccessMessage('Barua pepe ya kurejesha nenosiri imetumwa! Tafadhali angalia kikasha chako cha barua pepe (inbox au spam folder) ili kuweka nenosiri jipya.');
    } catch (err: any) {
      console.error('Password reset error:', err);
      let errMsg = 'Kuna hitilafu imetokea wakati wa kutuma barua pepe ya kurejesha nenosiri.';
      if (err.code === 'auth/user-not-found') {
        errMsg = 'Hakuna akaunti iliyosajiliwa na barua pepe hii.';
      } else if (err.code === 'auth/invalid-email') {
        errMsg = 'Barua pepe uliyoingiza si sahihi.';
      } else if (err.message) {
        errMsg = err.message;
      }
      setAuthError(errMsg);
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div id="lupanulla-app" className={`min-h-screen flex flex-col font-sans selection:bg-cyan-100 selection:text-cyan-950 ${theme}`}>
      
      {/* Email Link Verifying Overlay */}
      {emailLinkVerifying && (
        <div id="email-link-verifying-overlay" className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[200] flex flex-col items-center justify-center p-6 text-center text-white animate-fade-in">
          <div className="space-y-4 max-w-md">
            <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <h2 className="font-sans font-black text-2xl uppercase tracking-wider text-indigo-300">Tunakuhakiki na Kukuunganisha</h2>
            <p className="text-xs text-slate-300 font-bold leading-relaxed">
              Tafadhali subiri kidogo wakati tunathibitisha kiungo chako cha usajili/kuingia na kuandaa akaunti yako...
            </p>
          </div>
        </div>
      )}
      
      {/* Feedback Modal */}
      <FeedbackModal 
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        user={user}
        userProfile={userProfile}
      />

      {/* Welcome & Benefits Notification */}
      <WelcomeNotification onNavigate={navigateTo} />

      {/* Download Progress Toast */}
      <DownloadProgressToast />

      {/* Navigation Bar */}
      <Navbar 
        activeView={activeView} 
        onNavigate={navigateTo} 
        userProfile={userProfile}
        onSignInClick={() => {
          setAuthError(null);
          setUnauthorizedDomainInfo(null);
          setDomainCopied(false);
          setShowSignInModal(true);
        }}
        onSignOut={handleSignOut}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        theme={theme}
        onChangeTheme={setTheme}
        language={language}
        onChangeLanguage={setLanguage}
      />

      {/* Main Container Area */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        
        {/* Offline Notification Banner */}
        {isOffline && (
          <div className="mb-6 bg-amber-500/10 border-2 border-amber-500/20 text-amber-900 px-5 py-4 rounded-3xl flex items-start gap-3.5 shadow-sm animate-fade-in">
            <div className="bg-amber-500 text-slate-950 rounded-xl p-2 mt-0.5 flex-shrink-0 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-3.536 5 5 0 011.414-3.536m0 0L5.636 5.636m0 0L3 3m2.636 2.636a9 9 0 000 12.728m0 0l2.829-2.829" />
              </svg>
            </div>
            <div className="space-y-1">
              <h4 className="text-xs sm:text-sm font-black uppercase tracking-tight text-amber-950">
                {language === 'sw' ? 'Hali ya Nje ya Mtandao (Offline Mode)' : 'Offline Study Mode Active'}
              </h4>
              <p className="text-[11px] sm:text-xs text-amber-900/85 font-semibold leading-relaxed">
                {language === 'sw' 
                  ? 'Uko nje ya mtandao au una mtandao dhaifu. Shukrani kwa mfumo wetu wa Service Worker, bado unaweza kusoma notisi zote, past papers za NECTA, na vyeti ambavyo uliwahi kuvifungua hapo awali.'
                  : 'You are currently offline or have a weak connection. Thanks to our Service Worker cache, you can still access all notes, NECTA papers, and certificates you have previously viewed.'}
              </p>
            </div>
          </div>
        )}

        {/* Profile/Auth Synchronization Spinner */}
        {profileLoading && user && (
          <div className="flex items-center justify-center py-6 gap-2 text-cyan-600 animate-pulse">
            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs font-bold uppercase tracking-wider">Inasawazisha akaunti ya Lupanulla...</span>
          </div>
        )}

        {/* View Switcher Router Dispatcher */}
        {userProfile?.isSuspended ? (
          <div className="bg-white border border-red-100 rounded-3xl p-8 text-center max-w-lg mx-auto space-y-6 shadow-2xl mt-12 animate-fade-in text-slate-800">
            <div className="w-20 h-20 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
              <ShieldAlert size={40} />
            </div>
            <div className="space-y-2">
              <h2 className="font-display font-black text-2xl text-slate-900 uppercase">Akaunti Imesimamishwa</h2>
              <p className="text-xs text-red-600 font-extrabold uppercase tracking-wider">Account Suspended</p>
            </div>
            <div className="bg-red-50/50 rounded-2xl p-4.5 border border-red-100/50 text-left space-y-2">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Sababu ya Kusimamishwa:</p>
              <p className="text-sm font-semibold text-slate-700 leading-relaxed italic">
                "{userProfile.suspensionReason || 'Ukiukaji wa masharti ya matumizi ya mfumo.'}"
              </p>
              {userProfile.suspendedAt && (
                <p className="text-[10px] text-slate-400 font-medium">
                  Imesimamishwa mnamo: {new Date(userProfile.suspendedAt).toLocaleDateString('sw-TZ', { dateStyle: 'long' })}
                </p>
              )}
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Kama unahisi uamuzi huu si sahihi au unahitaji usaidizi wa kurejesha akaunti yako, tafadhali wasiliana na Lupanulla Foundation kupitia barua pepe rasmi au msimamizi mkuu wa mfumo.
            </p>
            <button
              onClick={handleSignOut}
              className="w-full bg-slate-950 hover:bg-slate-800 text-white font-extrabold text-xs py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              <LogOut size={14} /> Ondoka Kwenye Akaunti
            </button>
          </div>
        ) : (
          <Suspense fallback={<ViewLoadingSkeleton />}>
            {user && !userProfile?.isSuspended && ['portal', 'dashboard', 'masomo', 'mitihani', 'fisimaji', 'duka', 'library', 'forum'].includes(activeView) && (
              <RotatingBanner onNavigate={navigateTo} />
            )}

            {activeView === 'portal' && (
              <PortalView 
                onNavigate={navigateTo} 
                userProfile={userProfile} 
              />
            )}

            {activeView === 'dashboard' && (
              <DashboardView 
                onNavigate={navigateTo} 
                userProfile={userProfile} 
                language={language}
                onAwardPoints={handleAwardPoints}
              />
            )}

            {activeView === 'masomo' && (
              <MasomoView 
                onNavigate={navigateTo} 
                userProfile={userProfile} 
              />
            )}

            {activeView === 'mitihani' && (
              <MitihaniView 
                onNavigate={navigateTo} 
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                userProfile={userProfile} 
              />
            )}

            {activeView === 'duka' && (
              <DukaView 
                onNavigate={navigateTo} 
                userProfile={userProfile} 
              />
            )}

            {activeView === 'library' && (
              <LibraryView 
                onNavigate={navigateTo} 
                userProfile={userProfile} 
              />
            )}

            {activeView === 'fisimaji' && (
              <FisiMajiView 
                onNavigate={navigateTo} 
                userProfile={userProfile} 
              />
            )}

            {activeView === 'videos' && (
              <VideosView 
                onNavigate={navigateTo} 
                userProfile={userProfile} 
              />
            )}

            {activeView === 'calculator' && (
              <CalculatorView />
            )}

            {activeView === 'combinations' && (
              <CombinationsView />
            )}

            {activeView === 'kamusi' && (
              <KamusiView />
            )}

            {activeView === 'mikoa' && (
              <MikoaView />
            )}

            {activeView === 'ajira' && (
              <AjiraView />
            )}

            {activeView === 'mwalimu-hub' && (
              <MwalimuHubView />
            )}

            {activeView === 'matangazo' && (
              <MatangazoView 
                userProfile={userProfile} 
              />
            )}

            {activeView === 'workspace' && (
              <WorkspaceView theme={theme} onChangeTheme={setTheme} />
            )}

            {activeView === 'upload' && (
              <UploadView 
                onNavigate={navigateTo} 
                userProfile={userProfile} 
              />
            )}

            {activeView === 'reader' && activeDocumentId && (
              <ReaderView 
                documentId={activeDocumentId} 
                onNavigate={navigateTo} 
                userProfile={userProfile} 
              />
            )}

            {activeView === 'premium' && (
              <PremiumView 
                onNavigate={navigateTo} 
                userProfile={userProfile} 
                onProfileUpdate={() => refreshProfile(user?.uid || '')}
              />
            )}

            {activeView === 'resources' && (
              <ResourcesView 
                language={language}
                userProfile={userProfile} 
              />
            )}

            {activeView === 'necta-progress' && (
              <NectaProgressView 
                userProfile={userProfile}
                onNavigate={navigateTo}
              />
            )}

            {activeView === 'forum' && (
              <ForumView 
                language={language}
                userProfile={userProfile} 
              />
            )}

            {activeView === 'live' && (
              <LiveClassesView 
                language={language}
                userProfile={userProfile} 
              />
            )}

            {activeView === 'certificates' && (
              <CertificatesView 
                language={language}
                userProfile={userProfile} 
              />
            )}

            {activeView === 'leaderboard' && (
              <LeaderboardView 
                language={language}
                userProfile={userProfile} 
              />
            )}

            {activeView === 'admin' && (
              <AdminView 
                onNavigate={navigateTo} 
                userProfile={userProfile} 
                initialTab={activeAdminTab || 'approvals'}
              />
            )}
          </Suspense>
        )}

      </main>

      {/* Unified Platform Footer */}
      <footer className="bg-slate-950 text-slate-400 border-t border-slate-900 py-12 text-xs font-semibold">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="space-y-3.5">
            <div className="flex items-center gap-2.5 text-white">
              <Logo size="sm" />
              <span className="font-display font-extrabold text-base tracking-wider uppercase">Lupanulla Elimu Hub</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed max-w-xs font-semibold">
              Notisi, mitihani, video, vitabu, miongozo ya walimu, na msaidizi mahiri wa akili ya bandia (Lupanulla AI) - vyote kwa ajili ya mafanikio yako kitaaluma Tanzania.
            </p>
          </div>

          <div>
            <h4 className="font-display font-extrabold text-[10px] text-white uppercase tracking-widest mb-4">Masomo &amp; Karatasi</h4>
            <ul className="space-y-2.5 text-[11px]">
              <li><button onClick={() => navigateTo('masomo')} className="hover:text-cyan-400 transition-colors">Soma Notisi (Syllabus)</button></li>
              <li><button onClick={() => navigateTo('mitihani')} className="hover:text-cyan-400 transition-colors">Past Papers &amp; Exams</button></li>
              <li><button onClick={() => navigateTo('upload')} className="hover:text-cyan-400 transition-colors">Pakia Karatasi Mpya (Upload)</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-extrabold text-[10px] text-white uppercase tracking-widest mb-4">Msaada &amp; Ziada</h4>
            <ul className="space-y-2.5 text-[11px]">
              <li><button onClick={() => navigateTo('calculator')} className="hover:text-cyan-400 transition-colors">GPA Points Calculator</button></li>
              <li><button onClick={() => navigateTo('kamusi')} className="hover:text-cyan-400 transition-colors">Kamusi ya Elimu</button></li>
              <li><button onClick={() => navigateTo('mikoa')} className="hover:text-cyan-400 transition-colors">Viwango vya Shule Kitaifa</button></li>
            </ul>
          </div>

          <div className="space-y-3.5">
            <h4 className="font-display font-extrabold text-[10px] text-white uppercase tracking-widest mb-4">Mawasiliano yetu</h4>
            <p className="text-[11px] leading-relaxed font-semibold">
              Kama una maoni au unahitaji usaidizi wa haraka kujiunga na Premium, wasiliana nasi:
            </p>
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-850 rounded-xl p-2.5 w-fit">
              <ShieldCheck size={16} className="text-cyan-400" />
              <span>Google Drive &amp; Firebase Secured</span>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-900 pt-6 mt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px]">
          <div className="flex items-center gap-2.5">
            <p>© 2026 Lupanulla Foundation. Haki zote zimehifadhiwa.</p>
            <span className="bg-slate-900 border border-slate-850 text-cyan-400 rounded-full px-2.5 py-0.5 text-[9px] font-mono tracking-wider font-extrabold flex items-center gap-1 shadow-inner">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Toleo v{metadata.version || '2.5.0'}
            </span>
          </div>
          <div className="flex gap-4 font-bold">
            <a 
              href="#privacy-policy" 
              onClick={() => {
                setActivePolicyDoc('privacy');
              }} 
              className="hover:underline cursor-pointer text-slate-400 hover:text-cyan-400 transition-colors"
            >
              {language === 'sw' ? 'Sera ya Faragha' : 'Privacy Policy'}
            </a>
            <a 
              href="#terms-of-service" 
              onClick={() => {
                setActivePolicyDoc('terms');
              }} 
              className="hover:underline cursor-pointer text-slate-400 hover:text-cyan-400 transition-colors"
            >
              {language === 'sw' ? 'Vigezo na Masharti' : 'Terms & Conditions'}
            </a>
          </div>
        </div>
      </footer>

      {/* SIGN IN MODAL */}
      {showSignInModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={() => {
              if (!authLoading) {
                if (authTab === 'verify') {
                  sessionStorage.setItem('lupanulla-otp-skipped', 'true');
                  setOtpSkipped(true);
                }
                setShowSignInModal(false);
              }
            }}
          ></div>
          
          <div className="relative bg-white border border-slate-100 w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col gap-6 animate-fade-in z-[160] text-slate-800">
            <button
              onClick={() => {
                if (authTab === 'verify') {
                  sessionStorage.setItem('lupanulla-otp-skipped', 'true');
                  setOtpSkipped(true);
                }
                setShowSignInModal(false);
              }}
              disabled={authLoading}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"
            >
              <X size={20} />
            </button>

            <div className="text-center space-y-1.5">
              <Logo size="lg" className="mx-auto" />
              <h2 className="font-display font-extrabold text-2xl text-slate-900 leading-none mt-2 uppercase">Lupanulla Hub</h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Kitovu cha Elimu ya Kidijitali Tanzania</p>
            </div>

            {typeof window !== 'undefined' && window.self !== window.top && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 space-y-2 text-amber-900 text-xs animate-fade-in">
                <div className="flex items-start gap-2">
                  <AlertCircle className="text-amber-500 flex-shrink-0 mt-0.5" size={16} />
                  <div className="space-y-1">
                    <p className="font-extrabold uppercase text-[10px] tracking-wider text-amber-950">Taarifa Muhimu ya Preview (Iframe)</p>
                    <p className="text-[11px] leading-relaxed font-semibold">
                      Ukiwa ndani ya preview ya AI Studio, kivinjari chako kinaweza kuzuia "Email/Password Login & Signup" kwa sababu ya usalama wa kuki/storage ya iframe.
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 pt-1.5 border-t border-amber-200/50">
                  <p className="text-[10px] font-bold text-amber-950 uppercase">Njia Mbadala za Kufanikiwa:</p>
                  <ol className="list-decimal list-inside text-[10px] font-semibold space-y-1 text-amber-900/85 pl-1">
                    <li>Tumia kitufe cha <strong className="text-cyan-800">"Endelea na Google"</strong> ikiwa umeidhinisha domain yako kwenye Firebase settings.</li>
                    <li>Fungua programu kwenye kichupo kipya cha kivinjari (kwa kubofya Share au kufungua nje ya iframe) ili kujiandikisha kwa urahisi kabisa bila kuzuiliwa na kivinjari!</li>
                  </ol>
                </div>
              </div>
            )}

            {emailConfirmRequired ? (
              <div className="space-y-4 animate-fade-in text-slate-800">
                <div className="text-center space-y-1.5">
                  <div className="mx-auto w-10 h-10 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-1">
                    <Sparkles size={20} className="animate-pulse" />
                  </div>
                  <h3 className="font-sans font-black text-slate-800 text-sm uppercase tracking-wider">Thibitisha Barua Pepe Yako</h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                    Ulifungua kiungo hiki kwenye kivinjari au kifaa tofauti. Tafadhali thibitisha barua pepe uliyotumia kuomba kiungo hiki ili kuendelea.
                  </p>
                </div>

                {emailLinkError && (
                  <div className="bg-red-50 border border-red-100 rounded-2xl p-3 flex gap-2 text-xs text-red-700 font-semibold">
                    <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                    <p>{emailLinkError}</p>
                  </div>
                )}

                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (emailConfirmValue.trim()) {
                      completeEmailLinkSignIn(emailConfirmValue.trim());
                    }
                  }} 
                  className="space-y-4"
                >
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Mail size={12} className="text-slate-400" />
                      Barua pepe yako (Email)
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={emailConfirmValue}
                      onChange={(e) => setEmailConfirmValue(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-150 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 placeholder-slate-400 font-semibold text-slate-800"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={emailLinkVerifying}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-extrabold text-xs py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 hover:scale-[1.01]"
                  >
                    {emailLinkVerifying ? 'Inakamilisha...' : 'Thibitisha na Kuingia'}
                  </button>
                </form>
              </div>
            ) : authTab === 'forgot_password' ? (
              <div className="space-y-4 animate-fade-in">
                <div className="text-center space-y-1.5">
                  <h3 className="font-sans font-black text-slate-800 text-sm uppercase tracking-wider">Kurejesha Nenosiri</h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                    Weka barua pepe yako hapa chini, na tutakutumia ujumbe wenye kiungo (link) cha kuweka nenosiri jipya kwa urahisi kabisa.
                  </p>
                </div>

                {authError && (
                  <div className="bg-red-50 border border-red-100 rounded-2xl p-3 flex gap-2 text-xs text-red-700 font-semibold">
                    <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                    <p>{authError}</p>
                  </div>
                )}

                {otpSuccessMessage && (
                  <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex gap-2 text-xs text-emerald-800 font-semibold animate-bounce">
                    <CheckCircle size={16} className="flex-shrink-0 mt-0.5 text-emerald-600" />
                    <p>{otpSuccessMessage}</p>
                  </div>
                )}

                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Mail size={12} className="text-slate-400" />
                      Barua pepe yako (Email)
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-150 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 placeholder-slate-400 font-semibold text-slate-800"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full bg-slate-950 hover:bg-slate-800 disabled:bg-slate-300 text-white font-extrabold text-xs py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 hover:scale-[1.01]"
                  >
                    {authLoading ? 'Inatuma...' : 'Tuma Ujumbe wa Kurejesha'}
                  </button>
                </form>

                <div className="text-center pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthError(null);
                      setOtpSuccessMessage(null);
                      setAuthTab('login');
                    }}
                    className="text-xs font-black text-cyan-600 hover:text-cyan-700 hover:underline cursor-pointer"
                  >
                    &larr; Rudi kwenye Kuingia (Login)
                  </button>
                </div>
              </div>
            ) : authTab === 'email_link' ? (
              <div className="space-y-4 animate-fade-in text-slate-800">
                <div className="text-center space-y-1.5">
                  <div className="mx-auto w-10 h-10 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-1">
                    <Sparkles size={20} className="text-indigo-500 animate-pulse" />
                  </div>
                  <h3 className="font-sans font-black text-indigo-800 text-sm uppercase tracking-wider">Kuingia Bila Nenosiri</h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold animate-pulse">
                    Sio lazima ukumbuke nenosiri lako! Weka barua pepe yako hapa chini na tutakutumia kiungo (link) salama cha kukuunganisha au kukusajili moja kwa moja.
                  </p>
                </div>

                {authError && (
                  <div className="bg-red-50 border border-red-100 rounded-2xl p-3 flex gap-2 text-xs text-red-700 font-semibold animate-fade-in">
                    <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                    <p>{authError}</p>
                  </div>
                )}

                {linkSentMessage && (
                  <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex gap-2 text-xs text-emerald-800 font-bold animate-fade-in shadow-sm">
                    <CheckCircle size={18} className="flex-shrink-0 mt-0.5 text-emerald-600 animate-bounce" />
                    <p className="leading-relaxed font-semibold text-xs text-emerald-950">{linkSentMessage}</p>
                  </div>
                )}

                <form onSubmit={handleSendEmailLink} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <UserIcon size={12} className="text-slate-400" />
                      Jina Kamili (Kwa Usajili Mpya - si lazima)
                    </label>
                    <input
                      type="text"
                      placeholder="Jane Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-150 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 placeholder-slate-400 font-semibold text-slate-800"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Mail size={12} className="text-slate-400" />
                      Barua pepe yako (Email)
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-150 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 placeholder-slate-400 font-semibold text-slate-800"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-extrabold text-xs py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 hover:scale-[1.01]"
                  >
                    {authLoading ? 'Inatuma Link...' : 'Tuma Link ya Kuingia/Kusajili'}
                  </button>
                </form>

                <div className="text-center pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthError(null);
                      setLinkSentMessage(null);
                      setAuthTab('login');
                    }}
                    className="text-xs font-black text-cyan-600 hover:text-cyan-700 hover:underline cursor-pointer"
                  >
                    &larr; Rudi kwenye Kuingia (Login)
                  </button>
                </div>
              </div>
            ) : authTab !== 'verify' ? (
              <>
                <div className="flex border-b border-slate-100 gap-1 pb-px">
                  <button
                    onClick={() => {
                      setAuthError(null);
                      setOtpSuccessMessage(null);
                      setAuthTab('login');
                    }}
                    className={`flex-1 pb-2.5 text-xs font-extrabold uppercase border-b-2 text-center transition-all ${
                      authTab === 'login' ? 'border-cyan-500 text-cyan-600' : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    Ingia (Login)
                  </button>
                  <button
                    onClick={() => {
                      setAuthError(null);
                      setOtpSuccessMessage(null);
                      setAuthTab('signup');
                    }}
                    className={`flex-1 pb-2.5 text-xs font-extrabold uppercase border-b-2 text-center transition-all ${
                      authTab === 'signup' ? 'border-cyan-500 text-cyan-600' : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    Sajili (Sign Up)
                  </button>
                </div>

                {authError && (
                  <div className="bg-red-50 border border-red-100 rounded-2xl p-4 space-y-3 text-xs text-red-700 font-semibold animate-fade-in text-left">
                    <div className="flex gap-2.5">
                      <AlertCircle size={18} className="flex-shrink-0 mt-0.5 text-red-600" />
                      <p className="leading-relaxed">{authError}</p>
                    </div>
                    
                    <div className="pt-2.5 border-t border-red-200/50 flex flex-col gap-2">
                      <p className="text-[10px] font-black uppercase text-red-900 tracking-wider">Kukagua Hitilafu (Troubleshoot):</p>
                      <button
                        type="button"
                        onClick={handleRunDiagnostics}
                        disabled={diagnosticsRunning}
                        className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-350 text-white font-extrabold text-[11px] py-2 px-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
                      >
                        {diagnosticsRunning ? (
                          <>
                            <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            Inachunguza huduma ya Firebase...
                          </>
                        ) : (
                          'Bofya Hapa Kukagua Mipangilio ya Firebase (Diagnose Key)'
                        )}
                      </button>

                      {diagnosticsResult && (
                        <div className="bg-slate-900 text-slate-100 p-3.5 rounded-xl space-y-2.5 border border-slate-800 text-left font-sans mt-1">
                          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                            <span className="text-[10px] font-black uppercase text-cyan-400 tracking-wider">Ripoti ya Mfumo (Diagnostic Report)</span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase ${diagnosticsResult.success ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                              {diagnosticsResult.success ? 'SALAMA (OK)' : 'HITILAFU (FAIL)'}
                            </span>
                          </div>
                          <div className="text-[11px] space-y-2 font-medium leading-relaxed">
                            <p><strong className="text-slate-400">Sababu (Reason):</strong> {diagnosticsResult.rawMessage}</p>
                            <div className="bg-slate-850 p-3 rounded-lg border border-slate-800/85 text-amber-300/95 space-y-1 text-[11px] font-semibold">
                              <p className="font-extrabold uppercase text-[9.5px] text-amber-400 tracking-wide">Ufumbuzi (Swahili Solution):</p>
                              <p className="leading-relaxed">{diagnosticsResult.adviceSwahili}</p>
                            </div>
                            <div className="bg-slate-850 p-3 rounded-lg border border-slate-800/85 text-blue-300/95 space-y-1 text-[11px] font-semibold">
                              <p className="font-extrabold uppercase text-[9.5px] text-blue-400 tracking-wide">English Solution:</p>
                              <p className="leading-relaxed">{diagnosticsResult.adviceEnglish}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {otpSuccessMessage && (
                  <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex gap-2.5 text-xs text-emerald-800 font-bold animate-fade-in shadow-sm">
                    <CheckCircle size={18} className="flex-shrink-0 mt-0.5 text-emerald-600" />
                    <div className="space-y-0.5 text-left">
                      <p className="uppercase text-[10px] text-emerald-700 tracking-wider font-black">Hongera! Usajili Umefanikiwa</p>
                      <p className="leading-relaxed text-emerald-950 font-semibold text-xs">{otpSuccessMessage}</p>
                    </div>
                  </div>
                )}

                {unauthorizedDomainInfo && (
                  <div className="bg-amber-50/95 border border-amber-200 rounded-2xl p-4.5 space-y-3.5 text-xs text-amber-900 animate-fade-in shadow-sm">
                    <div className="flex items-start gap-2.5">
                      <AlertCircle className="text-amber-500 flex-shrink-0 mt-0.5" size={18} />
                      <div className="space-y-1">
                        <h4 className="font-extrabold uppercase tracking-tight text-amber-950 text-[11px] sm:text-xs">
                          {language === 'sw' ? 'Uthibitisho wa Domain unahitajika' : 'Domain Authorization Required'}
                        </h4>
                        <p className="text-[11px] leading-relaxed text-amber-900/90 font-semibold">
                          {language === 'sw' 
                            ? 'Google Sign-In imeshindwa kwa sababu domain ya sasa haijaidhinishwa kwenye Firebase Console yako.'
                            : 'Google Sign-In failed because the current domain is not yet authorized in your Firebase Console.'}
                        </p>
                      </div>
                    </div>

                    <div className="bg-amber-100/40 rounded-xl p-3 border border-amber-200/50 space-y-2">
                      <p className="text-[10px] font-black uppercase text-amber-950">
                        {language === 'sw' ? 'Hatua za Kusuluhisha:' : 'Resolution Steps:'}
                      </p>
                      <ol className="list-decimal list-inside text-[11px] font-semibold space-y-1 text-amber-900/85">
                        <li>
                          {language === 'sw' ? 'Nakili jina la domain hapa chini.' : 'Copy the domain name below.'}
                        </li>
                        <li>
                          <a 
                            href={`https://console.firebase.google.com/project/${unauthorizedDomainInfo.projectId}/authentication/settings`}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-cyan-700 hover:text-cyan-800 underline font-extrabold"
                          >
                            {language === 'sw' ? 'Fungua Firebase Console (Bonyeza Hapa)' : 'Open Firebase Console (Click Here)'}
                          </a>
                        </li>
                        <li>
                          {language === 'sw' 
                            ? "Nenda 'Settings' -> 'Authorized Domains', bonyeza 'Add Domain' kisha uweke domain hii." 
                            : "Go to 'Settings' -> 'Authorized Domains', click 'Add Domain' and paste this domain."}
                        </li>
                        <li>
                          {language === 'sw' ? 'Pakua upya ukurasa huu na uingie tena!' : 'Refresh this page and sign in again!'}
                        </li>
                      </ol>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-2">
                      <div className="bg-white border border-amber-200 px-3 py-2.5 rounded-xl text-center font-mono font-bold text-[10px] sm:text-[11px] select-all flex-grow w-full truncate text-slate-700">
                        {unauthorizedDomainInfo.hostname}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(unauthorizedDomainInfo.hostname);
                          setDomainCopied(true);
                          setTimeout(() => setDomainCopied(false), 2000);
                        }}
                        className="bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-black text-[10px] uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all shadow-sm w-full sm:w-auto text-center shrink-0"
                      >
                        {domainCopied ? (language === 'sw' ? 'Imenakiliwa!' : 'Copied!') : (language === 'sw' ? 'Nakili' : 'Copy')}
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <button
                    onClick={handleGoogleSignIn}
                    disabled={authLoading}
                    className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 hover:border-slate-300 rounded-xl py-3 text-xs font-bold text-slate-700 shadow-sm transition-all hover:scale-[1.01]"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.15-.31-.27-.64-.35-.97z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Endelea na Google</span>
                  </button>

                  <div className="flex items-center">
                    <div className="flex-grow border-t border-slate-100"></div>
                    <span className="px-3 text-[10px] text-slate-400 uppercase tracking-widest font-extrabold">au barua pepe</span>
                    <div className="flex-grow border-t border-slate-100"></div>
                  </div>
                </div>

                <form onSubmit={handleEmailAuthSubmit} className="space-y-4">
                  {authTab === 'signup' && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <UserIcon size={12} className="text-slate-400" />
                        Jina Kamili
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Jane Doe"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-150 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 placeholder-slate-400 font-semibold text-slate-800"
                      />
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Mail size={12} className="text-slate-400" />
                      Barua pepe (Email)
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-150 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 placeholder-slate-400 font-semibold text-slate-800"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Lock size={12} className="text-slate-400" />
                      Nenosiri (Password)
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-150 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 placeholder-slate-400 font-semibold text-slate-800"
                    />
                  </div>

                  {authTab === 'login' && (
                    <div className="flex justify-end pt-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          setAuthError(null);
                          setOtpSuccessMessage(null);
                          setAuthTab('forgot_password');
                        }}
                        className="text-[11px] font-extrabold text-cyan-600 hover:text-cyan-700 hover:underline cursor-pointer transition-all"
                      >
                        Umesahau Nenosiri?
                      </button>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full mt-4 bg-slate-950 hover:bg-slate-800 disabled:bg-slate-300 text-white font-extrabold text-xs py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 hover:scale-[1.01]"
                  >
                    <LogIn size={14} />
                    {authLoading ? 'Inaprosesi...' : authTab === 'login' ? 'Ingia Sasa' : 'Kamilisha Usajili'}
                  </button>

                  {authTab === 'signup' && (
                    <p className="text-[10px] text-center text-slate-400 mt-3 leading-relaxed">
                      {language === 'sw' ? (
                        <>
                          Kwa kujisajili, unakubaliana na{' '}
                          <a 
                            href="#terms-of-service" 
                            onClick={() => {
                              setActivePolicyDoc('terms');
                            }}
                            className="text-cyan-600 hover:underline font-extrabold transition-all"
                          >
                            Vigezo na Masharti
                          </a>{' '}
                          yetu na{' '}
                          <a 
                            href="#privacy-policy" 
                            onClick={() => {
                              setActivePolicyDoc('privacy');
                            }}
                            className="text-cyan-600 hover:underline font-extrabold transition-all"
                          >
                            Sera yetu ya Faragha
                          </a>.
                        </>
                      ) : (
                        <>
                          By signing up, you agree to our{' '}
                          <a 
                            href="#terms-of-service" 
                            onClick={() => {
                              setActivePolicyDoc('terms');
                            }}
                            className="text-cyan-600 hover:underline font-extrabold transition-all"
                          >
                            Terms & Conditions
                          </a>{' '}
                          and our{' '}
                          <a 
                            href="#privacy-policy" 
                            onClick={() => {
                              setActivePolicyDoc('privacy');
                            }}
                            className="text-cyan-600 hover:underline font-extrabold transition-all"
                          >
                            Privacy Policy
                          </a>.
                        </>
                      )}
                    </p>
                  )}
                </form>

                <div className="text-center pt-3 border-t border-slate-100 flex flex-col items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthError(null);
                      setOtpSuccessMessage(null);
                      setLinkSentMessage(null);
                      setAuthTab('email_link');
                    }}
                    className="text-xs font-black text-indigo-600 hover:text-indigo-700 hover:underline cursor-pointer transition-all flex items-center justify-center gap-1.5 w-full py-1"
                  >
                    <Sparkles size={13} className="text-indigo-500 animate-pulse" />
                    Ingia / Sajili Bila Nenosiri (Email Link)
                  </button>
                </div>
              </>
            ) : (
              /* OTP VERIFICATION VIEW */
              <div className="space-y-6 animate-fade-in">
                <div className="text-center bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-1">
                  <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">Msimbo Umetumwa Kwenye</p>
                  <p className="text-xs font-bold text-slate-800 truncate">{unverifiedEmail}</p>
                </div>

                <div className="text-center space-y-1.5">
                  <h3 className="font-display font-extrabold text-sm text-slate-800 uppercase tracking-wider">Ingiza Nambari ya Siri</h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Tafadhali ingiza nambari sita za siri (OTP) zilizotumwa kwenye barua pepe yako ili kuamilisha akaunti yako kikamilifu.
                  </p>
                </div>

                {authError && (
                  <div className="bg-rose-50 border border-rose-100 rounded-2xl p-3 flex gap-2 text-xs text-rose-700 font-semibold">
                    <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                    <p>{authError}</p>
                  </div>
                )}

                {otpSuccessMessage && (
                  <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-3 flex gap-2 text-xs text-emerald-800 font-semibold">
                    <CheckCircle size={16} className="flex-shrink-0 mt-0.5 text-emerald-600" />
                    <p>{otpSuccessMessage}</p>
                  </div>
                )}

                {/* If SMTP is active or not configured, show simulated helper */}
                {simulatedOtp && (
                  <div className="bg-cyan-50/50 border border-cyan-150/80 rounded-2xl p-3 text-center space-y-0.5">
                    <p className="text-[9px] text-cyan-600 font-black uppercase tracking-wider">Msimbo (Simulation / Console)</p>
                    <p className="text-lg font-mono font-black text-cyan-800 tracking-[6px]">{simulatedOtp}</p>
                    <p className="text-[8px] text-slate-400 font-semibold">Kama barua pepe bado haijafika, unaweza kutumia nambari hii kuendelea.</p>
                  </div>
                )}

                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="space-y-2">
                    <input
                      type="text"
                      maxLength={6}
                      required
                      placeholder="000000"
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-slate-50 border-2 border-slate-200 focus:border-cyan-500 rounded-2xl py-3 text-center font-mono text-2xl font-black tracking-[12px] focus:outline-none transition-all placeholder:tracking-normal placeholder:font-sans placeholder:text-slate-300"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 disabled:from-slate-300 disabled:to-slate-300 text-white font-black text-xs py-3.5 rounded-xl transition-all shadow-md uppercase tracking-wider flex items-center justify-center gap-2 hover:scale-[1.01]"
                  >
                    {authLoading ? 'Inathibitisha...' : 'Thibitisha Nambari ya Siri'}
                  </button>

                  <button
                    type="button"
                    onClick={handleAutoVerify}
                    disabled={authLoading}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:from-slate-300 disabled:to-slate-300 text-white font-black text-xs py-3.5 rounded-xl transition-all shadow-md uppercase tracking-wider flex items-center justify-center gap-2 hover:scale-[1.01] mt-2"
                  >
                    <CheckCircle2 size={14} />
                    {authLoading ? 'Inaprosesi...' : 'Ruka & Thibitisha Moja kwa Moja (Auto-Verify)'}
                  </button>
                </form>

                <div className="flex flex-col gap-2 pt-2 text-center border-t border-slate-100">
                  <button
                    onClick={handleResendOtp}
                    disabled={otpResending}
                    className="text-[11px] font-extrabold text-cyan-600 hover:text-cyan-700 hover:underline transition-colors disabled:text-slate-400"
                  >
                    {otpResending ? 'Inatuma upya...' : 'Tuma upya Nambari ya Siri'}
                  </button>

                  <button
                    onClick={async () => {
                      setAuthError(null);
                      setOtpSuccessMessage(null);
                      setOtpInput('');
                      try {
                        await auth.signOut();
                      } catch (e) {
                        console.error(e);
                      }
                      setAuthTab('login');
                    }}
                    className="text-[11px] font-extrabold text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    &larr; Anza upya (Log Out)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── POLICY AND TERMS MODAL (Sera ya Faragha na Vigezo) ── */}
      {activePolicyDoc && (
        <div className="fixed inset-0 z-[180] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
            onClick={closePolicyDoc}
          ></div>
          
          <div className="relative bg-white border border-slate-100 w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-fade-in z-[190] text-slate-800">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-cyan-50 text-cyan-600 rounded-xl">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-base uppercase text-slate-900 leading-none">
                    {activePolicyDoc === 'privacy' 
                      ? (language === 'sw' ? 'Sera ya Faragha' : 'Privacy Policy') 
                      : (language === 'sw' ? 'Vigezo na Masharti' : 'Terms & Conditions')
                    }
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                    {language === 'sw' ? 'Marekebisho ya mwisho: Julai 2026' : 'Last updated: July 2026'}
                  </p>
                </div>
              </div>
              <button
                onClick={closePolicyDoc}
                className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Body (Scrollable) */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-xs sm:text-sm text-slate-600 leading-relaxed font-semibold">
              {activePolicyDoc === 'privacy' ? (
                // PRIVACY POLICY CONTENT
                language === 'sw' ? (
                  <div className="space-y-4">
                    <p className="text-slate-800 font-medium">
                      Karibu kwenye Lupanulla Elimu Hub. Tunaheshimu sana faragha yako na tumejitolea kulinda taarifa zako binafsi unapotumia jukwaa letu. Sera hii ya faragha inaeleza jinsi tunavyokusanya, kutumia, na kulinda taarifa zako.
                    </p>

                    <div className="space-y-2">
                      <h4 className="font-display font-extrabold text-xs uppercase text-slate-950 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                        1. Taarifa Tunazokusanya (Data Collection)
                      </h4>
                      <p className="text-slate-500 text-xs pl-3">
                        Tunapata taarifa binafsi kama barua pepe (email), jina kamili, na namba ya simu unapojisajili, unapotuma kazi, au unapojiunga na mpango vya Premium. Taarifa hizi huhifadhiwa kwa njia salama kwa kutumia mifumo iliyothibitishwa ya Google Firebase na Cloud Firestore.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-display font-extrabold text-xs uppercase text-slate-950 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                        2. Matumizi ya Taarifa (How We Use It)
                      </h4>
                      <p className="text-slate-500 text-xs pl-3">
                        Tunatumia taarifa zako kukupa huduma stahiki, ikiwemo kukuruhusu kupakua nyaraka za mitaala, kuingiliana na msaidizi mahiri wa akili ya bandia (Lupanulla AI), kufuatilia maendeleo ya kimasomo kwenye "Leaderboard", na kukutumia ujumbe muhimu wa kiutendaji.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-display font-extrabold text-xs uppercase text-slate-950 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                        3. Usalama wa Malipo na Miamala
                      </h4>
                      <p className="text-slate-500 text-xs pl-3">
                        Malipo yote ya Premium na vitabu vya duka yanathibitishwa kupitia namba ya muamala (Transaction ID / Ref) pekee. Lupanulla Hub haihifadhi, haisomi, na haitakaa iitishe namba yako ya siri ya huduma za kifedha (M-Pesa, Tigo Pesa au Airtel Money). Malipo yanashughulikiwa salama kwa mawasiliano rasmi.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-display font-extrabold text-xs uppercase text-slate-950 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                        4. Google AdSense na Washirika wa Matangazo
                      </h4>
                      <p className="text-slate-500 text-xs pl-3">
                        Tunatumia matangazo ya Google AdSense na washirika wengine kuonyesha matangazo kwenye jukwaa ili kugharamia mitambo yetu (hosting servers) na kuendelea kutoa notisi bora bila malipo. Google inaweza kutumia kuki (cookies) kuonyesha matangazo yanayokidhi matakwa yako ya kivinjari.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-display font-extrabold text-xs uppercase text-slate-950 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                        5. Mabadiliko ya Sera Hii
                      </h4>
                      <p className="text-slate-500 text-xs pl-3">
                        Tunaweza kuboresha sera hii mara kwa mara ili kuendana na mabadiliko ya kisheria na teknolojia. Tutaweka tarehe ya maboresho juu ya ukurasa huu mara marekebisho yanapofanyika.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-slate-800 font-medium">
                      Welcome to Lupanulla Elimu Hub. We highly respect your privacy and are committed to safeguarding your personal information. This privacy policy describes how we collect, use, and protect your data.
                    </p>

                    <div className="space-y-2">
                      <h4 className="font-display font-extrabold text-xs uppercase text-slate-950 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                        1. Information We Collect
                      </h4>
                      <p className="text-slate-500 text-xs pl-3">
                        We collect personal information such as your email address, full name, and phone number when you sign up, upload content, or subscribe to our Premium packages. This data is securely stored using certified Google Firebase and Cloud Firestore infrastructure.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-display font-extrabold text-xs uppercase text-slate-950 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                        2. How We Use Your Information
                      </h4>
                      <p className="text-slate-500 text-xs pl-3">
                        Your information is used to provide you with school resources, allow unlimited downloads of academic notes and past papers, support interaction with our AI tutor (Lupanulla AI), track learning rewards on the Leaderboard, and communicate crucial account updates.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-display font-extrabold text-xs uppercase text-slate-950 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                        3. Transaction and Mobile Money Security
                      </h4>
                      <p className="text-slate-500 text-xs pl-3">
                        All payments for premium materials are verified solely through the receipt of mobile money Transaction IDs. Lupanulla Hub never saves, intercepts, or asks for your mobile money secret PIN. All transactions are handled securely through trusted direct verification channels.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-display font-extrabold text-xs uppercase text-slate-950 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                        4. Google AdSense and Third-Party Advertising
                      </h4>
                      <p className="text-slate-500 text-xs pl-3">
                        We display Google AdSense ads and work with external ad networks to monetize content. This revenue allows us to maintain cloud servers and keep core educational resources free. Google may use cookies to serve personalized ads based on your web activity.
                      </p>
                    </div>
                  </div>
                )
              ) : (
                // TERMS AND CONDITIONS CONTENT
                language === 'sw' ? (
                  <div className="space-y-4">
                    <p className="text-slate-800 font-medium">
                      Kwa kutumia jukwaa la Lupanulla Elimu Hub, unakubaliana na vigezo na masharti haya ya matumizi. Tafadhali soma kwa makini kabla ya kuendelea kutumia mifumo yetu.
                    </p>

                    <div className="space-y-2">
                      <h4 className="font-display font-extrabold text-xs uppercase text-slate-950 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                        1. Matumizi ya Maudhui na Hakimiliki
                      </h4>
                      <p className="text-slate-500 text-xs pl-3">
                        Nyaraka zote, mitihani, na notisi zinazopatikana kwenye jukwaa hili ni kwa ajili ya matumizi yako binafsi ya kimasomo tu. Ni marufuku kabisa kunakili, kuchapisha upya kibiashara, au kusambaza vitabu na notisi hizi kwenye mifumo mingine bila kupata kibali cha maandishi kutoka Lupanulla Foundation.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-display font-extrabold text-xs uppercase text-slate-950 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                        2. Uanachama wa Premium na Malipo
                      </h4>
                      <p className="text-slate-500 text-xs pl-3">
                        Unapojiunga na kifurushi cha Premium, utapata uwezo vya kudownload PDF bila kikomo na huduma ya msaidizi wa akili mnemba ya Lupanulla AI. Malipo yanayofanywa kwa ajili ya uanachama wa Premium au ununuzi vya vitabu ni ya mwisho na hayarudishwi (Non-refundable) pindi tu huduma inapowezeshwa kwenye akaunti yako.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-display font-extrabold text-xs uppercase text-slate-950 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                        3. Sheria za Tabia na Michango (Forum Rules)
                      </h4>
                      <p className="text-slate-500 text-xs pl-3">
                        Watumiaji wanaweza kuchangia mijadala ya kimasomo au kupakia faili. Ni marufuku kupakia nyaraka zenye kashfa, lugha isiyo ya maadili, maudhui yasiyo ya kimasomo, au nyaraka zinazokiuka hakimiliki. Lupanulla Foundation ina haki ya kufuta maudhui hayo na kuzuia akaunti ya mtumiaji husika bila taarifa.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-display font-extrabold text-xs uppercase text-slate-950 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                        4. Ukomo wa Dhima (Disclaimer)
                      </h4>
                      <p className="text-slate-500 text-xs pl-3">
                        Maudhui yote na notisi zimeandaliwa kwa uangalifu mkubwa na walimu wetu. Hata hivyo, mtaala unaweza kubadilika na msaidizi wetu wa Lupanulla AI anaweza kutoa majibu yenye hitilafu wakati mwingine. Mtumiaji anashauriwa kutumia maudhui haya sambamba na miongozo rasmi ya Wizara ya Elimu na Baraza la Mitihani la Tanzania (NECTA).
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-slate-800 font-medium">
                      By accessing and using Lupanulla Elimu Hub, you agree to comply with and be bound by the following terms and conditions of service. Please review them carefully.
                    </p>

                    <div className="space-y-2">
                      <h4 className="font-display font-extrabold text-xs uppercase text-slate-950 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                        1. Use of Educational Resources and Copyrights
                      </h4>
                      <p className="text-slate-500 text-xs pl-3">
                        All examination materials, notes, booklets, and files provided on this hub are strictly for individual educational purposes. Commercial redistribution, unauthorized re-publishing, or mass sharing of these materials without written consent from Lupanulla Foundation is strictly prohibited.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-display font-extrabold text-xs uppercase text-slate-950 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                        2. Premium Membership and Refund Policy
                      </h4>
                      <p className="text-slate-500 text-xs pl-3">
                        Subscribing to a Premium package grants you unlimited downloads of PDFs and full interaction with our AI-powered tutor (Lupanulla AI). All payments made towards Premium plans or book orders are final and completely non-refundable once the service is activated.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-display font-extrabold text-xs uppercase text-slate-950 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                        3. User Contributions & Upload Rules
                      </h4>
                      <p className="text-slate-500 text-xs pl-3">
                        When contributing to forums or uploading study papers, users are prohibited from uploading offensive content, non-educational files, or copyrighted material. We reserve the right to remove any inappropriate content and suspend accounts violating these terms.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-display font-extrabold text-xs uppercase text-slate-950 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                        4. Disclaimer of Warranties & Liability
                      </h4>
                      <p className="text-slate-500 text-xs pl-3">
                        While our educators make every effort to keep materials accurate, curricula evolve and the Lupanulla AI assistant may occasionally output errors. Users are encouraged to utilize these tools in conjunction with official NECTA syllabus guidelines.
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>

            {/* Footer buttons of Modal */}
            <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button
                onClick={closePolicyDoc}
                className="px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs tracking-tight transition-all cursor-pointer shadow-md"
              >
                {language === 'sw' ? 'Nimeelewa na Kukubali' : 'I Understand & Accept'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cookie Consent Banner */}
      {showCookieConsent && (
        <div 
          id="cookie-consent-banner"
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:w-[420px] bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-2xl p-5 sm:p-6 z-50 flex flex-col gap-4 animate-fade-in transition-all duration-300"
        >
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-amber-50 text-amber-500 rounded-2xl shrink-0">
              <Cookie size={20} />
            </div>
            <div className="space-y-1">
              <h4 className="font-display font-black text-slate-950 text-sm tracking-tight">
                {language === 'sw' ? 'Taarifa Kuhusu Vidakuzi (Cookies)' : 'Cookie Consent Notice'}
              </h4>
              <p className="text-slate-500 text-xs leading-relaxed">
                {language === 'sw' 
                  ? 'Lupanulla Elimu Hub inatumia vidakuzi (cookies) kuboresha uzoefu wako wa kusoma, usalama wa akaunti yako, na kuonyesha matangazo yanayokufaa ya Google AdSense.'
                  : 'Lupanulla Elimu Hub uses cookies to enhance your learning experience, ensure account security, and deliver personalized Google AdSense ads.'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-end gap-2.5 pt-1.5 border-t border-slate-100/80">
            <button
              onClick={() => setActivePolicyDoc('privacy')}
              className="px-3.5 py-2 text-[11px] font-bold text-slate-500 hover:text-slate-900 transition-colors"
            >
              {language === 'sw' ? 'Sera ya Faragha' : 'Privacy Policy'}
            </button>
            <button
              onClick={handleAcceptCookies}
              className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-white font-extrabold text-[11px] tracking-tight rounded-xl cursor-pointer shadow-md shadow-slate-950/10 transition-all duration-200"
            >
              {language === 'sw' ? 'Nimeelewa na Kukubali' : 'I Accept'}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
