import { useContext, useState } from "react"
import { BlockBlobClient, AnonymousCredential } from "@azure/storage-blob";
import { notifications } from '@mantine/notifications';
import type { ImagesType } from "..";
import { useSasToken } from "../../auth";

export type ImageAction = {
    cmd: 'Add' | 'Delete' | 'Favorite' | 'View' | 'CloseView' | 'Reset',
    idx: number,
    img: ImagesType[],
    url?: string | undefined
}
export function useImages(callBack?: (e: any) => void) {
    const [imageChanged, setImageChanged] = useState(false)
    const [imageList, setImageList] = useState<ImagesType[] | []>([])
    const [imagePreview, setImagePreview] = useState<string | undefined>(undefined)
    const [isBusy, setIsBusy] = useState(false)
    const [imageProgress, setImageProgress] = useState(0);
    const [imageErr, setImageErr] = useState({ hasError: false, errDesc: '' });
    const sasToken = useSasToken()

    const imageAction = (action: { cmd: 'Add' | 'Delete' | 'Favorite' | 'View' | 'CloseView' | 'Reset', idx: number, img: ImagesType[], url?: string | undefined }) => {
        console.log('useImages-imageAction', action)
        // if (!imageList) return
        switch (action.cmd) {
            case 'Add':
                // console.log('imageAction-Add', action.img)
                setImageList([...imageList, ...action.img])
                action.img.forEach((ie) => {
                    imageUpload(ie, (url: string) =>
                        notifications.show({ color: 'green', title: `Image upload complete.`, message: ``, autoClose: 2000 })
                    )
                })
                setImageChanged(true)
                if (callBack !== undefined) {
                    // console.log('imageAction-callBack', action.img)
                    callBack({ ...action })
                }
                break
            case 'Delete':
                let updatedList = [...imageList]
                // console.log(action)
                // console.log(imageList)
                setImageList([...imageList.filter((ilf) => ilf.name !== action.img[0].name)])
                setImageChanged(true)
                callBack && callBack({ ...action })
                break
            case 'Reset':
                // setImageList(imageStringToType(mergeImages(state.joined!.donation)))
                setImageChanged(false)
                break
            case 'View':
                setImagePreview(action.url)
                break
            case 'CloseView':
                setImagePreview(undefined)
                break
            default:
        }
    }

    const imageUpload = async (file: any, callBack: (url: string) => void) => {
        console.log('imageUpload:', file, typeof file, sasToken)
        if (!sasToken) return
        const sasUrl = `${sasToken.url}/${file.uniqueName}?${sasToken.sasKey}`
        console.log(sasUrl)
        var blockBlobClient = new BlockBlobClient(sasUrl, new AnonymousCredential)
        // console.log(blockBlobClient)
        const reader = new FileReader()
        setIsBusy(true)
        reader.onload = () => {
            //@ts-ignore
            blockBlobClient.uploadData(reader.result)
                .then(() => callBack(sasUrl))
                .catch((e) => {
                    alert(e);
                    setImageErr({ hasError: true, errDesc: e });
                })
                .finally(() => { setIsBusy(false) });
        }
        reader.onprogress = (data: ProgressEvent) => {
            if (data.lengthComputable) {
                setImageProgress(((data.loaded / data.total) * 100))
            }
        }
        reader.onabort = () => setImageErr({ hasError: true, errDesc: 'Abort' });
        reader.onerror = () => setImageErr({ hasError: true, errDesc: 'Error' });
        reader.readAsArrayBuffer(file.blob)
    }

    return { imageChanged, imagePreview, imageList, setImageList, imageAction, imageUpload, imageProgress, imageErr, isBusy } as const
}