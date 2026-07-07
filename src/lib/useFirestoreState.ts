import { useState, useEffect, useRef } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, saveUserState, overwriteUserState, subscribeToUserState } from './firebase';
import { AppState } from '../types';
import { INITIAL_STATE, getCleanInitialState } from '../data';

export function useFirestoreState() {
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Track current state via ref to avoid stale closures
  const stateRef = useRef<AppState>(state);
  stateRef.current = state;

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (!user) {
        setState(INITIAL_STATE);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    setLoading(true);
    
    // Subscribe to Firestore updates in real-time
    const unsubscribeSnapshot = subscribeToUserState(currentUser.uid, (cloudState) => {
      if (cloudState) {
        // Safe deep merge to prevent crashes if certain keys are missing or undefined
        const mergedState: AppState = {
          ...INITIAL_STATE,
          ...cloudState,
          profile: {
            ...INITIAL_STATE.profile,
            ...(cloudState.profile || {})
          },
          agendaEvents: cloudState.agendaEvents || [],
          courses: cloudState.courses || [],
          books: cloudState.books || [],
          recentActivities: cloudState.recentActivities || []
        };
        setState(mergedState);
      } else {
        // Document does not exist in Firestore yet (new user)
        const initialUserState = getCleanInitialState(
          currentUser.displayName || currentUser.email?.split('@')[0] || 'Novo Usuário'
        );
        
        // Auto-link inviter as contact if exists in localStorage (excluding self-invite)
        const invitedBy = localStorage.getItem('vyn_invited_by');
        const currentUserName = currentUser.displayName || currentUser.email?.split('@')[0] || 'Novo Usuário';
        if (invitedBy && invitedBy.toLowerCase() !== currentUserName.toLowerCase()) {
          const inviterContact = {
            id: 'inviter-' + Date.now(),
            name: invitedBy,
            avatarUrl: `https://lh3.googleusercontent.com/aida-public/AB6AXuDzEsS18JVcfROhaddVaM8zWmZg1gBPube1uEVvvWEeKP9X3KZEg6_cuRHes2nCRQp1oD9YrtL1HY9nejHJDdJLzIahW2bz39CMHK-JrdjJnADMCocsd993rX0-MQifZRxZbOiVmlljtCiwerybuPp_U_QZgLFK4xI1ID6L_kbIVKrV0eI-ql64lnbtJG5Tj6E15254IzesjQJVzFCk9ux2Duf8BD9OfTmaS4V16orG6rWqaf1_GOGpbU9oFkNNBOXuwL2hG5utqGgr`,
            points: Math.floor(Math.random() * 800) + 1200,
            streak: Math.floor(Math.random() * 5) + 3,
            rank: 0
          };
          initialUserState.contacts = [inviterContact];
        }

        saveUserState(currentUser.uid, initialUserState).catch((err) => {
          console.error("Error setting initial state in Firestore:", err);
        });
        setState(initialUserState);
      }
      setLoading(false);
    });

    return () => unsubscribeSnapshot();
  }, [currentUser]);

  const handleStateChange = async (newState: AppState | ((prev: AppState) => AppState), overwrite = false) => {
    const resolved = typeof newState === 'function' ? newState(stateRef.current) : newState;
    
    // Optimistic UI update
    setState(resolved);

    if (currentUser) {
      try {
        if (overwrite) {
          await overwriteUserState(currentUser.uid, resolved);
        } else {
          await saveUserState(currentUser.uid, resolved);
        }
      } catch (err) {
        console.error("Error saving state to Firestore:", err);
      }
    }
  };

  return {
    state,
    loading,
    currentUser,
    handleStateChange
  };
}
