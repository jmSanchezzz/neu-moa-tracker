"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  GoogleAuthProvider,
  User as FirebaseUser,
  signInAnonymously,
  signInWithPopup,
  signOut, 
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc, writeBatch } from 'firebase/firestore';
import { useAuth as useFirebaseAuth, useFirestore } from '@/firebase';
import { User, UserRole } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';

type AuthContextType = {
  user: User | null;
  loginWithGoogle: () => Promise<void>;
  loginAsPrototype: (role: 'ADMIN' | 'FACULTY' | 'STUDENT') => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
};

const ADMIN_EMAILS = [
  'johnmarc.sanchez@neu.edu.ph',
  'jcesperanza@neu.edu.ph'
];

const PROTOTYPE_ACCOUNTS: Record<'ADMIN' | 'FACULTY' | 'STUDENT', { email: string; name: string; role: UserRole; canEdit: boolean }> = {
  ADMIN:   { email: 'admin@neu.edu.ph',   name: 'Admin User',   role: 'ADMIN',   canEdit: true  },
  FACULTY: { email: 'faculty@neu.edu.ph', name: 'Faculty User', role: 'FACULTY', canEdit: true  },
  STUDENT: { email: 'student@neu.edu.ph', name: 'Student User', role: 'STUDENT', canEdit: false },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function resolveRoleFromEmail(email: string): { role: UserRole; canEdit: boolean } {
  const normalizedEmail = email.toLowerCase().trim();
  if (ADMIN_EMAILS.includes(normalizedEmail)) {
    return { role: 'ADMIN', canEdit: true };
  }
  return { role: 'STUDENT', canEdit: false };
}

function formatNameFromEmail(email: string, displayName?: string | null) {
  if (displayName?.trim()) {
    return displayName.trim();
  }

  const localPart = email.split('@')[0] ?? '';
  const formattedName = localPart
    .split('.')
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');

  return formattedName || 'Institutional User';
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const auth = useFirebaseAuth();
  const db = useFirestore();
  const { toast } = useToast();
  const loginInProgressRef = useRef(false);

  const hydrateAuthenticatedUser = async (
    firebaseUser: FirebaseUser,
    options?: {
      expectedEmail?: string;
      showSuccessToast?: boolean;
    }
  ) => {
    if (firebaseUser.isAnonymous) {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const restoredUser = userDoc.data() as User;
        if (!restoredUser.isBlocked) {
          return restoredUser;
        }
        await signOut(auth);
        toast({
          variant: 'destructive',
          title: 'Access Blocked',
          description: 'Your prototype account has been blocked.',
        });
      } else {
        await signOut(auth);
      }
      return null;
    }

    const authenticatedEmail = (firebaseUser.email ?? '').toLowerCase().trim();

    if (!authenticatedEmail || !authenticatedEmail.endsWith('@neu.edu.ph')) {
      await signOut(auth);
      toast({
        variant: 'destructive',
        title: 'Domain Violation',
        description: 'Access is restricted to @neu.edu.ph Google accounts.',
      });
      return null;
    }

    const userRef = doc(db, 'users', firebaseUser.uid);
    const userDoc = await getDoc(userRef);
    const { role, canEdit } = resolveRoleFromEmail(authenticatedEmail);

    if (userDoc.exists()) {
      const existingUser = userDoc.data() as User;

      if (existingUser.isBlocked) {
        await signOut(auth);
        toast({
          variant: 'destructive',
          title: 'Access Blocked',
          description: 'Your account has been blocked by an administrator.',
        });
        return null;
      }

      const synchronizedUser: User = {
        ...existingUser,
        id: firebaseUser.uid,
        email: authenticatedEmail,
        name: existingUser.name || formatNameFromEmail(authenticatedEmail, firebaseUser.displayName),
        role: existingUser.role === 'STUDENT' && role === 'ADMIN' ? 'ADMIN' : existingUser.role,
        canEdit: existingUser.canEdit || (role === 'ADMIN'),
      };

      const batch = writeBatch(db);
      batch.set(userRef, synchronizedUser, { merge: true });
      
      if (synchronizedUser.role === 'ADMIN') {
        const adminRef = doc(db, 'roles_admin', firebaseUser.uid);
        batch.set(adminRef, { uid: firebaseUser.uid, email: authenticatedEmail }, { merge: true });
      }

      await batch.commit();

      if (options?.showSuccessToast) {
        toast({
          title: 'Access Granted',
          description: `Logged in as ${synchronizedUser.role}. Institutional registry synchronized.`,
        });
      }

      return synchronizedUser;
    }

    const bootstrapUser: User = {
      id: firebaseUser.uid,
      name: formatNameFromEmail(authenticatedEmail, firebaseUser.displayName),
      email: authenticatedEmail,
      role,
      isBlocked: false,
      canEdit,
    };

    const batch = writeBatch(db);
    batch.set(userRef, bootstrapUser, { merge: true });
    
    if (role === 'ADMIN') {
      const adminRef = doc(db, 'roles_admin', firebaseUser.uid);
      batch.set(adminRef, { uid: firebaseUser.uid, email: authenticatedEmail }, { merge: true });
    }

    await batch.commit();

    if (options?.showSuccessToast) {
      toast({
        title: 'Access Granted',
        description: `Logged in as ${role}. Institutional registry synchronized.`,
      });
    }

    return bootstrapUser;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (loginInProgressRef.current) {
        return;
      }

      if (!firebaseUser) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const hydratedUser = await hydrateAuthenticatedUser(firebaseUser);
        setUser(hydratedUser);
      } catch (error) {
        console.error('Auth sync error:', error);
        setUser(null);
      }

      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [auth, db]);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      hd: 'neu.edu.ph',
      prompt: 'select_account',
    });

    loginInProgressRef.current = true;
    setIsLoading(true);

    try {
      const result = await signInWithPopup(auth, provider);
      const hydratedUser = await hydrateAuthenticatedUser(result.user, {
        showSuccessToast: true,
      });

      setUser(hydratedUser);

      if (hydratedUser) {
        router.push(hydratedUser.role === 'STUDENT' ? '/dashboard/moas' : '/dashboard');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        variant: 'destructive',
        title: 'System Error',
        description: 'Google authentication failed. Please try again.',
      });
    } finally {
      loginInProgressRef.current = false;
      setIsLoading(false);
    }
  };

  const loginAsPrototype = async (role: 'ADMIN' | 'FACULTY' | 'STUDENT') => {
    const account = PROTOTYPE_ACCOUNTS[role];
    loginInProgressRef.current = true;
    setIsLoading(true);
    try {
      const existingUid = auth.currentUser?.uid;
      const uid = existingUid ?? (await signInAnonymously(auth)).user.uid;
      if (!uid) throw new Error('Failed to initialize prototype session.');
      const prototypeUser: User = {
        id: uid,
        email: account.email,
        name: account.name,
        role: account.role,
        isBlocked: false,
        canEdit: account.canEdit,
      };
      const batch = writeBatch(db);
      batch.set(doc(db, 'users', uid), prototypeUser, { merge: true });
      if (account.role === 'ADMIN') {
        batch.set(doc(db, 'roles_admin', uid), { uid, email: account.email }, { merge: true });
      }
      await batch.commit();
      setUser(prototypeUser);
      toast({
        title: `Prototype: ${account.role}`,
        description: `Signed in as ${account.name} (${account.email}).`,
      });
      router.push(account.role === 'STUDENT' ? '/dashboard/moas' : '/dashboard');
    } catch (error) {
      console.error('Prototype login error:', error);
      toast({
        variant: 'destructive',
        title: 'Prototype Login Failed',
        description: 'Could not initialize prototype session.',
      });
    } finally {
      loginInProgressRef.current = false;
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loginWithGoogle, loginAsPrototype, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
