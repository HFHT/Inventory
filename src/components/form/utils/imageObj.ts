/** Return either the database images object, or if undefined then return a broken image and empty array */
export const imageObj = (form: any) => {
    if (form.getValues().images) return form.getValues().images
    return { favorite: 'https://hfhtdev.blob.core.windows.net/production/brokenImage.jpg', urls: [] }
}