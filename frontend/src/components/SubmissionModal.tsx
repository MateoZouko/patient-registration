import { Modal } from './Modal';

type ModalState = 'success' | 'error' | null;

interface Props {
  state: ModalState;
  errorMessage?: string;
  onClose: () => void;
}

export function SubmissionModal({ state, errorMessage, onClose }: Props) {
  return (
    <Modal open={state !== null} onClose={onClose}>
      <div style={{ padding: '40px 32px', textAlign: 'center' }}>
        {state === 'success' ? <SuccessContent onClose={onClose} /> : <ErrorContent message={errorMessage} onClose={onClose} />}
      </div>
    </Modal>
  );
}

function SuccessContent({ onClose }: { onClose: () => void }) {
  return (
    <>
      <div
        style={{
          width: '72px',
          height: '72px',
          background: 'var(--color-success-light)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          animation: 'popIn 400ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        <span style={{ fontSize: '36px' }}>✓</span>
      </div>
      <h3 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-success)', marginBottom: '12px' }}>
        Registration Successful!
      </h3>
      <p style={{ fontSize: '15px', color: 'var(--color-text-muted)', marginBottom: '28px' }}>
        The patient has been registered successfully. A confirmation email has been sent.
      </p>
      <button
        onClick={onClose}
        style={{
          padding: '11px 32px',
          background: 'var(--color-success)',
          color: '#fff',
          borderRadius: 'var(--radius-sm)',
          fontWeight: 700,
          fontSize: '15px',
        }}
      >
        Done
      </button>
    </>
  );
}

function ErrorContent({ message, onClose }: { message?: string; onClose: () => void }) {
  return (
    <>
      <div
        style={{
          width: '72px',
          height: '72px',
          background: 'var(--color-danger-light)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          animation: 'shake 400ms ease',
        }}
      >
        <span style={{ fontSize: '36px' }}>✕</span>
      </div>
      <h3 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-danger)', marginBottom: '12px' }}>
        Registration Failed
      </h3>
      <p style={{ fontSize: '15px', color: 'var(--color-text-muted)', marginBottom: '28px' }}>
        {message ?? 'An unexpected error occurred. Please try again.'}
      </p>
      <button
        onClick={onClose}
        style={{
          padding: '11px 32px',
          background: 'var(--color-danger)',
          color: '#fff',
          borderRadius: 'var(--radius-sm)',
          fontWeight: 700,
          fontSize: '15px',
        }}
      >
        Try Again
      </button>
    </>
  );
}
