// path: src/contexts/SettingsPanelContext.tsx
import React, { createContext, useContext, useState } from 'react';

type DockedPosition = 'left' | 'right' | null;

interface SettingsPanelContextType {
  dockedPosition: DockedPosition;
  setDockedPosition: (position: DockedPosition) => void;
}

const SettingsPanelContext = createContext<SettingsPanelContextType | undefined>(undefined);

export const SettingsPanelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dockedPosition, setDockedPosition] = useState<DockedPosition>('right');

  const contextValue: SettingsPanelContextType = {
    dockedPosition,
    setDockedPosition,
  };

  return (
    <SettingsPanelContext.Provider value={contextValue}>
      {children}
    </SettingsPanelContext.Provider>
  );
};

export const useSettingsPanelContext = (): SettingsPanelContextType => {
  const context = useContext(SettingsPanelContext);
  if (!context) {
    throw new Error('useSettingsPanelContext must be used within a SettingsPanelProvider');
  }
  return context;
};
