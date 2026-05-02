import { useEffect } from "react";
import { useDataResource, useResourceData } from "../stores";
import type { Parcel, ParcelOld } from "../types/parcels";
import { Button } from "@mantine/core";

export function TempTransformParcels() {
    const { create } = useDataResource();
    const { data: parcelOldData, reload: parcelOldReload } = useResourceData<ParcelOld[]>("parcelsOld");
    const { data: parcelData, reload: parcelReload, create: parcelCreate } = useResourceData<Parcel[]>("parcelsNew");

    useEffect(() => {
        console.log('create resources, construction')
        create({
            id: "parcelsOld",
            apiUrl: `${import.meta.env.VITE_DATABASE_API}/mongoDB`,
            db: 'Homes',
            col: 'ParcelsOld',
            refreshRate: 10000
        });
        create({
            id: "parcelsNew",
            apiUrl: `${import.meta.env.VITE_DATABASE_API}/mongoDB`,
            db: 'Homes',
            col: 'Parcels',
            refreshRate: 10000
        });
    }, [])

    /**
     * Transforms a ParcelOld object into a Parcel object according to new schema definition.
     * @param old The old Parcel object
     * @returns The new Parcel object
     */
    function transformParcelOldToParcel(old: ParcelOld): Parcel {
        // Helper for undefined/casting issues
        const toStringOrUndefined = (val: unknown): string | undefined =>
            typeof val === 'string' && val.trim() !== '' ? val : undefined;

        // Map sales history (up to 2 history points in the old model)
        const history = [
            {
                acquired: old.acquired || '',
                sold: old.sold || '',
                recorderSequenceNo: old['acquired #'],
                raisersEdge_fk: old.REKey,
                homeBuyer_fk: undefined, // left undefined; consider mapping if you have info
                grantee: old.grantee,
            },
        ];
        const historyParcel = [
            {
                acquired: old.acquired || '',
                sold: old.sold || '',
                recorderSequenceNo: old['acquired #'],
            },
        ]

        // Handle possible second history object
        if (old.acquired2 || old.sold2 || old.grantee2) {
            history.push({
                acquired: old.acquired2 || '',
                sold: old.sold2 || '',
                recorderSequenceNo: old['acquired2#'] || '',
                raisersEdge_fk: old.REKey2,
                homeBuyer_fk: undefined, // left undefined; update as needed
                grantee: old.grantee2,
            });
            historyParcel.push({
                acquired: old.acquired2 || '',
                sold: old.sold2 || '',
                recorderSequenceNo: old['acquired2#'] || '',
            })
        }

        return {
            _id: old._id,
            homes: [{
                street: old.address,
                build: {
                    lotName: old.lot,
                    startDate: '', // Not available; consider enhancement if dates exist elsewhere
                    endDate: '',   // Not available
                    status: old.buildStatus,
                    fundingSources: old.funding ? [old.funding] : [],
                    model: old.model,
                    variant: '',   // No variant in old model
                    resrictions: toStringOrUndefined(old.restrictions),
                },
                history
            }],
            history: [...historyParcel],
            location: {
                lat: old.geocode.lat,
                lng: old.geocode.lng,
                geoAddress: old.geocode.address ?? null,
                lotNumber: old.lot,
                subdivision_id: old.subdivision ?? null,
                ward: old.ward ?? null,
                city: old.city,
                state: 'Az'
            },
            notes: old.Notes ? [old.Notes] : [],
            type: old.phase
        };
    }


    const startTransform = () => {
        const transformedParcel = parcelOldData?.map(p => transformParcelOldToParcel(p))
        transformedParcel?.forEach(p => {
            console.log(p)
            parcelCreate(p)
        })
    }
    if (!parcelOldData) return <>No Data...</>
    return (
        <Button onClick={() => startTransform()}>Start</Button>
    )
}
