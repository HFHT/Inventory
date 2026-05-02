import { useEffect } from "react";
import { useDataResource, useResourceData } from "../stores";
import { LoadingSkeleton } from "../components/table/components";
import { ParcelBomInventory, ParcelList } from "../features/parcels";
import type { ParcelInventoryType } from "../types/parcels";

export function Parcels({ category }: { category: 'Parcels' | 'List' }) {
    const { create } = useDataResource();
    const { data: parcelData } = useResourceData<ParcelInventoryType[]>("parcelInventory");
    useEffect(() => {
        console.log('create resources, construction')
        create({
            id: "inventory",
            apiUrl: `${import.meta.env.VITE_DATABASE_API}/mongoDB`,
            db: 'Construction',
            col: 'Inventory',
            refreshRate: 10000
        });
        create({
            id: "parcelInventory",
            apiUrl: `${import.meta.env.VITE_DATABASE_API}/mongoDB`,
            db: 'Homes',
            col: 'ParcelInventory',
            refreshRate: 10000
        });
        create({
            id: "parcelList",
            apiUrl: `${import.meta.env.VITE_DATABASE_API}/mongoDB`,
            db: 'Homes',
            col: 'Parcels',
            refreshRate: 10000
        });
        create({
            id: "palletInventory",
            apiUrl: `${import.meta.env.VITE_DATABASE_API}/mongoDB`,
            db: 'Construction',
            col: 'Pallets',
            refreshRate: 10000
        });
    }, [])

    if (!parcelData) return <LoadingSkeleton />
    console.log('Parcel render')
    return (
        <>
            {category === 'Parcels' && <ParcelBomInventory />}
            {category === 'List' && <ParcelList />}
        </>)
}
