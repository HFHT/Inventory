import { useMsal } from "@azure/msal-react";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { fetchSAS } from "../services/fetchSAS";
import { useProfilePhoto } from "../hooks/useProfilePhoto";

interface AzureContextInterface {
    username: string
    name: string | undefined
    photoUrl: any
    isLoading: boolean
    inProgress: any
    sasToken: sasTokenType | undefined
}

const AzureContext = createContext<AzureContextInterface | undefined>(undefined);

interface AzureContextProps {
    children: ReactNode
}

export type sasTokenType = {
    url: any, sasKey: any
}
export const AzureContextProvider = ({ children }: AzureContextProps) => {
    const { accounts, inProgress } = useMsal()
    const username = accounts[0]?.username
    const name = accounts[0]?.name

    const { photoUrl, isLoading, error } = useProfilePhoto()
    console.log(error)
    const [sasToken, setSasToken] = useState<sasTokenType | undefined>(undefined)
    useEffect(() => {
        fetchSasToken()
    }, [])

    const fetchSasToken = async () => {
        setSasToken(await fetchSAS())
    }

    return (
        <AzureContext.Provider value={{ username, name, photoUrl, isLoading, inProgress, sasToken }}>
            {children}
        </AzureContext.Provider>
    );
}

// Util to get the Provider context and throw if missing, ie. hook used outside of the Provider
function useSafeAzureContext(): AzureContextInterface {
    const ctx = useContext(AzureContext);
    if (!ctx) {
        throw new Error(
            "This AzureContext hook must be used within a <AzureProvider>"
        );
    }
    return ctx;
}

export function useAzureUser() {
    const { name, username, photoUrl, isLoading } = useSafeAzureContext()
    return { name, username, photoUrl, isLoading }
}

export function useSasToken() {
    const { sasToken } = useSafeAzureContext()
    return sasToken
}

// "raw" context:
export function useAzureContext() {
    return useSafeAzureContext();
}