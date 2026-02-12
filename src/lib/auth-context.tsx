
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  signInAnonymously,
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
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
const ADMIN_EMAILS = ['johnmarc.sanchez@neu.edu.ph', 'johnmarc@neu.edu.ph'];

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
          // Check for user document by UID first
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
            // Search by email to link sessions
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('email', '==', storedEmail));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
              const userData = querySnapshot.docs[0].data() as User;
              const updatedData = { ...userData, id: firebaseUser.uid };
              await setDoc(doc(db, 'users', firebaseUser.uid), updatedData);
              setUser(updatedData);
            }
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
      const isStudent = normalizedEmail === 'student@neu.edu.ph';

      let role: UserRole = 'STUDENT';
      let canEdit = false;

      if (isAdmin) {
        role = 'ADMIN';
        canEdit = true;
      } else if (isFaculty) {
        role = 'FACULTY';
        canEdit = true;
      }

      // Check for existing user by email
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', normalizedEmail));
      const querySnapshot = await getDocs(q);

      let userData: User;

      if (!querySnapshot.empty) {
        const existingData = querySnapshot.docs[0].data() as User;
        userData = { 
          ...existingData, 
          id: currentUid, 
          role: isAdmin ? 'ADMIN' : (isFaculty ? 'FACULTY' : (isStudent ? 'STUDENT' : existingData.role)),
          canEdit: isAdmin ? true : (isFaculty ? true : (isStudent ? false : existingData.canEdit))
        };
      } else {
        userData = {
          id: currentUid,
          name: normalizedEmail.split('@')[0].split('.').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' '),
          email: normalizedEmail,
          role: role,
          isBlocked: false,
          canEdit: canEdit,
        };
      }

      if (userData.isBlocked) {
        toast({
          variant: "destructive",
          title: "Access Revoked",
          description: "This account has been administratively blocked.",
        });
        await signOut(auth);
        return;
      }

      // Save user record first
      await setDoc(doc(db, 'users', currentUid), userData);
      
      // If Admin, sync roles_admin for Firestore security rules
      if (userData.role === 'ADMIN') {
        await setDoc(doc(db, 'roles_admin', currentUid), { uid: currentUid, email: normalizedEmail });
      } else {
        await deleteDoc(doc(db, 'roles_admin', currentUid)).catch(() => {});
      }

      localStorage.setItem('neu_moa_test_session', normalizedEmail);
      setUser(userData);
      
      toast({
        title: "Access Granted",
        description: `Logged in as ${userData.role}.`,
      });

      router.push('/dashboard');
      
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        variant: "destructive",
        title: "System Error",
        description: error.message,
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
