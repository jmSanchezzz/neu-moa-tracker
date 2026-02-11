
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth as useFirebaseAuth, useFirestore } from '@/firebase';
import { User, UserRole } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';

type AuthContextType = {
  user: User | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  promoteToAdmin: () => Promise<void>;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const auth = useFirebaseAuth();
  const db = useFirestore();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsLoading(true);
      if (firebaseUser) {
        // Institutional email check
        if (!firebaseUser.email?.endsWith('@neu.edu.ph')) {
          await signOut(auth);
          toast({
            variant: "destructive",
            title: "Access Denied",
            description: "Only institutional @neu.edu.ph emails are allowed.",
          });
          setUser(null);
          setIsLoading(false);
          return;
        }

        // Fetch user role from Firestore
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.isBlocked) {
            await signOut(auth);
            toast({
              variant: "destructive",
              title: "Account Blocked",
              description: "Your account has been blocked by an administrator.",
            });
            setUser(null);
          } else {
            // Ensure roles_admin entry exists if the role is ADMIN (sync for security rules)
            if (userData.role === 'ADMIN') {
              await setDoc(doc(db, 'roles_admin', firebaseUser.uid), { uid: firebaseUser.uid }, { merge: true });
            }
            
            setUser({
              id: firebaseUser.uid,
              name: userData.name || firebaseUser.displayName || 'User',
              email: firebaseUser.email || '',
              role: userData.role as UserRole,
              isBlocked: false,
              canEdit: userData.canEdit || false,
            });
          }
        } else {
          // PROTOTYPE HACK: New user defaults to ADMIN for testing purposes
          // In a production app, this would default to 'STUDENT'
          const newUser: User = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'New User',
            email: firebaseUser.email || '',
            role: 'ADMIN',
            isBlocked: false,
            canEdit: true,
          };
          
          await setDoc(userDocRef, newUser);
          // Also create the roles_admin document to satisfy security rules
          await setDoc(doc(db, 'roles_admin', firebaseUser.uid), { uid: firebaseUser.uid });
          
          setUser(newUser);
          toast({
            title: "Admin Account Created",
            description: "You have been granted Administrative access for testing.",
          });
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [auth, db, toast]);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ hd: 'neu.edu.ph' });
    try {
      await signInWithPopup(auth, provider);
      router.push('/dashboard');
    } catch (error: any) {
      console.error("Login Error:", error);
      if (error.code === 'auth/operation-not-allowed') {
        toast({
          variant: "destructive",
          title: "Configuration Error",
          description: "Google Sign-In is not enabled in the Firebase Console.",
        });
      } else if (error.code !== 'auth/popup-closed-by-user') {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: error.message,
        });
      }
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    router.push('/login');
  };

  const promoteToAdmin = async () => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    
    await setDoc(doc(db, 'users', uid), { role: 'ADMIN', canEdit: true }, { merge: true });
    await setDoc(doc(db, 'roles_admin', uid), { uid });
    
    toast({
      title: "Promoted to Admin",
      description: "Refresh the page to see administrative tools.",
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, promoteToAdmin, isLoading }}>
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
