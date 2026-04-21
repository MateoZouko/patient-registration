import { useState } from 'react';
import type { FormEvent } from 'react';
import type { PatientFormData, FormErrors } from '../types/patient';
import { FormField } from './FormField';
import { inputStyle } from './inputStyle';
import { PhotoDropzone } from './PhotoDropzone';

interface Props {
  onSubmit: (data: PatientFormData) => Promise<void>;
  submitting: boolean;
}

const NAME_RE = /^[A-Za-zÀ-ÿ\s\-']+$/;
const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
const PHONE_CODE_RE = /^\+\d{1,4}$/;
const PHONE_NUM_RE = /^\d{4,15}$/;

function clientValidate(data: PatientFormData): FormErrors {
  const errors: FormErrors = {};

  if (!data.full_name.trim()) {
    errors.full_name = 'Full name is required.';
  } else if (!NAME_RE.test(data.full_name.trim())) {
    errors.full_name = 'Full name must contain letters only.';
  }

  if (!data.email.trim()) {
    errors.email = 'Email address is required.';
  } else if (!EMAIL_RE.test(data.email.trim())) {
    errors.email = 'Email must be a valid @gmail.com address.';
  }

  if (!data.phone_code.trim()) {
    errors.phone_code = 'Country code is required.';
  } else if (!PHONE_CODE_RE.test(data.phone_code.trim())) {
    errors.phone_code = 'Must start with + followed by 1–4 digits (e.g. +598).';
  }

  if (!data.phone_number.trim()) {
    errors.phone_number = 'Phone number is required.';
  } else if (!PHONE_NUM_RE.test(data.phone_number.trim())) {
    errors.phone_number = 'Must contain 4–15 digits.';
  }

  if (!data.photo) {
    errors.photo = 'Document photo is required.';
  } else if (
    !data.photo.name.toLowerCase().endsWith('.jpg') &&
    !data.photo.name.toLowerCase().endsWith('.jpeg')
  ) {
    errors.photo = 'Document photo must be a JPG/JPEG file.';
  }

  return errors;
}

export function RegistrationForm({ onSubmit, submitting }: Props) {
  const [form, setForm] = useState<PatientFormData>({
    full_name: '',
    email: '',
    phone_code: '+',
    phone_number: '',
    photo: null,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState(false);

  function set<K extends keyof PatientFormData>(key: K, value: PatientFormData[K]) {
    const next = { ...form, [key]: value };
    setForm(next);
    if (touched) {
      setErrors(clientValidate(next));
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setTouched(true);
    const errs = clientValidate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    await onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <FormField label="Full Name" error={errors.full_name} htmlFor="full_name">
        <input
          id="full_name"
          type="text"
          value={form.full_name}
          onChange={(e) => set('full_name', e.target.value)}
          placeholder="Jane Doe"
          disabled={submitting}
          style={inputStyle(!!errors.full_name)}
          autoComplete="name"
        />
      </FormField>

      <FormField label="Email Address" error={errors.email} htmlFor="email">
        <input
          id="email"
          type="email"
          value={form.email}
          onChange={(e) => set('email', e.target.value)}
          placeholder="patient@gmail.com"
          disabled={submitting}
          style={inputStyle(!!errors.email)}
          autoComplete="email"
        />
      </FormField>

      <FormField label="Phone Number" error={errors.phone_code || errors.phone_number}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            value={form.phone_code}
            onChange={(e) => set('phone_code', e.target.value)}
            placeholder="+598"
            disabled={submitting}
            maxLength={5}
            aria-label="Country code"
            style={{ ...inputStyle(!!errors.phone_code), width: '90px', flexShrink: 0 }}
          />
          <input
            type="tel"
            value={form.phone_number}
            onChange={(e) => set('phone_number', e.target.value.replace(/\D/g, ''))}
            placeholder="99123456"
            disabled={submitting}
            aria-label="Phone number"
            style={inputStyle(!!errors.phone_number)}
          />
        </div>
      </FormField>

      <FormField label="Document Photo (JPG only)" error={errors.photo}>
        <PhotoDropzone
          value={form.photo}
          onChange={(f) => set('photo', f)}
          error={errors.photo}
        />
      </FormField>

      {errors.general && (
        <p style={{ fontSize: '13px', color: 'var(--color-danger)', animation: 'slideDown 250ms ease' }}>
          ⚠ {errors.general}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        style={{
          padding: '12px',
          background: submitting ? 'var(--color-border)' : 'var(--color-primary)',
          color: submitting ? 'var(--color-text-muted)' : '#fff',
          borderRadius: 'var(--radius-sm)',
          fontWeight: 700,
          fontSize: '15px',
          cursor: submitting ? 'not-allowed' : 'pointer',
          transition: 'background var(--transition)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}
      >
        {submitting ? (
          <>
            <ButtonSpinner />
            Registering…
          </>
        ) : (
          'Register Patient'
        )}
      </button>
    </form>
  );
}

function ButtonSpinner() {
  return (
    <span
      style={{
        display: 'inline-block',
        width: '16px',
        height: '16px',
        border: '2px solid rgba(0,0,0,0.2)',
        borderTopColor: 'var(--color-text-muted)',
        borderRadius: '50%',
        animation: 'spin 0.6s linear infinite',
      }}
    />
  );
}
