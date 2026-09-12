import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFIX = '@dobu/profile-extras/';

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function keys(identity) {
  const value = typeof identity === 'string' ? { email: identity } : identity || {};
  const result = [];
  if (value.id) result.push(`${PREFIX}id/${value.id}`);
  if (value.email) result.push(`${PREFIX}email/${normalizeEmail(value.email)}`);
  return [...new Set(result)];
}

export async function saveProfileExtras(identity, extras = {}) {
  const storageKeys = keys(identity);
  if (!storageKeys.length) return;
  const current = await getProfileExtras(identity);
  const next = {
    ...current,
    ...extras,
    id: typeof identity === 'object' ? identity?.id || current.id : current.id,
    email: normalizeEmail(typeof identity === 'object' ? identity?.email || extras.email : identity),
    updatedAt: new Date().toISOString(),
  };
  await Promise.all(storageKeys.map((storageKey) => AsyncStorage.setItem(storageKey, JSON.stringify(next))));
}

export async function getProfileExtras(identity) {
  const storageKeys = keys(identity);
  if (!storageKeys.length) return {};
  try {
    const records = await AsyncStorage.multiGet(storageKeys);
    return records.reduce((merged, [, raw]) => {
      if (!raw) return merged;
      try {
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === 'object' ? { ...merged, ...parsed } : merged;
      } catch {
        return merged;
      }
    }, {});
  } catch {
    return {};
  }
}

export async function removeProfileExtras(identity) {
  const storageKeys = keys(identity);
  if (!storageKeys.length) return;
  await AsyncStorage.multiRemove(storageKeys);
}
