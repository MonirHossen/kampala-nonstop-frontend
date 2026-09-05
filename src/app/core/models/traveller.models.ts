export interface UserProfile {
  id: string;
  title: string | null;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  gender: string | null;
  date_of_birth: string | null;
  phone_number: string | null;
  city_of_residence: string | null;
  country_of_residence: string | null;
  profile_photo_url: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface UserPreferences {
  preferred_language: string;
  preferred_currency: string | null;
  distance_unit: 'km' | 'mi';
  temperature_unit: 'c' | 'f';
  updated_at?: string;
}

export interface UserNotificationPreferences {
  email_enabled: boolean;
  sms_enabled: boolean;
  push_enabled: boolean;
  updated_at?: string;
}

export interface UserConsent {
  consent_type: 'marketing' | 'terms_of_service' | 'privacy_policy';
  is_granted: boolean;
  granted_at: string | null;
  withdrawn_at: string | null;
  policy_version: string | null;
  updated_at?: string;
}

export interface UserCitizenship {
  id: string;
  country_code: string;
  is_primary: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface UserFavourite {
  id: string;
  favouritable_type: string;
  favouritable_id: string;
  notes: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface TravellerUser {
  id: string;
  email: string;
  status: string;
  email_verified_at: string | null;
  created_at?: string;
  updated_at?: string;
  profile?: UserProfile | null;
  preferences?: UserPreferences | null;
  notification_preferences?: UserNotificationPreferences | null;
  consents?: UserConsent[];
}

export interface AuthTokenResponse {
  token: string;
  token_type: string;
  user: TravellerUser;
}

export interface ApiMessageResponse {
  message: string;
}

export interface RegisterPayload {
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  email: string;
  password: string;
  password_confirmation: string;
  accept_terms: boolean;
  marketing_consent?: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
  device_name?: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  token: string;
  password: string;
  password_confirmation: string;
}

export interface ChangePasswordPayload {
  current_password: string;
  password: string;
  password_confirmation: string;
}
