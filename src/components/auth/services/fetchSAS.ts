export async function fetchSAS() {
    const { url, sasKey } = await (await fetch(`${import.meta.env.VITE_INVENTORY_API}/getSASkey?cont=hfht-inventory`)).json();
    return { url, sasKey };
  }