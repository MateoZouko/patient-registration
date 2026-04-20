export interface Patient {
  id: number;
  full_name: string;
  email: string;
  phone_code: string;
  phone_number: string;
  photo_path: string;
  created_at: string;
}

export interface PatientFormData {
  full_name: string;
  email: string;
  phone_code: string;
  phone_number: string;
  photo: File | null;
}

export interface FormErrors {
  full_name?: string;
  email?: string;
  phone_code?: string;
  phone_number?: string;
  photo?: string;
  general?: string;
}
