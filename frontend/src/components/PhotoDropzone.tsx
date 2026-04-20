import { useState, useRef, DragEvent, ChangeEvent } from 'react';

interface Props {
  value: File | null;
  onChange: (file: File | null) => void;
  error?: string;
}

export function PhotoDropzone({ value, onChange, error }: Props) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onChange(file);
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    onChange(file);
  }

  const isJpg = value && (value.name.toLowerCase().endsWith('.jpg') || value.name.toLowerCase().endsWith('.jpeg'));

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Upload document photo"
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
      style={{
        border: `2px dashed ${error ? 'var(--color-danger)' : dragging ? 'var(--color-primary)' : 'var(--color-border)'}`,
        borderRadius: 'var(--radius-md)',
        background: dragging
          ? 'var(--color-primary-light)'
          : error
          ? 'var(--color-danger-light)'
          : 'var(--color-bg)',
        padding: '24px 16px',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'border-color var(--transition), background var(--transition)',
        outline: 'none',
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg"
        style={{ display: 'none' }}
        onChange={handleChange}
      />

      {value && isJpg ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <img
            src={URL.createObjectURL(value)}
            alt="Preview"
            style={{
              width: '80px',
              height: '80px',
              objectFit: 'cover',
              borderRadius: 'var(--radius-sm)',
              border: '2px solid var(--color-border)',
            }}
          />
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>{value.name}</p>
          <p style={{ fontSize: '12px', color: 'var(--color-primary)' }}>Click or drop to replace</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '32px' }}>📄</span>
          <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text)' }}>
            {dragging ? 'Drop the photo here' : 'Drag & drop or click to upload'}
          </p>
          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>JPG/JPEG files only</p>
        </div>
      )}
    </div>
  );
}
