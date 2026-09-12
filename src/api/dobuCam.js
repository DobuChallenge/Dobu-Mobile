import { request, requestDeviceJson } from './httpClient.js';

export const dobuCamApi = {
  listarPorPet: (id) => request(`/api/dobucams/pet/${encodeURIComponent(id)}`),
  lerStatus: (urlStatus) => requestDeviceJson(urlStatus),
};
