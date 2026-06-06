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
      activity_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      announcements: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          priority: string
          published_at: string | null
          target_classes: string[] | null
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          priority?: string
          published_at?: string | null
          target_classes?: string[] | null
          title: string
          type?: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          priority?: string
          published_at?: string | null
          target_classes?: string[] | null
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
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
      documents: {
        Row: {
          created_at: string
          document_type: string | null
          entity_id: string | null
          entity_type: string
          file_url: string
          id: string
          name: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          document_type?: string | null
          entity_id?: string | null
          entity_type: string
          file_url: string
          id?: string
          name: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          document_type?: string | null
          entity_id?: string | null
          entity_type?: string
          file_url?: string
          id?: string
          name?: string
          uploaded_by?: string | null
        }
        Relationships: []
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
      fee_installments: {
        Row: {
          amount: number
          created_at: string
          due_date: string
          fee_structure_id: string
          id: string
          paid_date: string | null
          receipt_number: string | null
          status: string
          student_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          due_date: string
          fee_structure_id: string
          id?: string
          paid_date?: string | null
          receipt_number?: string | null
          status?: string
          student_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          due_date?: string
          fee_structure_id?: string
          id?: string
          paid_date?: string | null
          receipt_number?: string | null
          status?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fee_installments_fee_structure_id_fkey"
            columns: ["fee_structure_id"]
            isOneToOne: false
            referencedRelation: "fee_structures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_installments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      fee_structures: {
        Row: {
          academic_year: string | null
          admission_fee: number
          amount: number
          class_id: string | null
          created_at: string
          due_date: string | null
          fee_type: string
          id: string
          late_fine_per_day: number | null
          name: string
          updated_at: string
        }
        Insert: {
          academic_year?: string | null
          admission_fee?: number
          amount?: number
          class_id?: string | null
          created_at?: string
          due_date?: string | null
          fee_type?: string
          id?: string
          late_fine_per_day?: number | null
          name: string
          updated_at?: string
        }
        Update: {
          academic_year?: string | null
          admission_fee?: number
          amount?: number
          class_id?: string | null
          created_at?: string
          due_date?: string | null
          fee_type?: string
          id?: string
          late_fine_per_day?: number | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fee_structures_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      homework: {
        Row: {
          class_id: string
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          file_url: string | null
          id: string
          status: string
          subject: string
          title: string
          updated_at: string
        }
        Insert: {
          class_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          file_url?: string | null
          id?: string
          status?: string
          subject: string
          title: string
          updated_at?: string
        }
        Update: {
          class_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          file_url?: string | null
          id?: string
          status?: string
          subject?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "homework_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      homework_submissions: {
        Row: {
          created_at: string
          file_url: string | null
          grade: string | null
          homework_id: string
          id: string
          remarks: string | null
          status: string
          student_id: string
          submitted_at: string | null
        }
        Insert: {
          created_at?: string
          file_url?: string | null
          grade?: string | null
          homework_id: string
          id?: string
          remarks?: string | null
          status?: string
          student_id: string
          submitted_at?: string | null
        }
        Update: {
          created_at?: string
          file_url?: string | null
          grade?: string | null
          homework_id?: string
          id?: string
          remarks?: string | null
          status?: string
          student_id?: string
          submitted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "homework_submissions_homework_id_fkey"
            columns: ["homework_id"]
            isOneToOne: false
            referencedRelation: "homework"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "homework_submissions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      inventory_items: {
        Row: {
          category_id: string | null
          condition: string | null
          created_at: string
          id: string
          location: string | null
          name: string
          notes: string | null
          purchase_date: string | null
          purchase_value: number | null
          quantity: number
          supplier: string | null
          unit: string | null
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          condition?: string | null
          created_at?: string
          id?: string
          location?: string | null
          name: string
          notes?: string | null
          purchase_date?: string | null
          purchase_value?: number | null
          quantity?: number
          supplier?: string | null
          unit?: string | null
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          condition?: string | null
          created_at?: string
          id?: string
          location?: string | null
          name?: string
          notes?: string | null
          purchase_date?: string | null
          purchase_value?: number | null
          quantity?: number
          supplier?: string | null
          unit?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "inventory_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      library_books: {
        Row: {
          author: string | null
          available_copies: number
          category: string | null
          created_at: string
          id: string
          isbn: string | null
          location: string | null
          publisher: string | null
          title: string
          total_copies: number
          updated_at: string
        }
        Insert: {
          author?: string | null
          available_copies?: number
          category?: string | null
          created_at?: string
          id?: string
          isbn?: string | null
          location?: string | null
          publisher?: string | null
          title: string
          total_copies?: number
          updated_at?: string
        }
        Update: {
          author?: string | null
          available_copies?: number
          category?: string | null
          created_at?: string
          id?: string
          isbn?: string | null
          location?: string | null
          publisher?: string | null
          title?: string
          total_copies?: number
          updated_at?: string
        }
        Relationships: []
      }
      library_issues: {
        Row: {
          book_id: string
          created_at: string
          due_date: string
          fine: number | null
          id: string
          issue_date: string
          return_date: string | null
          status: string
          student_id: string
        }
        Insert: {
          book_id: string
          created_at?: string
          due_date: string
          fine?: number | null
          id?: string
          issue_date?: string
          return_date?: string | null
          status?: string
          student_id: string
        }
        Update: {
          book_id?: string
          created_at?: string
          due_date?: string
          fine?: number | null
          id?: string
          issue_date?: string
          return_date?: string | null
          status?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "library_issues_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "library_books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "library_issues_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
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
      periods: {
        Row: {
          created_at: string
          end_time: string
          id: string
          is_break: boolean
          name: string
          order_index: number
          start_time: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_time: string
          id?: string
          is_break?: boolean
          name: string
          order_index?: number
          start_time: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_time?: string
          id?: string
          is_break?: boolean
          name?: string
          order_index?: number
          start_time?: string
          updated_at?: string
        }
        Relationships: []
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
      subjects: {
        Row: {
          code: string | null
          color: string | null
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          code?: string | null
          color?: string | null
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          code?: string | null
          color?: string | null
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
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
          teacher_id: string | null
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
          teacher_id?: string | null
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
          teacher_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      timetable_entries: {
        Row: {
          class_id: string
          created_at: string
          day_of_week: number
          id: string
          period_id: string
          subject_id: string | null
          teacher_id: string | null
          updated_at: string
        }
        Insert: {
          class_id: string
          created_at?: string
          day_of_week: number
          id?: string
          period_id: string
          subject_id?: string | null
          teacher_id?: string | null
          updated_at?: string
        }
        Update: {
          class_id?: string
          created_at?: string
          day_of_week?: number
          id?: string
          period_id?: string
          subject_id?: string | null
          teacher_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "timetable_entries_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timetable_entries_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "periods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timetable_entries_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timetable_entries_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      timetable_templates: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          template_data: Json
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          template_data?: Json
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          template_data?: Json
        }
        Relationships: []
      }
      transport_assignments: {
        Row: {
          created_at: string
          id: string
          pickup_point: string | null
          route_id: string
          student_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          pickup_point?: string | null
          route_id: string
          student_id: string
        }
        Update: {
          created_at?: string
          id?: string
          pickup_point?: string | null
          route_id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transport_assignments_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "transport_routes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transport_assignments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      transport_routes: {
        Row: {
          capacity: number | null
          created_at: string
          driver_name: string | null
          driver_phone: string | null
          id: string
          route_name: string
          route_number: string | null
          schedule: string | null
          stops: Json | null
          updated_at: string
          vehicle_number: string | null
        }
        Insert: {
          capacity?: number | null
          created_at?: string
          driver_name?: string | null
          driver_phone?: string | null
          id?: string
          route_name: string
          route_number?: string | null
          schedule?: string | null
          stops?: Json | null
          updated_at?: string
          vehicle_number?: string | null
        }
        Update: {
          capacity?: number | null
          created_at?: string
          driver_name?: string | null
          driver_phone?: string | null
          id?: string
          route_name?: string
          route_number?: string | null
          schedule?: string | null
          stops?: Json | null
          updated_at?: string
          vehicle_number?: string | null
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
