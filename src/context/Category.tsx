import { createContext } from "react";

const CategoryContext = createContext<undefined>(undefined);

export const CategoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <CategoryContext.Provider value={undefined}>
            {children}
        </CategoryContext.Provider>
    );
};