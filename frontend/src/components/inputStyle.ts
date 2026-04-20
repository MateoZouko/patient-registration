import React from 'react';

export function inputStyle(hasError: boolean): React.CSSProperties {
  return {
    padding: '10px 12px',
    border: `1.5px solid ${hasError ? 'var(--color-danger)' : 'var(--color-border)'}`,
    borderRadius: 'var(--radius-sm)',
    fontSize: '14px',
    color: 'var(--color-text)',
    background: hasError ? 'var(--color-danger-light)' : 'var(--color-surface)',
    outline: 'none',
    transition: 'border-color var(--transition), background var(--transition)',
    width: '100%',
  };
}
