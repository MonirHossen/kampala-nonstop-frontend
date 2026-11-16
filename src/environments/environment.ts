// Local Discover/API base URL. Must match kampala-nonstop-api/.env.docker APP_PORT
// (this stack uses 8210). Root `make check-config` validates this.
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8210/api/v1',
  supabaseUrl: 'https://gvrpkyvygcenlvexxxes.supabase.co',
  supabasePublishableKey: 'sb_publishable_DepcgRpcrcECLbFzrhVKFg__jIENRrR',
};
