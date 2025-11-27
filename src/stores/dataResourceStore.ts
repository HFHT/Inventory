/**
 * Represents the configuration for a data resource.
 */
export interface DataResourceConfig {
    /** Unique string identifier for this resource. */
    id: string;
    /** The REST API base endpoint for CRUD operations. */
    apiUrl: string;
    db: string;
    col: string;
    /** Refresh rate in milliseconds. */
    refreshRate: number;
}

type ResourceStatus = "idle" | "loading" | "error" | "updating" | "success";

/**
 * The state shape stored for each resource.
 */
export interface DataResource<T> {
    config: DataResourceConfig;
    data: T | null;
    status: ResourceStatus;
    error: string | null;
    intervalId?: number;
    isMutating: boolean;
}

/** 
 * Database API calls return this object.
 */

export interface DatabaseAPI {
    data: any[];
    error?: string;
    result?: any[]
}

import { create } from "zustand";

/**
 * Zustand store state for all active data resources.
 */
type ResourcesStore = {
    resources: Record<string, DataResource<any>>;
    setResource: (id: string, resource: DataResource<any>) => void;
    removeResource: (id: string) => void;
    isEditing: boolean;
    setIsEditing: (editing: boolean) => void;
    toggleIsEditing: () => void;
};

export const useDataResourcesStore = create<ResourcesStore>((set) => ({
    resources: {},
    setResource: (id, resource) =>
        set((state) => ({
            resources: { ...state.resources, [id]: resource },
        })),
    removeResource: (id) =>
        set((state) => {
            const { [id]: _, ...rest } = state.resources;
            return { resources: rest };
        }),
    isEditing: false,
    setIsEditing: (editing: boolean) => set(() => ({ isEditing: editing })),
    toggleIsEditing: () => set((state) => ({ isEditing: !state.isEditing }))
}));

import { useCallback } from "react";
// import type { ViewerDbRowTypes } from "../types"; // Only needed for selectedRow

/**
 * Fetch the resource data (Read)
 */
async function fetchResource<T>(config: DataResourceConfig): Promise<T> {
    const response = await fetch(`${config.apiUrl}?db=${config.db}&col=${config.col}`, { method: 'GET' });
    if (!response.ok) throw new Error("Fetch failed");
    return response.json();
}

//... Put/POST/DELETE functions omitted for brevity. Implement as needed.

export function useDataResource() {
    const { resources, setResource, removeResource, isEditing } = useDataResourcesStore();
    /**
     * Create a new data resource and start its refresh timer.
     */
    function create<T>(config: DataResourceConfig) {
        if (resources[config.id]) return; // already exists

        let intervalId: number | undefined;

        const load = async () => {
            console.log('load', isEditing)
            if (isEditing) return;

            setResource(config.id, {
                config,
                data: null,
                status: "loading",
                error: null,
                isMutating: false,
                intervalId,
            });
            try {
                const retVal = await fetchResource<T>(config);
                const { data, error } = retVal as DatabaseAPI
                setResource(config.id, {
                    config,
                    data,
                    status: "success",
                    error: error ? error : null,
                    isMutating: false,
                    intervalId,
                });
            } catch (e: any) {
                setResource(config.id, {
                    config,
                    data: null,
                    status: "error",
                    error: e.message,
                    isMutating: false,
                    intervalId,
                });
            }
        };

        // Initial load
        load();

        // // Setup interval
        // intervalId = setInterval(() => {
        //     console.log('interval', isEditing, config.id)
        //     if (resources[config.id]?.isMutating || isEditing) return;
        //     load();
        // }, config.refreshRate);

        // Save resource/store intervalId
        setResource(config.id, {
            config,
            data: null,
            status: "loading",
            error: null,
            isMutating: false,
            intervalId,
        });
    }

    /**
     * Change the refresh rate of an existing resource.
     */
    function changeRefreshRate(id: string, newRate: number) {
        const resource = resources[id];
        if (!resource) return;
        if (resource.intervalId) clearInterval(resource.intervalId);

        // Setup new interval
        // const intervalId = setInterval(() => {
        //     console.log('intervalID', isEditing)
        //     if (resources[id]?.isMutating || isEditing) return;
        //     fetchResource(resource.config).then((data) => {
        //         setResource(id, {
        //             ...resource,
        //             data,
        //             status: "success",
        //             error: null,
        //             intervalId,
        //         });
        //     });
        // }, newRate);

        setResource(id, {
            ...resource,
            config: { ...resource.config, refreshRate: newRate },
            // intervalId,
        });
    }

    /**
     * Release and cleanup a data resource.
     */
    function release(id: string) {
        const resource = resources[id];
        if (resource?.intervalId) {
            clearInterval(resource.intervalId);
        }
        removeResource(id);
    }

    return { resources, create, changeRefreshRate, release, isEditing };
}

/**
 * Access a specific resource's data and perform CRUD actions.
 * @param id The resource ID.
 */
export function useResourceData<T>(id: string) {
    const { resources, setResource } = useDataResourcesStore();
    const resource = resources[id];

    const config = resource?.config;

    // CREATE
    const create = useCallback(
        async (item: Partial<T>) => {
            if (!config) throw new Error("Resource does not exist");
            setResource(id, { ...resource, isMutating: true });
            try {
                const res = await fetch(config.apiUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(item),
                });
                if (!res.ok) throw new Error("Create failed");
                const retVal = await res.json();
                const { data, result, error } = retVal as DatabaseAPI
                setResource(id, {
                    ...resource,
                    data,
                    status: error ? "error" : "success",
                    error: error ? error : null,
                    isMutating: false,
                });
            } catch (e: any) {
                setResource(id, {
                    ...resource,
                    isMutating: false,
                    status: "error",
                    error: e.message,
                });
            }
        },
        [id, config, resource, setResource]
    );

    // UPDATE
    const update = useCallback(
        // async (item: Partial<T> & { id: string | number }) => {

        async (item: any) => {
            console.log(item, id, config)
            if (!config) throw new Error("Resource does not exist");
            setResource(id, { ...resource, isMutating: true });
            const body = { db: config.db, col: config.col, rows: [{ filter: { _id: item._id }, update: item }] }
            try {
                const res = await fetch(`${config.apiUrl}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body),
                });
                if (!res.ok) throw new Error("Update failed");
                const retVal = await res.json();
                const { data, result, error } = retVal as DatabaseAPI
                setResource(id, {
                    ...resource,
                    data,
                    status: error ? "error" : "success",
                    error: error ? error : null,
                    isMutating: false,
                });
            } catch (e: any) {
                setResource(id, {
                    ...resource,
                    isMutating: false,
                    status: "error",
                    error: e.message,
                });
            }
        },
        [id, config, resource, setResource]
    );

    // DELETE
    const remove = useCallback(
        async (itemId: string | number) => {
            if (!config) throw new Error("Resource does not exist");
            setResource(id, { ...resource, isMutating: true });
            try {
                const res = await fetch(`${config.apiUrl}/${itemId}`, {
                    method: "DELETE",
                });
                if (!res.ok) throw new Error("Delete failed");
                const retVal = await res.json();
                const { data, result, error } = retVal as DatabaseAPI
                setResource(id, {
                    ...resource,
                    data,
                    status: error ? "error" : "success",
                    error: error ? error : null,
                    isMutating: false,
                });
            } catch (e: any) {
                setResource(id, {
                    ...resource,
                    isMutating: false,
                    status: "error",
                    error: e.message,
                });
            }
        },
        [id, config, resource, setResource]
    );

    // RELOAD
    const reload = useCallback(() => {
        if (!config) return;
        setResource(id, { ...resource, status: "loading", error: null });
        fetchResource<T>(config)
            .then((retVal) => {
                const { data, error } = retVal as DatabaseAPI;
                setResource(id, {
                    ...resource,
                    data,
                    status: error ? "error" : "success",
                    error: error ? error : null,
                    isMutating: false,
                });
            })
            .catch((e: any) => {
                setResource(id, {
                    ...resource,
                    status: "error",
                    error: e.message,
                    isMutating: false,
                });
            });
    }, [id, config, resource, setResource]);

    // READ: just return `resource.data`
    return {
        data: resource?.data as T | null,
        status: resource?.status,
        error: resource?.error,
        isMutating: resource?.isMutating,
        create,
        update,
        remove,
        reload: reload,
    };
}

export function useEditing() {
    const { isEditing, setIsEditing, toggleIsEditing } = useDataResourcesStore();
    return { isEditing, setIsEditing, toggleIsEditing };
}


/*
// Example usage in a component
const { create, changeRefreshRate, release } = useDataResource();
const { data, create: createItem, update, remove } = useResourceData<MyType>("users");

// Creating a resource
create({ id: "users", apiUrl: "/api/users", refreshRate: 10000 });

// Changing refresh rate
changeRefreshRate("users", 5000);

// Cleanup
release("users");
*/