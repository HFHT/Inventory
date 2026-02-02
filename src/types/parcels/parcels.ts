export type ParcelOld = {
    _id: string
    active: boolean
    Elevation: string
    Notes: string;
    REKey2: string | number;
    REKey: string | number;
    acquired: string;
    'acquired #': string;
    acquired2: string;
    'acquired2#': string;
    address: string;
    buildStatus: string;
    city: string;
    funding: string;
    geocode: {
        lat: number
        lng: number
        address: string
        addressObject: unknown
    }
    grantee: string;
    grantee2: string;
    job: string;
    lot: string;
    model: string;
    parcel: string;
    phase: string;
    pin: string;
    restrictions: string;
    saleType: string;
    sold: string;
    'sold #': string;
    sold2: string;
    'sold2#': string;
    subdivision: string;
    ward: string;
};

export type Parcel = {
    _id: string
    address: {
        street: string
        city: string
        state: string | undefined
    }
    build: {
        startDate: string
        endDate: string
        status: 'complete'
        fundingSources: string[]
        lotNumber: string
        model: string
        variant: string
        resrictions: string | undefined
    }
    history: [{
        acquired: string
        sold: string
        raisersEdge_fk: string | number | undefined
        homeBuyer_fk: string | number | undefined
        grantee: string
    }]
    location: {
        lat: number
        lng: number
        geoAddress: string | null
        subdivision_id: string | null
        ward: string | null
    }
    notes: string[]
    type: 'infrastructure' | 'sold' | 'construction' | 'available'
}