// Local Discover/API base URL. Must match kampala-nonstop-api/.env.docker APP_PORT
// (default 8010 from .env.docker.example). Root `make check-config` validates this.
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8010/api/v1',
  supabaseUrl: 'https://gvrpkyvygcenlvexxxes.supabase.co',
  supabasePublishableKey: 'sb_publishable_DepcgRpcrcECLbFzrhVKFg__jIENRrR',
};
