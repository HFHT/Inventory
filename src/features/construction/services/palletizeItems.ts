import { fetchWithNotification } from "../../../services/fetch"
import type { TransferResults } from "../../../types/construction"

type TransferItems = {
    controls: any
    items: any
}

export async function palletizeItems(body: TransferItems): Promise<TransferResults | undefined> {

    const header: any = { method: 'POST' }
    header.body = JSON.stringify(body)

    return await fetchWithNotification(`${import.meta.env.VITE_DATABASE_API}/palletizeItems`, header)

}
