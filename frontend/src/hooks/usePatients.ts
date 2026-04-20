import { useEffect, useCallback, useRef, useReducer } from 'react';
import { Patient } from '../types/patient';
import { fetchPatients } from '../api/patients';

interface State {
  patients: Patient[];
  loading: boolean;
  error: string | null;
}

type Action =
  | { type: 'fetch_start' }
  | { type: 'fetch_success'; data: Patient[] }
  | { type: 'fetch_error' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'fetch_start':
      return { ...state, loading: true, error: null };
    case 'fetch_success':
      return { patients: action.data, loading: false, error: null };
    case 'fetch_error':
      return { ...state, loading: false, error: 'Failed to load patients. Please try again.' };
  }
}

const initialState: State = { patients: [], loading: true, error: null };

export function usePatients() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const tickRef = useRef(0);
  const [refreshTick, setRefreshTick] = useReducer((n: number) => n + 1, 0);

  const refresh = useCallback(() => {
    tickRef.current += 1;
    setRefreshTick();
  }, []);

  useEffect(() => {
    let cancelled = false;
    dispatch({ type: 'fetch_start' });

    fetchPatients()
      .then((data) => {
        if (!cancelled) dispatch({ type: 'fetch_success', data });
      })
      .catch(() => {
        if (!cancelled) dispatch({ type: 'fetch_error' });
      });

    return () => {
      cancelled = true;
    };
  }, [refreshTick]);

  return { ...state, refresh };
}
