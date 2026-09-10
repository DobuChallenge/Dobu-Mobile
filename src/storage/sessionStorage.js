import * as SecureStore from 'expo-secure-store';

const KEY = 'dobu.session';
const options = { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY };

export const sessionStorage = {
  async read() {
    const value = await SecureStore.getItemAsync(KEY, options);
    if (!value) return null;
    try { return JSON.parse(value); }
    catch { await SecureStore.deleteItemAsync(KEY, options); return null; }
  },
  write: (session) => SecureStore.setItemAsync(KEY, JSON.stringify(session), options),
  remove: () => SecureStore.deleteItemAsync(KEY, options),
};
