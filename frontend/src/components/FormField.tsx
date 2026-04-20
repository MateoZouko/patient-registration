import { ReactNode } from 'react';

interface Props {
  label: string;
  error?: string;
  children: ReactNode;
  htmlFor?: string;
}

export function FormField({ label, error, children, htmlFor }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label
        htmlFor={htmlFor}
        style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text)' }}
      >
        {label}
      </label>
      {children}
      <div
        style={{
          overflow: 'hidden',
          maxHeight: error ? '40px' : '0',
          transition: 'max-height 250ms ease, opacity 250ms ease',
          opacity: error ? 1 : 0,
        }}
      >
        {error && (
          <p
            style={{
              fontSize: '12px',
              color: 'var(--color-danger)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              animation: 'slideDown 250ms ease',
            }}
          >
            ⚠ {error}
          </p>
        )}
      </div>
    </div>
  );
}

