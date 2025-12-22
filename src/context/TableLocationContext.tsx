import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

interface TableLocationContextType {
  tableId: string | null;
}

const TableLocationContext = createContext<TableLocationContextType | undefined>(undefined);

export const TableLocationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tableId, setTableId] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const idFromUrl = params.get('table');
    setTableId(idFromUrl);
  }, [location.search]);

  return (
    <TableLocationContext.Provider value={{ tableId }}>
      {children}
    </TableLocationContext.Provider>
  );
};

export const useTableLocation = () => {
  const context = useContext(TableLocationContext);
  if (context === undefined) {
    throw new Error('useTableLocation must be used within a TableLocationProvider');
  }
  return context;
};