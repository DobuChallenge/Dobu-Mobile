import { useContext } from 'react';
import { useMutation } from '@tanstack/react-query';
import { AuthContext } from '../providers/AuthProvider';
import { session } from '../auth/session';

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('AuthProvider ausente.');
  return context;
}

export function useLogin() {
  return useMutation({ mutationFn: session.login, retry: false, gcTime: 0 });
}

export function useRegister() {
  return useMutation({ mutationFn: session.register, retry: false, gcTime: 0 });
}
