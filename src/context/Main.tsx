import { createContext } from "react";

const MainContext = createContext<undefined>(undefined);

export const MainProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <MainContext.Provider value={undefined}>
            {children}
        </MainContext.Provider>
    );
};