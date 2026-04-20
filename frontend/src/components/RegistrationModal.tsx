import { useState } from 'react';
import { Modal } from './Modal';
import { RegistrationForm } from './RegistrationForm';
import { SubmissionModal } from './SubmissionModal';
import type { PatientFormData } from '../types/patient';
import { registerPatient } from '../api/patients';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type Status = 'idle' | 'submitting' | 'success' | 'error';

export function RegistrationModal({ open, onClose, onSuccess }: Props) {
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [formKey, setFormKey] = useState(0);

  async function handleSubmit(data: PatientFormData) {
    setStatus('submitting');
    try {
      await registerPatient(data);
      setStatus('success');
      onSuccess();
    } catch (err: unknown) {
      const apiErr = err as Error & { errors?: Record<string, string> };
      const msg =
        apiErr.errors?.email ??
        apiErr.errors?.general ??
        Object.values(apiErr.errors ?? {})[0] ??
        'An unexpected error occurred.';
      setErrorMessage(msg);
      setStatus('error');
    }
  }

  function handleModalClose() {
    if (status === 'submitting') return;
    onClose();
    setTimeout(() => {
      setStatus('idle');
      setErrorMessage(undefined);
      setFormKey((k) => k + 1);
    }, 300);
  }

  function handleResultClose() {
    if (status === 'success') {
      handleModalClose();
    } else {
      setStatus('idle');
      setErrorMessage(undefined);
    }
  }

  const showResult = status === 'success' || status === 'error';

  return (
    <>
      <Modal open={open && !showResult} onClose={handleModalClose}>
        <div style={{ padding: '28px 28px 32px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '24px',
            }}
          >
            <h3 style={{ fontSize: '20px', fontWeight: 700 }}>Register New Patient</h3>
            <button
              onClick={handleModalClose}
              aria-label="Close"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'var(--color-bg)',
                color: 'var(--color-text-muted)',
                fontSize: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ✕
            </button>
          </div>
          <RegistrationForm
            key={formKey}
            onSubmit={handleSubmit}
            submitting={status === 'submitting'}
          />
        </div>
      </Modal>

      <SubmissionModal
        state={showResult ? (status as 'success' | 'error') : null}
        errorMessage={errorMessage}
        onClose={handleResultClose}
      />
    </>
  );
}
