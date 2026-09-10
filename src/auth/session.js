import { authApi } from '../api/auth.js';
import { setAuthToken } from '../api/httpClient.js';
import { queryClient } from '../api/queryClient.js';
import { sessionStorage } from '../storage/sessionStorage.js';
import { createSessionController } from './sessionController.js';

export const session = createSessionController({ storage: sessionStorage, api: authApi, queryClient, setToken: setAuthToken });
