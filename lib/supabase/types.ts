// Tipos manuales que reflejan supabase/migrations/0001_init.sql.
// Si el esquema cambia, actualizar acá (no hay conexión de CLI para generarlos automáticamente).

export type Role = "owner" | "employee";
export type TimeEntryType = "in" | "out";
export type TimeEntrySource = "qr" | "manual";

export interface ScheduleDay {
  weekday: number; // 1 = lunes ... 7 = domingo
  start: string; // "09:00"
  end: string; // "17:00"
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          email: string;
          full_name: string;
          role: Role;
          created_at: string;
        };
        Insert: {
          id: string;
          username: string;
          email: string;
          full_name: string;
          role: Role;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      employees: {
        Row: {
          id: string;
          cedula: string;
          phone: string;
          mutualista: string;
          emergency_contact: string;
          weekly_hours_target: number;
          default_schedule: ScheduleDay[];
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          cedula: string;
          phone: string;
          mutualista: string;
          emergency_contact: string;
          weekly_hours_target?: number;
          default_schedule?: ScheduleDay[];
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["employees"]["Insert"]>;
        Relationships: [];
      };
      weekly_schedules: {
        Row: {
          id: string;
          employee_id: string;
          week_start: string;
          days: ScheduleDay[];
          total_hours: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          employee_id: string;
          week_start: string;
          days?: ScheduleDay[];
          total_hours?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["weekly_schedules"]["Insert"]
        >;
        Relationships: [];
      };
      qr_tokens: {
        Row: {
          id: string;
          token: string;
          active: boolean;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          token?: string;
          active?: boolean;
          created_by?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["qr_tokens"]["Insert"]>;
        Relationships: [];
      };
      time_entries: {
        Row: {
          id: string;
          employee_id: string;
          type: TimeEntryType;
          occurred_at: string;
          source: TimeEntrySource;
          qr_token_id: string | null;
          is_manual: boolean;
          created_by: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          employee_id: string;
          type: TimeEntryType;
          occurred_at: string;
          source?: TimeEntrySource;
          qr_token_id?: string | null;
          is_manual?: boolean;
          created_by?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["time_entries"]["Insert"]
        >;
        Relationships: [];
      };
      hour_adjustments: {
        Row: {
          id: string;
          employee_id: string;
          week_start: string;
          hours_delta: number;
          concept: string;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          employee_id: string;
          week_start: string;
          hours_delta: number;
          concept: string;
          created_by?: string | null;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["hour_adjustments"]["Insert"]
        >;
        Relationships: [];
      };
      audit_log: {
        Row: {
          id: string;
          actor_id: string | null;
          action: string;
          entity: string;
          entity_id: string | null;
          old_value: unknown;
          new_value: unknown;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_id?: string | null;
          action: string;
          entity: string;
          entity_id?: string | null;
          old_value?: unknown;
          new_value?: unknown;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["audit_log"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      regenerate_qr_token: {
        Args: { p_actor_id: string | null };
        Returns: Database["public"]["Tables"]["qr_tokens"]["Row"];
      };
    };
  };
}
