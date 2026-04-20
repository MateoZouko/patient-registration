import { useState } from 'react';
import type { Patient } from '../types/patient';
import { getPhotoUrl } from '../api/patients';

interface Props {
  patient: Patient;
}

export function PatientCard({ patient }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <article
      className="patient-card"
      style={{
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid var(--color-border)',
        overflow: 'hidden',
        transition: 'box-shadow var(--transition)',
      }}
    >
      <button
        className="patient-card__header"
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={expanded}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '16px',
          background: 'none',
          textAlign: 'left',
        }}
      >
        <img
          src={getPhotoUrl(patient.photo_path)}
          alt={`Document photo for ${patient.full_name}`}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            objectFit: 'cover',
            flexShrink: 0,
            border: '2px solid var(--color-border)',
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(patient.full_name)}&background=2563eb&color=fff`;
          }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontWeight: 600,
              fontSize: '15px',
              color: 'var(--color-text)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {patient.full_name}
          </p>
          <p
            style={{
              fontSize: '13px',
              color: 'var(--color-text-muted)',
              marginTop: '2px',
            }}
          >
            {expanded ? 'Click to collapse' : 'Click to expand'}
          </p>
        </div>
        <span
          style={{
            color: 'var(--color-text-muted)',
            fontSize: '18px',
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform var(--transition)',
            flexShrink: 0,
          }}
        >
          ▾
        </span>
      </button>

      <div
        style={{
          maxHeight: expanded ? '400px' : '0',
          overflow: 'hidden',
          transition: 'max-height 300ms ease',
        }}
      >
        <div
          style={{
            padding: '0 16px 16px',
            borderTop: '1px solid var(--color-border)',
            paddingTop: '16px',
          }}
        >
          <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '8px 16px' }}>
            <DetailRow label="Email" value={patient.email} />
            <DetailRow label="Phone" value={`${patient.phone_code} ${patient.phone_number}`} />
            <DetailRow
              label="Registered"
              value={new Date(patient.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            />
          </dl>
        </div>
      </div>
    </article>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 500 }}>{label}</dt>
      <dd style={{ fontSize: '14px', color: 'var(--color-text)', wordBreak: 'break-word' }}>{value}</dd>
    </>
  );
}
