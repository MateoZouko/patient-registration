import { useState } from 'react';
import { usePatients } from './hooks/usePatients';
import { PatientList } from './components/PatientList';
import { RegistrationModal } from './components/RegistrationModal';
import './styles/global.css';
import './App.css';

export default function App() {
  const { patients, loading, error, refresh } = usePatients();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="app-layout">
      <header className="app-header">
        <div className="app-header__inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '24px' }}>🏥</span>
            <h1 style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.5px' }}>
              Patient Registration
            </h1>
          </div>
        </div>
      </header>

      <main className="app-main">
        <PatientList
          patients={patients}
          loading={loading}
          error={error}
          onAddClick={() => setModalOpen(true)}
        />
      </main>

      <RegistrationModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={refresh}
      />
    </div>
  );
}
