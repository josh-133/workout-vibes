import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { loadData, saveData } from '../storage';
import { AppData } from '../types';

interface AppDataContextValue {
  data: AppData;
  update: (fn: (prev: AppData) => AppData) => void;
  replace: (data: AppData) => void;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(loadData);

  useEffect(() => saveData(data), [data]);

  return (
    <AppDataContext.Provider value={{ data, update: setData, replace: setData }}>
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData(): AppDataContextValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used inside AppDataProvider');
  return ctx;
}
