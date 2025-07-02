export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string
          id: string
        }
        Insert: {
          created_at?: string
          id: string
        }
        Update: {
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      career_page_sources: {
        Row: {
          added_by: string
          company_name: string | null
          created_at: string
          id: string
          is_active: boolean
          last_scraped_at: string | null
          updated_at: string
          url: string
        }
        Insert: {
          added_by: string
          company_name?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          last_scraped_at?: string | null
          updated_at?: string
          url: string
        }
        Update: {
          added_by?: string
          company_name?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          last_scraped_at?: string | null
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      job_postings: {
        Row: {
          application_url: string | null
          benefits: string[]
          company: string
          created_at: string
          department: string | null
          description: string
          equity: string | null
          expires_at: string
          featured: boolean | null
          hiring_urgency: string | null
          id: string
          investment_stage: string | null
          is_draft: boolean
          is_expired: boolean
          location: string
          logo: string
          posted: string
          remote_onsite: string | null
          requirements: string[]
          responsibilities: string[]
          revenue_model: string | null
          salary: string
          salary_range: string | null
          scraped_at: string | null
          scraping_job_id: string | null
          seniority_level: string | null
          source_url: string | null
          team_size: string | null
          title: string
          type: string
          updated_at: string
          user_id: string | null
          visa_sponsorship: boolean | null
          work_hours: string | null
        }
        Insert: {
          application_url?: string | null
          benefits: string[]
          company: string
          created_at?: string
          department?: string | null
          description: string
          equity?: string | null
          expires_at: string
          featured?: boolean | null
          hiring_urgency?: string | null
          id?: string
          investment_stage?: string | null
          is_draft?: boolean
          is_expired?: boolean
          location: string
          logo: string
          posted?: string
          remote_onsite?: string | null
          requirements: string[]
          responsibilities: string[]
          revenue_model?: string | null
          salary: string
          salary_range?: string | null
          scraped_at?: string | null
          scraping_job_id?: string | null
          seniority_level?: string | null
          source_url?: string | null
          team_size?: string | null
          title: string
          type: string
          updated_at?: string
          user_id?: string | null
          visa_sponsorship?: boolean | null
          work_hours?: string | null
        }
        Update: {
          application_url?: string | null
          benefits?: string[]
          company?: string
          created_at?: string
          department?: string | null
          description?: string
          equity?: string | null
          expires_at?: string
          featured?: boolean | null
          hiring_urgency?: string | null
          id?: string
          investment_stage?: string | null
          is_draft?: boolean
          is_expired?: boolean
          location?: string
          logo?: string
          posted?: string
          remote_onsite?: string | null
          requirements?: string[]
          responsibilities?: string[]
          revenue_model?: string | null
          salary?: string
          salary_range?: string | null
          scraped_at?: string | null
          scraping_job_id?: string | null
          seniority_level?: string | null
          source_url?: string | null
          team_size?: string | null
          title?: string
          type?: string
          updated_at?: string
          user_id?: string | null
          visa_sponsorship?: boolean | null
          work_hours?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_postings_scraping_job_id_fkey"
            columns: ["scraping_job_id"]
            isOneToOne: false
            referencedRelation: "scraping_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_recovery_log: {
        Row: {
          created_at: string
          id: string
          new_status: string | null
          old_status: string | null
          recovery_action: string
          recovery_reason: string | null
          scraping_job_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          new_status?: string | null
          old_status?: string | null
          recovery_action: string
          recovery_reason?: string | null
          scraping_job_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          new_status?: string | null
          old_status?: string | null
          recovery_action?: string
          recovery_reason?: string | null
          scraping_job_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_recovery_log_scraping_job_id_fkey"
            columns: ["scraping_job_id"]
            isOneToOne: false
            referencedRelation: "scraping_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company: string | null
          company_description: string | null
          company_name: string | null
          company_size: string | null
          company_website: string | null
          created_at: string
          experience_years: number | null
          full_name: string | null
          id: string
          industry: string | null
          job_title: string | null
          logo_url: string | null
          preferred_industries: string[] | null
          preferred_job_types: string[] | null
          preferred_locations: string[] | null
          resume_url: string | null
          skills: string[] | null
          updated_at: string
          user_type: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          company?: string | null
          company_description?: string | null
          company_name?: string | null
          company_size?: string | null
          company_website?: string | null
          created_at?: string
          experience_years?: number | null
          full_name?: string | null
          id: string
          industry?: string | null
          job_title?: string | null
          logo_url?: string | null
          preferred_industries?: string[] | null
          preferred_job_types?: string[] | null
          preferred_locations?: string[] | null
          resume_url?: string | null
          skills?: string[] | null
          updated_at?: string
          user_type?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          company?: string | null
          company_description?: string | null
          company_name?: string | null
          company_size?: string | null
          company_website?: string | null
          created_at?: string
          experience_years?: number | null
          full_name?: string | null
          id?: string
          industry?: string | null
          job_title?: string | null
          logo_url?: string | null
          preferred_industries?: string[] | null
          preferred_job_types?: string[] | null
          preferred_locations?: string[] | null
          resume_url?: string | null
          skills?: string[] | null
          updated_at?: string
          user_type?: string | null
          website?: string | null
        }
        Relationships: []
      }
      queue_monitoring: {
        Row: {
          created_at: string
          failed_jobs: number
          id: string
          processed_jobs: number
          processing_time_ms: number | null
          queue_size: number
          trigger_source: string
        }
        Insert: {
          created_at?: string
          failed_jobs?: number
          id?: string
          processed_jobs?: number
          processing_time_ms?: number | null
          queue_size?: number
          trigger_source?: string
        }
        Update: {
          created_at?: string
          failed_jobs?: number
          id?: string
          processed_jobs?: number
          processing_time_ms?: number | null
          queue_size?: number
          trigger_source?: string
        }
        Relationships: []
      }
      scraping_batches: {
        Row: {
          completed_at: string | null
          completed_urls: number
          created_at: string
          created_by: string
          failed_urls: number
          id: string
          status: string
          total_urls: number
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          completed_urls?: number
          created_at?: string
          created_by: string
          failed_urls?: number
          id?: string
          status?: string
          total_urls?: number
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          completed_urls?: number
          created_at?: string
          created_by?: string
          failed_urls?: number
          id?: string
          status?: string
          total_urls?: number
          updated_at?: string
        }
        Relationships: []
      }
      scraping_config: {
        Row: {
          description: string | null
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          description?: string | null
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          description?: string | null
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      scraping_jobs: {
        Row: {
          batch_id: string | null
          completed_at: string | null
          created_by: string
          error_message: string | null
          gobi_status_checked_at: string | null
          gobi_task_id: string | null
          id: string
          jobs_created: number | null
          jobs_found: number | null
          last_polled_at: string | null
          max_retries: number | null
          priority: number | null
          retry_count: number | null
          source_id: string
          started_at: string
          status: string
          task_data: Json | null
          task_timeout_minutes: number | null
          timeout_at: string | null
          webhook_url: string | null
        }
        Insert: {
          batch_id?: string | null
          completed_at?: string | null
          created_by: string
          error_message?: string | null
          gobi_status_checked_at?: string | null
          gobi_task_id?: string | null
          id?: string
          jobs_created?: number | null
          jobs_found?: number | null
          last_polled_at?: string | null
          max_retries?: number | null
          priority?: number | null
          retry_count?: number | null
          source_id: string
          started_at?: string
          status?: string
          task_data?: Json | null
          task_timeout_minutes?: number | null
          timeout_at?: string | null
          webhook_url?: string | null
        }
        Update: {
          batch_id?: string | null
          completed_at?: string | null
          created_by?: string
          error_message?: string | null
          gobi_status_checked_at?: string | null
          gobi_task_id?: string | null
          id?: string
          jobs_created?: number | null
          jobs_found?: number | null
          last_polled_at?: string | null
          max_retries?: number | null
          priority?: number | null
          retry_count?: number | null
          source_id?: string
          started_at?: string
          status?: string
          task_data?: Json | null
          task_timeout_minutes?: number | null
          timeout_at?: string | null
          webhook_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scraping_jobs_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "career_page_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      task_status_history: {
        Row: {
          checked_at: string | null
          gobi_response: Json | null
          id: string
          response_time_ms: number | null
          scraping_job_id: string | null
          status: string
        }
        Insert: {
          checked_at?: string | null
          gobi_response?: Json | null
          id?: string
          response_time_ms?: number | null
          scraping_job_id?: string | null
          status: string
        }
        Update: {
          checked_at?: string | null
          gobi_response?: Json | null
          id?: string
          response_time_ms?: number | null
          scraping_job_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_status_history_scraping_job_id_fkey"
            columns: ["scraping_job_id"]
            isOneToOne: false
            referencedRelation: "scraping_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_health: {
        Row: {
          created_at: string
          failure_count: number | null
          id: string
          is_active: boolean | null
          last_received_at: string | null
          updated_at: string
          webhook_type: string
        }
        Insert: {
          created_at?: string
          failure_count?: number | null
          id?: string
          is_active?: boolean | null
          last_received_at?: string | null
          updated_at?: string
          webhook_type: string
        }
        Update: {
          created_at?: string
          failure_count?: number | null
          id?: string
          is_active?: boolean | null
          last_received_at?: string | null
          updated_at?: string
          webhook_type?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      mark_expired_jobs: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
