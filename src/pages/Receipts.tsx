import { useEffect } from "react"
import type { Receipt } from "../types/receipts/receipt"
import { processReceipts } from "../services/ai/processReceipts"

export function Receipts() {
    const images = [
        "https://hfhtdev.blob.core.windows.net/hfht-inventory/416098499854-20250714_104331.jpg"
    ]
    useEffect(() => {
        processReceipts({
            receipts: [
                { image_urls: images }
            ]
        })

    }, [])

    return (
        <>
            <div>Receipts</div> <div>card based initial navigation with a choide between date folders and vendor folders and a list of all receipts. Selection of a folder displays a table of the contents. The folders will show a total dollars, receipts, and items, perhaps with the most recent 5 receipts.</div>
        </>
    )
}
