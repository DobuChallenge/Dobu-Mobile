import { createContext, useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { session } from '../auth/session';
import { CHAVES } from '../storage/chaves';

export const AuthContext = createContext(null);

export default function AuthProvider({ children }) {
  const user = useSyncExternalStore(session.subscribe, session.getUser);
  const [restoring, setRestoring] = useState(true);
  const [restoreError, setRestoreError] = useState(null);
  const restore = useCallback(async () => {
    setRestoring(true);
    setRestoreError(null);
    try {
      await AsyncStorage.multiRemove(Object.values(CHAVES));
      await session.restore();
    } catch {
      setRestoreError('Não foi possível restaurar a sessão. Tente novamente.');
    } finally {
      setRestoring(false);
    }
  }, []);

  useEffect(() => { restore(); }, [restore]);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: Boolean(user), restoring, restoreError, restore, logout: session.logout }}>
      {children}
    </AuthContext.Provider>
  );
}
