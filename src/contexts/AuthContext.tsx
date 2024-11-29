import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile as updateFirebaseProfile,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
  User as FirebaseUser,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { createContext, useContext, useEffect, useState } from 'react';

interface User {
  uid: string;
  email: string | null;
  name: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: { name?: string; email?: string }) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>; // Added
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (!userDoc.exists()) {
            // Create user document if it doesn't exist
            await setDoc(userDocRef, {
              email: firebaseUser.email,
              name: firebaseUser.displayName,
              createdAt: new Date().toISOString(),
            });
          }

          const userData = userDoc.data();
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: userData?.name || firebaseUser.displayName,
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const signup = async (email: string, password: string, name: string) => {
    try {
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);

      // Update Firebase Auth profile
      await updateFirebaseProfile(firebaseUser, { displayName: name });

      // Create user document in Firestore
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        email,
        name,
        createdAt: new Date().toISOString(),
      });

      setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        name,
      });
    } catch (error: any) {
      console.error('Signup error:', error);
      throw new Error(error.message);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { user: firebaseUser } = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      const userData = userDoc.data();

      setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        name: userData?.name || firebaseUser.displayName,
      });
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error: any) {
      console.error('Logout error:', error);
      throw new Error(error.message);
    }
  };

  const updateProfile = async (data: { name?: string; email?: string }) => {
    if (!user) throw new Error('No user logged in');

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, data);

      if (data.name) {
        await updateFirebaseProfile(auth.currentUser as FirebaseUser, {
          displayName: data.name,
        });
      }

      setUser((prev) => (prev ? { ...prev, ...data } : null));
    } catch (error: any) {
      console.error('Profile update error:', error);
      throw new Error(error.message);
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!auth.currentUser || !auth.currentUser.email) {
      throw new Error('No user is logged in or email is missing.');
    }

    const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);

    try {
      // Reauthenticate the user
      await reauthenticateWithCredential(auth.currentUser, credential);

      // Update the password
      await updatePassword(auth.currentUser, newPassword);
    } catch (error: any) {
      console.error('Password change failed:', error);
      throw new Error('Failed to change password. Please try again.');
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, signup, logout, updateProfile, changePassword }}
    >
      {children}
    </AuthContext.Provider>
  );
};