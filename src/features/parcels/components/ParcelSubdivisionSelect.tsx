import { Autocomplete, Select, SimpleGrid } from "@mantine/core";
import type { Locations } from "../../../../stores";
import type { ParcelInventoryType } from "../../../../types/parcelInventory";

interface ParcelSubdivisionSelectProps {
    locations: {
        from: string | null
        to: string | null
        parcel: string | null
        listOfLocations: Locations
    }
    parcelData: ParcelInventoryType[] | null
    setToLocation: (v: string | null) => void
    setToParcel: (v: string | null) => void
    allowUpdate?: boolean
}

export function ParcelSubdivisionSelect({ locations, parcelData, setToLocation, setToParcel, allowUpdate = false }: ParcelSubdivisionSelectProps) {
    return (
        <SimpleGrid cols={2}>
            <Select
                label="To"
                title="To"
                value={locations.to}
                data={
                    locations.listOfLocations?.Locations
                        .filter(l => !l.hide && l.id === undefined && l.Name !== locations.from)
                        .map(l => l.Name)
                }
                onChange={setToLocation}
            />
            {allowUpdate ?
                <Autocomplete
                    label="Parcel"
                    value={locations.parcel ? locations.parcel : ''}
                    data={[
                        "All",
                        ...(
                            parcelData
                                ?.filter(p => p.subdivision_id === locations.to)
                                .map(p => p.parcelLot)
                                .filter((x): x is string => x != null) // filter out null or undefined
                            ?? []
                        )
                    ]}
                    maxDropdownHeight={200}
                    clearable
                    onChange={setToParcel}
                />
                :
                <Select
                    label="Parcel"
                    title="Parcel"
                    value={locations.parcel}
                    data={[
                        "All",
                        ...(
                            parcelData
                                ?.filter(p => p.subdivision_id === locations.to)
                                .map(p => p.parcelLot)
                                .filter((x): x is string => x != null) // filter out null or undefined
                            ?? []
                        )
                    ]}
                    onChange={setToParcel}
                />
            }
        </SimpleGrid>
    )
}
