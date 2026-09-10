import { requestDeviceJson } from './httpClient.js';

export const dobuCamApi = {
  lerStatus: (urlStatus) => requestDeviceJson(urlStatus),
};
