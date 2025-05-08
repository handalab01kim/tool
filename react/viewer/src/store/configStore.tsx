import { create } from 'zustand';

interface TableRoute {
  path: string;
  table: string;
  primary: string;
}

interface ConfigState {
  dbConfig: {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
  };
  tablesToWatch: string[];
  tableRoutes: TableRoute[];

  setDbConfig: (config: ConfigState['dbConfig']) => void;
  setTablesToWatch: (tables: string[]) => void;
  setTableRoutes: (routes: TableRoute[]) => void;
}

export const useConfigStore = create<ConfigState>((set) => ({
  dbConfig: {
    host: 'localhost',
    port: 5433,
    user: 'handalab',
    password: 'handalab',
    database: 'projects',
  },
  tablesToWatch: [],
  tableRoutes: [],
  setDbConfig: (config) => set({ dbConfig: config }),
  setTablesToWatch: (tables) => set({ tablesToWatch: tables }),
  setTableRoutes: (routes) => set({ tableRoutes: routes }),
}));
