import { fetchWithNotification } from "../fetch";

export async function getFromDB(db: string, col: string) {
    if (!db || !col) throw new Error('Program error, getFromDB')
    const options = { method: "GET" };

    const retVal: any = await fetchWithNotification(
        `${import.meta.env.VITE_DATABASE_API}/getMongoDB?db=${db}&col=${col}`,
        options
    );
    console.log('getFromDB', retVal)
    return retVal
}
