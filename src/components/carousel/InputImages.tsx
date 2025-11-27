import { Button, FileButton, Tooltip, useMantineTheme } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconPhotoPlus } from "@tabler/icons-react";
import { uniqueKey } from "../../utils";

interface InputImagesInterface {
    images: string[]
    setImages: Function
    label?: string
    mode?: 'item' | 'donation'
}
export function InputImages({ images, setImages, label = '' }: InputImagesInterface) {
    const theme = useMantineTheme()
    const mobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`)
    const fileType = (fileName: string) => {
        return fileName.slice((Math.max(0, fileName.lastIndexOf('.')) || Infinity) + 1)
    }
    const setFiles = (files: any) => {
        console.log(files)
        if (files.length === 0) return;
        let newImages = []
        for (let i = 0; i < files.length; i++) {
            if (files[i].type.split('/')[0] !== 'image') continue
            if (!images.some((e: any) => e.name === files[i].name)) {
                newImages.push({
                    name: files[i].name,
                    uniqueName: `img${uniqueKey()}.${fileType(files[i].name)}`,
                    url: URL.createObjectURL(files[i]),
                    blob: files[i]
                })
            }
        }
        setImages([...newImages])
    }
    return (
        <>
            <FileButton onChange={setFiles} accept="image/*" multiple capture>
                {(props) =>
                    <>
                        <Tooltip label='Upload image.' >
                            <Button leftSection={<IconPhotoPlus style={{ width: 'rem(14)', height: 'rem(14)' }} />} variant='light' size={mobile ? "xs" : "sm"} {...props}>{label}</Button>
                        </Tooltip>
                    </>}
            </FileButton>
        </>
    )
}
