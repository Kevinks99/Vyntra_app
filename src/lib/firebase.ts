import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  onAuthStateChanged,
  User,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot,
  collection
} from 'firebase/firestore';
import { AppState, RankedUser } from '../types';

// Web App configuration from firebase-applet-config.json
const firebaseConfig = {
  apiKey: "AIzaSyCtUQdKWV6TfhLSmhHtHvCDv8XrykEdHI4",
  authDomain: "gen-lang-client-0945092332.firebaseapp.com",
  projectId: "gen-lang-client-0945092332",
  storageBucket: "gen-lang-client-0945092332.firebasestorage.app",
  messagingSenderId: "229764877928",
  appId: "1:229764877928:web:723148031a49780c1df5dd"
};

const app = initializeApp(firebaseConfig);

// Connect to the specific firestore database ID provided in the config
export const db = getFirestore(app, "ai-studio-vyntra-a77d9589-e0ae-4be5-a4c2-44aa9fd9d9fd");
export const auth = getAuth(app);

// Authentication Functions
export async function registerWithEmail(email: string, password: string, name: string): Promise<User> {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  
  // Create default user profile in Firestore
  const docRef = doc(db, 'users', user.uid);
  await setDoc(docRef, {
    profile: {
      name: name,
      location: 'São Paulo',
      temperature: '24°C',
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDzEsS18JVcfROhaddVaM8zWmZg1gBPube1uEVvvWEeKP9X3KZEg6_cuRHes2nCRQp1oD9YrtL1HY9nejHJDdJLzIahW2bz39CMHK-JrdjJnADMCocsd993rX0-MQifZRxZbOiVmlljtCiwerybuPp_U_QZgLFK4xI1ID6L_kbIVKrV0eI-ql64lnbtJG5Tj6E15254IzesjQJVzFCk9ux2Duf8BD9OfTmaS4V16orG6rWqaf1_GOGpbU9oFkNNBOXuwL2hG5utqGgr',
      avatarSleepUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDPgCPHF20wV8Y3uTUah-v8nqCuBJFN6yoHTUW4Wxljca2_PlJhKSnFgouNzMd6VbhW9LLuGjTjZjPu0M_m-OqRCw5Uh72XRisQbfBUvuarK8WWFE1MOtmVmBagow3Qc4BfNWYy5Kaw5wW0DY_G4Wduq4iOTuxIGbka9ttm9ggOMjoXecUkcs3oe74KJgBnpdL_epPs2frCzRVGCpiQs6aR_inl4f4Cdba7hTowaW4AqFs6xP5B2ZjWBTllZFZ2DPTlVpwaWrHAxS3c',
      avatarFitnessUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBMowAmWp3caQksLv9Ag6keMKMcNXsPQlkszgr_NCEmGLq3dNecskKSgLCfDDDl1YjsKit0GahUJ5cH7eCYXzMhkVRjAopldXURo2_dKRgAnspoFnQSo4FGNXwxt7C7cg4eJQQCIxbQ3BZ8RpewLADaTX75cXtj7pQiPc8ZlxQDI6sJqYE4t4jey9R43DK6ytM8UwxZ3puxMuE_7FN-w0lT51T5kqhhXICbX2zj8oaI4E42J1jTQBVSYqljTQLkzjTzPzdabOpmNDbi',
      avatarWeightUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC7ARiCyRheEE-j4dBPZFDzWR45VW1Uv4lQSE8aN7QqUu9wp_4f0G3A4s0foj6nfUiRgzGl3iM3EKKbgdX-4SIB9v_T_xEvN995-KbF9CUS4oUTzgfyRVri5Xo3N0gDSXQ7KklFyILLHa9ydubdCCbCvDvmzBsf6IOHdJhjrBb0OuolI7eHzQr6wv0uevtaQI0aDdQwRVr4LBao8mqyO45Fjznpc6D9ZOraaqxtUwvESdEtfSttll-reISXG50B4wk3QrY2Fj_RI86A',
      avatarNutritionUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBUkg_45qSsu6agcbxzOWBPGptdQO_cAGPVYyzL01Dvp7Lzo3_wZcRfOHGMWNI5FxzjCt7LBo9vc4pMq7YX9b5d2zsgj1WSVslH-uaANU2FsHK4usdMfX8YU_qYD-Is-QLbej5Td49c1lAWwAwtXfpZAr4gyjou_aYDFmTS3kMs7PeNFcdpL3Czu0h4ym4aFdU-PfR3UopObyL2cxfKHUngf3drN962bVROuM85Q8_b3e4UpT-DwLkZsoYjzot7A00Vu2g0GWmVBfb-',
      streakDays: 1,
    }
  }, { merge: true });

  return user;
}

export async function loginWithEmail(email: string, password: string): Promise<User> {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

export async function loginWithGoogle(): Promise<User> {
  const provider = new GoogleAuthProvider();
  // Request profile and email scopes
  provider.addScope('profile');
  provider.addScope('email');
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

export async function loginWithApple(): Promise<User> {
  const provider = new OAuthProvider('apple.com');
  provider.addScope('email');
  provider.addScope('name');
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

export async function loginWithMicrosoft(): Promise<User> {
  const provider = new OAuthProvider('microsoft.com');
  provider.addScope('mail.read');
  provider.addScope('user.read');
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

export async function logout(): Promise<void> {
  await signOut(auth);
}

export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

// Database Persistence Functions
export async function saveUserState(userId: string, state: AppState): Promise<void> {
  const docRef = doc(db, 'users', userId);
  await setDoc(docRef, state, { merge: true });
}

export async function overwriteUserState(userId: string, state: AppState): Promise<void> {
  const docRef = doc(db, 'users', userId);
  await setDoc(docRef, state);
}

export async function getUserState(userId: string): Promise<AppState | null> {
  const docRef = doc(db, 'users', userId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data() as AppState;
  }
  return null;
}

export function subscribeToUserState(userId: string, callback: (state: AppState | null) => void) {
  const docRef = doc(db, 'users', userId);
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data() as AppState);
    } else {
      callback(null);
    }
  });
}

export function subscribeToAllUsers(callback: (users: RankedUser[]) => void) {
  const collRef = collection(db, 'users');
  return onSnapshot(collRef, (snapshot) => {
    const users: RankedUser[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as AppState;
      if (data && data.profile) {
        const profile = data.profile;
        const userStreak = profile.streakDays || 0;
        const userWorkoutsCount = data.workouts?.length || 0;
        const userWaterCount = data.waterIntakeCups || 0;
        const userBooksRead = data.books?.filter(b => b.progressPercent === 100).length || 0;
        const userPoints = (userStreak * 150) + (userWorkoutsCount * 120) + (userWaterCount * 15) + (userBooksRead * 500) + 750;

        users.push({
          id: docSnap.id,
          name: profile.name || 'Competidor Vyntra',
          avatarUrl: profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200&h=200',
          points: userPoints,
          streak: userStreak,
          rank: 0
        });
      }
    });
    callback(users);
  });
}
