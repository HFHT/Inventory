export const numberError = (amt: any, qty: any) => {
    if (!amt) return null
    if (amt > qty) return 'Amount exceeds Available.'
    return null
}