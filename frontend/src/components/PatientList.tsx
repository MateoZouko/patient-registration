import type { Patient } from '../types/patient';
import { PatientCard } from './PatientCard';

interface Props {
  patients: Patient[];
  loading: boolean;
  error: string | null;
  onAddClick: () => void;
}

export function PatientList({ patients, loading, error, onAddClick }: Props) {
  return (
    <section>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
        }}
      >
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text)' }}>
          Patients
          {!loading && (
            <span
              style={{
                marginLeft: '8px',
                fontSize: '14px',
                fontWeight: 400,
                color: 'var(--color-text-muted)',
              }}
            >
              ({patients.length})
            </span>
          )}
        </h2>

        <button
          onClick={onAddClick}
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            background: loading ? 'var(--color-border)' : 'var(--color-primary)',
            color: loading ? 'var(--color-text-muted)' : '#fff',
            borderRadius: 'var(--radius-sm)',
            fontWeight: 600,
            fontSize: '14px',
            transition: 'background var(--transition)',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? (
            <>
              <Spinner />
              Loading…
            </>
          ) : (
            <>
              <span style={{ fontSize: '18px', lineHeight: 1 }}>+</span>
              Add Patient
            </>
          )}
        </button>
      </div>

      {error && (
        <div
          style={{
            padding: '14px 16px',
            background: 'var(--color-danger-light)',
            border: '1px solid var(--color-danger)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--color-danger)',
            fontSize: '14px',
            marginBottom: '16px',
          }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : patients.length === 0 ? (
        <EmptyState onAddClick={onAddClick} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {patients.map((p) => (
            <PatientCard key={p.id} patient={p} />
          ))}
        </div>
      )}
    </section>
  );
}

function EmptyState({ onAddClick }: { onAddClick: () => void }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '64px 32px',
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-md)',
        border: '2px dashed var(--color-border)',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏥</div>
      <p style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>No patients yet</p>
      <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '24px' }}>
        Get started by registering your first patient.
      </p>
      <button
        onClick={onAddClick}
        style={{
          padding: '10px 24px',
          background: 'var(--color-primary)',
          color: '#fff',
          borderRadius: 'var(--radius-sm)',
          fontWeight: 600,
          fontSize: '14px',
        }}
      >
        + Add Patient
      </button>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div
      style={{
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-border)',
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'var(--color-border)',
          animation: 'pulse 1.5s ease-in-out infinite',
        }}
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div
          style={{
            height: '14px',
            width: '40%',
            background: 'var(--color-border)',
            borderRadius: '4px',
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />
        <div
          style={{
            height: '12px',
            width: '25%',
            background: 'var(--color-border)',
            borderRadius: '4px',
            animation: 'pulse 1.5s ease-in-out infinite 0.2s',
          }}
        />
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <span
      style={{
        display: 'inline-block',
        width: '14px',
        height: '14px',
        border: '2px solid var(--color-border)',
        borderTopColor: 'var(--color-text-muted)',
        borderRadius: '50%',
        animation: 'spin 0.6s linear infinite',
      }}
    />
  );
}
