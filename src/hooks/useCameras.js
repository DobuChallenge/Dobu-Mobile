import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useAuth } from './useAuth';
import { usePets } from './usePets';
import { dobuCamApi } from '../api/dobuCam';
import { accountKey } from '../services/queries';

export function useCameras() {
  const { user } = useAuth();
  const pets = usePets();
  const [selected, setSelected] = useState('');
  const petId = pets.data?.find((pet) => pet.id === selected)?.id || pets.data?.[0]?.id;
  const cameras = useQuery({ queryKey: [...accountKey(user), 'cameras', petId], queryFn: () => dobuCamApi.listarPorPet(petId), enabled: Boolean(user && petId), retry: false });
  return { pets, cameras, petId, setSelected };
}
