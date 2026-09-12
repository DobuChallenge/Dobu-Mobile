import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import { getProfileExtras } from '../storage/profileExtrasStorage';

export function useProfileExtras(user) {
  const [extras, setExtras] = useState({});

  const load = useCallback(() => {
    let active = true;
    setExtras({});
    getProfileExtras(user).then((value) => {
      if (active) setExtras(value);
    });
    return () => {
      active = false;
    };
  }, [user?.id, user?.email]);

  useEffect(load, [load]);
  useFocusEffect(load);

  return extras;
}
