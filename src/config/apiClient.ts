// Custom API client configuration wrapper
// Bu dosya /config klasöründe olduğu için generate:api çalıştırınca silinmez!

import { client } from '../api/client.gen';

// Vite environment variables için VITE_ prefix zorunludur
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// Client'ın config'ini environment variable ile güncelle
client.setConfig({
  baseURL: API_BASE_URL,
});

// Re-export client ve tüm API fonksiyonları
export { client };
export * from '../api';

