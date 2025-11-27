import { fetchWithNotification } from "../fetch";

export async function getSettings() {
    const options = { method: "GET" };

    const retVal: any = await fetchWithNotification(
        `${import.meta.env.VITE_DATABASE_API}/getSettings`,
        options
    );
    console.log('getSettings', retVal)
    return retVal
}
