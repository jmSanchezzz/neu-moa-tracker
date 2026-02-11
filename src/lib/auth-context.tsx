
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  signInAnonymously,
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
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
          const usersRef = collection(db, 'users');
          const q = query(usersRef, where('email', '==', storedEmail));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const userData = querySnapshot.docs[0].data() as User;
            
            if (userData.isBlocked) {
              await signOut(auth);
              localStorage.removeItem('neu_moa_test_session');
              setUser(null);
            } else {
              setUser(userData);
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
    if (!email.endsWith('@neu.edu.ph')) {
      toast({
        variant: "destructive",
        title: "Domain Violation",
        description: "Access is restricted to @neu.edu.ph institutional accounts.",
      });
      return;
    }

    try {
      await signInAnonymously(auth);
      
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);

      let userData: User;

      if (!querySnapshot.empty) {
        userData = querySnapshot.docs[0].data() as User;
        
        // Ensure hardcoded test users have their roles synced even if modified in DB for testing stability
        let needsSync = false;
        if (email === 'johnmarc.sanchez@neu.edu.ph' && (userData.role !== 'ADMIN' || !userData.canEdit)) {
          userData.role = 'ADMIN';
          userData.canEdit = true;
          needsSync = true;
        } else if (email === 'faculty@neu.edu.ph' && (userData.role !== 'FACULTY' || !userData.canEdit)) {
          userData.role = 'FACULTY';
          userData.canEdit = true;
          needsSync = true;
        } else if (email === 'student@neu.edu.ph' && (userData.role !== 'STUDENT' || userData.canEdit)) {
          userData.role = 'STUDENT';
          userData.canEdit = false;
          needsSync = true;
        }

        if (needsSync) {
          await setDoc(doc(db, 'users', userData.id), { role: userData.role, canEdit: userData.canEdit }, { merge: true });
          if (userData.role === 'ADMIN') {
            await setDoc(doc(db, 'roles_admin', userData.id), { uid: userData.id });
          }
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
      } else {
        // Determine role based on hardcoded test addresses
        let role: UserRole = 'STUDENT';
        let canEdit = false;

        if (email === 'johnmarc.sanchez@neu.edu.ph') {
          role = 'ADMIN';
          canEdit = true;
        } else if (email === 'faculty@neu.edu.ph') {
          role = 'FACULTY';
          canEdit = true;
        } else if (email === 'student@neu.edu.ph') {
          role = 'STUDENT';
          canEdit = false;
        }

        const newUid = auth.currentUser?.uid || Date.now().toString();
        
        userData = {
          id: newUid,
          name: email.split('@')[0].split('.').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' '),
          email: email,
          role: role,
          isBlocked: false,
          canEdit: canEdit,
        };

        await setDoc(doc(db, 'users', newUid), userData);
        
        if (role === 'ADMIN') {
          await setDoc(doc(db, 'roles_admin', newUid), { uid: newUid });
        }

        toast({
          title: "Profile Created",
          description: `Logged in as ${role}.`,
        });
      }

      localStorage.setItem('neu_moa_test_session', email);
      setUser(userData);
      router.push('/dashboard');
      
    } catch (error: any) {
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
