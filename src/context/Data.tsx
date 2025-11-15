import { createContext } from "react";

const DataContext = createContext<undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <DataContext.Provider value={undefined}>
            {children}
        </DataContext.Provider>
    );
};