export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      classes: {
        Row: {
          created_at: string
          id: string
          name: string
          room: string | null
          subjects: string | null
          teacher_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          room?: string | null
          subjects?: string | null
          teacher_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          room?: string | null
          subjects?: string | null
          teacher_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "classes_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_results: {
        Row: {
          created_at: string
          exam_id: string
          id: string
          marks_obtained: number | null
          student_id: string
        }
        Insert: {
          created_at?: string
          exam_id: string
          id?: string
          marks_obtained?: number | null
          student_id: string
        }
        Update: {
          created_at?: string
          exam_id?: string
          id?: string
          marks_obtained?: number | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_results_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_results_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      exams: {
        Row: {
          class_id: string | null
          created_at: string
          date: string | null
          id: string
          name: string
          subject: string | null
          total_marks: number | null
          updated_at: string
        }
        Insert: {
          class_id?: string | null
          created_at?: string
          date?: string | null
          id?: string
          name: string
          subject?: string | null
          total_marks?: number | null
          updated_at?: string
        }
        Update: {
          class_id?: string | null
          created_at?: string
          date?: string | null
          id?: string
          name?: string
          subject?: string | null
          total_marks?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exams_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          created_at: string
          id: string
          message: string
          message_type: string
          recipient_contact: string | null
          recipient_id: string | null
          recipient_name: string | null
          recipient_type: string
          sent_at: string
          status: string | null
          subject: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          message_type: string
          recipient_contact?: string | null
          recipient_id?: string | null
          recipient_name?: string | null
          recipient_type: string
          sent_at?: string
          status?: string | null
          subject?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          message_type?: string
          recipient_contact?: string | null
          recipient_id?: string | null
          recipient_name?: string | null
          recipient_type?: string
          sent_at?: string
          status?: string | null
          subject?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          payment_date: string
          student_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          payment_date?: string
          student_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          payment_date?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      salary_payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          month: string
          payment_date: string
          teacher_id: string
          year: number
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          month: string
          payment_date?: string
          teacher_id: string
          year: number
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          month?: string
          payment_date?: string
          teacher_id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "salary_payments_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      student_attendance: {
        Row: {
          created_at: string
          date: string
          id: string
          status: Database["public"]["Enums"]["attendance_status"]
          student_id: string
        }
        Insert: {
          created_at?: string
          date?: string
          id?: string
          status?: Database["public"]["Enums"]["attendance_status"]
          student_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          status?: Database["public"]["Enums"]["attendance_status"]
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          aadhar_number: string | null
          address: string | null
          admission_date: string | null
          admission_no: string | null
          blood_group: string | null
          category: string | null
          city: string | null
          class_id: string | null
          created_at: string
          date_of_birth: string | null
          district: string | null
          email: string | null
          emergency_contact: string | null
          emergency_phone: string | null
          father_occupation: string | null
          fee_status: Database["public"]["Enums"]["fee_status"] | null
          gender: string | null
          guardian_name: string | null
          guardian_phone: string | null
          guardian_relation: string | null
          id: string
          medical_conditions: string | null
          mother_name: string | null
          mother_occupation: string | null
          name: string
          nationality: string | null
          parent_name: string | null
          permanent_address: string | null
          phone: string | null
          photo_url: string | null
          pickup_point: string | null
          pin_code: string | null
          previous_school: string | null
          religion: string | null
          roll_no: string | null
          state: string | null
          transport_required: boolean | null
          updated_at: string
        }
        Insert: {
          aadhar_number?: string | null
          address?: string | null
          admission_date?: string | null
          admission_no?: string | null
          blood_group?: string | null
          category?: string | null
          city?: string | null
          class_id?: string | null
          created_at?: string
          date_of_birth?: string | null
          district?: string | null
          email?: string | null
          emergency_contact?: string | null
          emergency_phone?: string | null
          father_occupation?: string | null
          fee_status?: Database["public"]["Enums"]["fee_status"] | null
          gender?: string | null
          guardian_name?: string | null
          guardian_phone?: string | null
          guardian_relation?: string | null
          id?: string
          medical_conditions?: string | null
          mother_name?: string | null
          mother_occupation?: string | null
          name: string
          nationality?: string | null
          parent_name?: string | null
          permanent_address?: string | null
          phone?: string | null
          photo_url?: string | null
          pickup_point?: string | null
          pin_code?: string | null
          previous_school?: string | null
          religion?: string | null
          roll_no?: string | null
          state?: string | null
          transport_required?: boolean | null
          updated_at?: string
        }
        Update: {
          aadhar_number?: string | null
          address?: string | null
          admission_date?: string | null
          admission_no?: string | null
          blood_group?: string | null
          category?: string | null
          city?: string | null
          class_id?: string | null
          created_at?: string
          date_of_birth?: string | null
          district?: string | null
          email?: string | null
          emergency_contact?: string | null
          emergency_phone?: string | null
          father_occupation?: string | null
          fee_status?: Database["public"]["Enums"]["fee_status"] | null
          gender?: string | null
          guardian_name?: string | null
          guardian_phone?: string | null
          guardian_relation?: string | null
          id?: string
          medical_conditions?: string | null
          mother_name?: string | null
          mother_occupation?: string | null
          name?: string
          nationality?: string | null
          parent_name?: string | null
          permanent_address?: string | null
          phone?: string | null
          photo_url?: string | null
          pickup_point?: string | null
          pin_code?: string | null
          previous_school?: string | null
          religion?: string | null
          roll_no?: string | null
          state?: string | null
          transport_required?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "students_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_attendance: {
        Row: {
          created_at: string
          date: string
          id: string
          status: Database["public"]["Enums"]["attendance_status"]
          teacher_id: string
        }
        Insert: {
          created_at?: string
          date?: string
          id?: string
          status?: Database["public"]["Enums"]["attendance_status"]
          teacher_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          status?: Database["public"]["Enums"]["attendance_status"]
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teacher_attendance_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      teachers: {
        Row: {
          aadhar_number: string | null
          bank_account: string | null
          bank_name: string | null
          blood_group: string | null
          city: string | null
          classes: string | null
          created_at: string
          date_of_birth: string | null
          email: string | null
          emergency_contact: string | null
          emergency_phone: string | null
          experience_years: number | null
          gender: string | null
          id: string
          ifsc_code: string | null
          joining_date: string | null
          name: string
          nationality: string | null
          permanent_address: string | null
          phone: string | null
          photo_url: string | null
          pin_code: string | null
          qualification: string | null
          salary: number | null
          salary_status: Database["public"]["Enums"]["salary_status"] | null
          state: string | null
          subject: string | null
          updated_at: string
        }
        Insert: {
          aadhar_number?: string | null
          bank_account?: string | null
          bank_name?: string | null
          blood_group?: string | null
          city?: string | null
          classes?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          emergency_contact?: string | null
          emergency_phone?: string | null
          experience_years?: number | null
          gender?: string | null
          id?: string
          ifsc_code?: string | null
          joining_date?: string | null
          name: string
          nationality?: string | null
          permanent_address?: string | null
          phone?: string | null
          photo_url?: string | null
          pin_code?: string | null
          qualification?: string | null
          salary?: number | null
          salary_status?: Database["public"]["Enums"]["salary_status"] | null
          state?: string | null
          subject?: string | null
          updated_at?: string
        }
        Update: {
          aadhar_number?: string | null
          bank_account?: string | null
          bank_name?: string | null
          blood_group?: string | null
          city?: string | null
          classes?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          emergency_contact?: string | null
          emergency_phone?: string | null
          experience_years?: number | null
          gender?: string | null
          id?: string
          ifsc_code?: string | null
          joining_date?: string | null
          name?: string
          nationality?: string | null
          permanent_address?: string | null
          phone?: string | null
          photo_url?: string | null
          pin_code?: string | null
          qualification?: string | null
          salary?: number | null
          salary_status?: Database["public"]["Enums"]["salary_status"] | null
          state?: string | null
          subject?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff_member: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "teacher" | "staff"
      attendance_status: "present" | "absent" | "late"
      fee_status: "paid" | "pending" | "overdue"
      salary_status: "paid" | "pending"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "teacher", "staff"],
      attendance_status: ["present", "absent", "late"],
      fee_status: ["paid", "pending", "overdue"],
      salary_status: ["paid", "pending"],
    },
  },
} as const
