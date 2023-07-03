export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      places: {
        Row: {
          created_at: string
          description: string | null
          enabled: boolean
          IATA: string | null
          id: string
          manual_keys: string[]
          name: string
          short_name: string
          type: string
          world_name: string
          x: number | null
          z: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          enabled: boolean
          IATA?: string | null
          id: string
          manual_keys: string[]
          name: string
          short_name: string
          type: string
          world_name: string
          x?: number | null
          z?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          enabled?: boolean
          IATA?: string | null
          id?: string
          manual_keys?: string[]
          name?: string
          short_name?: string
          type?: string
          world_name?: string
          x?: number | null
          z?: number | null
        }
        Relationships: []
      }
      providers: {
        Row: {
          color_dark: string | null
          color_light: string | null
          created_at: string | null
          id: string
          logo: string | null
          manual_keys: string[]
          name: string
          number_prefix: string | null
          owners: string[] | null
        }
        Insert: {
          color_dark?: string | null
          color_light?: string | null
          created_at?: string | null
          id: string
          logo?: string | null
          manual_keys: string[]
          name: string
          number_prefix?: string | null
          owners?: string[] | null
        }
        Update: {
          color_dark?: string | null
          color_light?: string | null
          created_at?: string | null
          id?: string
          logo?: string | null
          manual_keys?: string[]
          name?: string
          number_prefix?: string | null
          owners?: string[] | null
        }
        Relationships: []
      }
      routes: {
        Row: {
          created_at: string
          id: string
          manual_keys: string[]
          name: string | null
          num_gates: number | null
          number: string | null
          provider: string
          type: string
        }
        Insert: {
          created_at?: string
          id: string
          manual_keys: string[]
          name?: string | null
          num_gates?: number | null
          number?: string | null
          provider: string
          type: string
        }
        Update: {
          created_at?: string
          id?: string
          manual_keys?: string[]
          name?: string | null
          num_gates?: number | null
          number?: string | null
          provider?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "routes_provider_fkey"
            columns: ["provider"]
            referencedRelation: "providers"
            referencedColumns: ["id"]
          }
        ]
      }
      routes_places: {
        Row: {
          created_at: string
          gate: string | null
          id: number
          manual_keys: string[]
          place: string | null
          route: string
        }
        Insert: {
          created_at?: string
          gate?: string | null
          id?: number
          manual_keys: string[]
          place?: string | null
          route: string
        }
        Update: {
          created_at?: string
          gate?: string | null
          id?: number
          manual_keys?: string[]
          place?: string | null
          route?: string
        }
        Relationships: [
          {
            foreignKeyName: "routes_places_place_fkey"
            columns: ["place"]
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "routes_places_route_fkey"
            columns: ["route"]
            referencedRelation: "routes"
            referencedColumns: ["id"]
          }
        ]
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
