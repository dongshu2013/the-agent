'use client';
import { useEffect } from 'react';

export default function GlobalExtensionBridge() {
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data && event.data.type === 'GET_API_KEY') {
        const apiKey = localStorage.getItem('apiKey');
        window.postMessage(
          {
            type: 'FROM_WEB_TO_EXTENSION',
            apiKey,
          },
          '*',
        );
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);
  return null;
}
