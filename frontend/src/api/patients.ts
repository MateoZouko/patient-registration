import type { Patient, PatientFormData } from '../types/patient';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

export async function fetchPatients(): Promise<Patient[]> {
  const res = await fetch(`${BASE_URL}/api/patients`);
  if (!res.ok) throw new Error('Failed to fetch patients');
  return res.json();
}

export async function registerPatient(data: PatientFormData): Promise<Patient> {
  const form = new FormData();
  form.append('full_name', data.full_name);
  form.append('email', data.email);
  form.append('phone_code', data.phone_code);
  form.append('phone_number', data.phone_number);
  if (data.photo) form.append('photo', data.photo);

  const res = await fetch(`${BASE_URL}/api/patients`, {
    method: 'POST',
    body: form,
  });

  type ApiError = Error & { errors?: Record<string, string>; status?: number };

  if (!res.ok) {
    let errors: Record<string, string> = {};
    try {
      const json = await res.json();
      errors = json.errors ?? {};
    } catch {
      if (res.status === 413) {
        errors = { photo: 'File is too large. Maximum allowed size is 5 MB.' };
      } else {
        errors = { general: 'An unexpected error occurred. Please try again.' };
      }
    }
    const err = new Error('Registration failed') as ApiError;
    err.errors = errors;
    err.status = res.status;
    throw err;
  }

  return res.json();
}

export function getPhotoUrl(path: string): string {
  return `${BASE_URL}${path}`;
}
