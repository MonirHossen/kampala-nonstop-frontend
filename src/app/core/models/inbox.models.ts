export type SupportSenderRole = 'TRAVELLER' | 'ADMIN' | 'SYSTEM';
export type SupportThreadType = 'GENERAL' | 'BOOKING' | 'BOOKING_UPDATE';
export type SupportThreadStatus = 'OPEN' | 'CLOSED';

export interface SupportMessage {
  id: string;
  thread_id: string;
  sender_role: SupportSenderRole;
  sender_user_id: string | null;
  body: string;
  email_dispatched?: boolean;
  created_at?: string;
}

export interface SupportThreadTrip {
  id: string;
  name: string | null;
  status_code: string;
}

export interface SupportThread {
  id: string;
  trip_id: string | null;
  subject: string;
  thread_type: SupportThreadType;
  status_code: SupportThreadStatus;
  last_message_at: string | null;
  traveller_last_read_at: string | null;
  unread: boolean;
  latest_message?: Pick<SupportMessage, 'id' | 'sender_role' | 'body' | 'created_at'> | null;
  trip?: SupportThreadTrip | null;
  messages?: SupportMessage[];
  created_at?: string;
  updated_at?: string;
}

export interface SupportContact {
  admin_email: string | null;
  whatsapp_url: string | null;
  whatsapp_label: string | null;
}
