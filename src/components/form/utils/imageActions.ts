import type { ImageAction } from "../../carousel"

export const imageActions = (theAction: ImageAction, form: any) => {
    console.log(theAction)
    const images = form.getValues().images.urls
    switch (theAction.cmd) {
        case 'Add':
            const newImageUrls = theAction.img.map((img) => `${import.meta.env.VITE_STORAGEIMAGEURL}${img.uniqueName}`)
            console.log('Add', images, newImageUrls)
            form.setFieldValue('images$urls_Array', JSON.stringify([...images, ...newImageUrls]))
            break
        case 'Favorite':
            console.log('Favorite', images)
            const imageIdx = images.findIndex((img: string) => img === theAction.url)
            if (theAction.url) {
                form.setFieldValue('images$favorite', imageIdx)
            }
            break
        case 'Delete':
            console.log('Delete', theAction.url, images)
            if (theAction.url) {
                const remainingImageUrls = images.filter((img: string) => img !== theAction.url)
                console.log(remainingImageUrls)
                form.setFieldValue('images$urls_Array', JSON.stringify(remainingImageUrls))
                if (images[0] === theAction.url) {
                    form.setFieldValue('image', null)
                }
            }
            break
    }
}