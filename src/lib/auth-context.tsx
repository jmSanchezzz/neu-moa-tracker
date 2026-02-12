
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  signInAnonymously,
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, getDocs, deleteDoc, writeBatch } from 'firebase/firestore';
import { useAuth as useFirebaseAuth, useFirestore } from '@/firebase';
import { User, UserRole } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';

type AuthContextType = {
  user: User | null;
  loginWithEmail: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  promoteToAdmin: () => Promise<void>;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Recognized Admin Emails
const ADMIN_EMAILS = [
  'johnmarc.sanchez@neu.edu.ph', 
  'johnmarc@neu.edu.ph',
  'admin@neu.edu.ph'
];

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
      const storedEmail = localStorage.getItem('neu_moa_test_session');

      if (firebaseUser && storedEmail) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            if (userData.isBlocked) {
              await signOut(auth);
              localStorage.removeItem('neu_moa_test_session');
              setUser(null);
            } else {
              setUser(userData);
            }
          } else {
            // Re-bootstrap user if doc missing but email session exists
            await loginWithEmail(storedEmail);
          }
        } catch (e) {
          console.error("Auth sync error:", e);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [auth, db]);

  const loginWithEmail = async (email: string) => {
    const normalizedEmail = email.toLowerCase().trim();
    if (!normalizedEmail.endsWith('@neu.edu.ph')) {
      toast({
        variant: "destructive",
        title: "Domain Violation",
        description: "Access is restricted to @neu.edu.ph institutional accounts.",
      });
      return;
    }

    try {
      await signInAnonymously(auth);
      const currentUid = auth.currentUser?.uid;

      if (!currentUid) throw new Error("Failed to initialize session.");
      
      const isAdmin = ADMIN_EMAILS.some(e => e.toLowerCase() === normalizedEmail);
      const isFaculty = normalizedEmail === 'faculty@neu.edu.ph';

      let role: UserRole = 'STUDENT';
      let canEdit = false;

      if (isAdmin) {
        role = 'ADMIN';
        canEdit = true;
      } else if (isFaculty) {
        role = 'FACULTY';
        canEdit = true;
      }

      // Cleanup duplicate records for the same email (to prevent IAM clutter)
      const q = query(collection(db, 'users'), where('email', '==', normalizedEmail));
      const oldUsers = await getDocs(q);
      const batch = writeBatch(db);
      
      oldUsers.forEach((oldDoc) => {
        if (oldDoc.id !== currentUid) {
          batch.delete(oldDoc.ref);
          // Also cleanup admin docs if they existed for that old UID
          batch.delete(doc(db, 'roles_admin', oldDoc.id));
        }
      });

      // Prepare user data
      const userData: User = {
        id: currentUid,
        name: normalizedEmail.split('@')[0].split('.').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' '),
        email: normalizedEmail,
        role: role,
        isBlocked: false,
        canEdit: canEdit,
      };

      // Save user record and admin status in the same batch
      batch.set(doc(db, 'users', currentUid), userData, { merge: true });
      if (role === 'ADMIN') {
        batch.set(doc(db, 'roles_admin', currentUid), { uid: currentUid, email: normalizedEmail }, { merge: true });
      }
      
      await batch.commit();

      localStorage.setItem('neu_moa_test_session', normalizedEmail);
      setUser(userData);
      
      toast({
        title: "Access Granted",
        description: `Logged in as ${role}. Registry synchronized.`,
      });

      router.push('/dashboard');
      
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        variant: "destructive",
        title: "System Error",
        description: error.message || "Could not complete login process.",
      });
    }
  };

  const logout = async () => {
    localStorage.removeItem('neu_moa_test_session');
    await signOut(auth);
    setUser(null);
    router.push('/login');
  };

  const promoteToAdmin = async () => {
    if (!user) return;
    await setDoc(doc(db, 'users', user.id), { role: 'ADMIN', canEdit: true }, { merge: true });
    await setDoc(doc(db, 'roles_admin', user.id), { uid: user.id }, { merge: true });
    toast({
      title: "Elevated to Admin",
      description: "You now have full system control.",
    });
  };

  return (
    <AuthContext.Provider value={{ user, loginWithEmail, logout, promoteToAdmin, isLoading }}>
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
