export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api/v1',
  supabaseUrl: 'https://gvrpkyvygcenlvexxxes.supabase.co',
  supabasePublishableKey: 'sb_publishable_DepcgRpcrcECLbFzrhVKFg__jIENRrR',
  /** Google OAuth 2.0 Web client ID (GIS). Required for Google sign-in to work. */
  googleClientId: '132571340979-7p9rsgn69smtqtamggd2t52ef1k24h6r.apps.googleusercontent.com',
  /** Facebook App ID. Required for Facebook sign-in to work. */
  facebookAppId: '1073268935461345',
  /**
   * Optional but recommended for Meta Login for Business.
   * Dashboard → Facebook Login for Business → Configurations → copy ID.
   * If empty, login falls back to scopes: public_profile,email,pages_show_list.
   */
  facebookLoginConfigId: '',
};
