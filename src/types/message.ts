
export interface Message {
  id: string;
  content: string;
  sender_id: string;
  recipient_id: string;
  created_at: string;
  read_at: string | null;
}

export interface TypingStatus {
  id: string;
  user_id: string;
  chat_with_user_id: string;
  is_typing: boolean;
  updated_at: string;
}
