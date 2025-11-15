import { createContext } from "react";

const SettingsContext = createContext<undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <SettingsContext.Provider value={undefined}>
            {children}
        </SettingsContext.Provider>
    );
};