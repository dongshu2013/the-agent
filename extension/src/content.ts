import { ApiKey } from '~/types';
import { API_KEY_TAG } from './storages/cache';

import type { PlasmoCSConfig } from 'plasmo';
import { env } from './configs/env';

export const config: PlasmoCSConfig = {
  matches: ['https://*.mysta.ai/*', 'http://localhost/*'],
  all_frames: true,
};

window.addEventListener('message', event => {
  if (event.source !== window) return;
  if (event.data && event.data.type === 'FROM_WEB_TO_EXTENSION') {
    const hostname = new URL(env.WEB_URL).hostname;
    if (hostname === event.data.data.host) {
      chrome.storage.local.set({
        [API_KEY_TAG]: {
          key: event.data.data.apiKey,
          enabled: event.data.data.apiKeyEnabled,
        } as ApiKey,
      });
    }
  }
});
