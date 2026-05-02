import type { Locations } from "../../../stores";

export function warehouseLocations(locations: Locations) {
    return locations.Locations.filter(lf => lf.warehouse)
}

export function isAtWarehouse(locationName: string, locations: Locations): boolean {
    const wh = locations.Locations.filter(lf => lf.warehouse)
    return wh.find(w => w.Name === locationName) !== undefined
}