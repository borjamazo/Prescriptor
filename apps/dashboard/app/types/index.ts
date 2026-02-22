// ─── Enums ────────────────────────────────────────────────────────────────────

export type UserRole = "superadmin" | "user";

export type UserStatus =
  | "pending_email"
  | "pending_activation"
  | "active"
  | "suspended"
  | "banned";

export type AuthProvider = "email" | "google" | "facebook" | "linkedin";

export type LegalDocumentType = "terms_of_service" | "privacy_policy";

// ─── Database Entities ────────────────────────────────────────────────────────

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  date_of_birth: string | null;
  country: string | null;
  city: string | null;
  role: UserRole;
  status: UserStatus;
  auth_provider: AuthProvider;
  created_at: string;
  updated_at: string;
  last_sign_in_at: string | null;
  email_verified_at: string | null;
  activated_at: string | null;
  activated_by: string | null;
  accepted_terms_at: string | null;
  accepted_terms_version: string | null;
  accepted_privacy_at: string | null;
  accepted_privacy_version: string | null;
}

export interface AppUsage {
  id: string;
  user_id: string;
  year: number;
  month: number;
  monthly_uses: number;
  monthly_limit: number;
  total_uses: number;
  last_use_at: string | null;
  created_at: string;
}

export interface UsageEvent {
  id: string;
  user_id: string;
  event_type: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface LegalDocument {
  id: string;
  type: LegalDocumentType;
  version: string;
  title: string;
  content: string;
  is_active: boolean;
  published_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserLegalAcceptance {
  id: string;
  user_id: string;
  document_id: string;
  document_type: LegalDocumentType;
  document_version: string;
  accepted_at: string;
  ip_address: string | null;
  user_agent: string | null;
}

// ─── Dashboard / View Types ───────────────────────────────────────────────────

export interface DashboardStats {
  total_users: number;
  active_users_this_month: number;
  pending_activation: number;
  new_users_this_week: number;
}

export interface UserWithUsage extends Profile {
  current_usage: AppUsage | null;
}

export interface UserDetail extends Profile {
  current_usage: AppUsage | null;
  usage_history: AppUsage[];
  legal_acceptances: (UserLegalAcceptance & { document: LegalDocument })[];
  recent_events: UsageEvent[];
}

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ─── Filters ──────────────────────────────────────────────────────────────────

export interface UserFilters {
  search?: string;
  status?: UserStatus | "";
  auth_provider?: AuthProvider | "";
  date_from?: string;
  date_to?: string;
  sort_by?: keyof Profile;
  sort_order?: "asc" | "desc";
  page?: number;
  page_size?: number;
}

// ─── Form Schemas ─────────────────────────────────────────────────────────────

export interface LoginFormData {
  email: string;
  password: string;
}

export interface UserActionData {
  action: "activate" | "suspend" | "ban" | "reset_usage";
  user_id: string;
}

export interface LegalDocumentFormData {
  type: LegalDocumentType;
  version: string;
  title: string;
  content: string;
  publish: boolean;
}

export interface SettingsFormData {
  default_monthly_limit: number;
}

export interface ChangePasswordFormData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

// ─── Action Results ───────────────────────────────────────────────────────────

export type ActionResult<T = null> =
  | { success: true; data?: T; message?: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };
