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
      job_postings: {
        Row: {
          application_url: string | null
          benefits: string[]
          company: string
          created_at: string
          department: string | null
          description: string
          equity: string | null
          featured: boolean | null
          hiring_urgency: string | null
          id: string
          investment_stage: string | null
          location: string
          logo: string
          posted: string
          remote_onsite: string | null
          requirements: string[]
          responsibilities: string[]
          revenue_model: string | null
          salary: string
          salary_range: string | null
          seniority_level: string | null
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
          featured?: boolean | null
          hiring_urgency?: string | null
          id?: string
          investment_stage?: string | null
          location: string
          logo: string
          posted?: string
          remote_onsite?: string | null
          requirements: string[]
          responsibilities: string[]
          revenue_model?: string | null
          salary: string
          salary_range?: string | null
          seniority_level?: string | null
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
          featured?: boolean | null
          hiring_urgency?: string | null
          id?: string
          investment_stage?: string | null
          location?: string
          logo?: string
          posted?: string
          remote_onsite?: string | null
          requirements?: string[]
          responsibilities?: string[]
          revenue_model?: string | null
          salary?: string
          salary_range?: string | null
          seniority_level?: string | null
          team_size?: string | null
          title?: string
          type?: string
          updated_at?: string
          user_id?: string | null
          visa_sponsorship?: boolean | null
          work_hours?: string | null
        }
        Relationships: []
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
