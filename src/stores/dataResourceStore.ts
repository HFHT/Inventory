/**
 * Represents the configuration for a data resource.
 */
export interface DataResourceConfig {
    /** Unique string identifier for this resource. */
    id: string;
    /** The REST API base endpoint for CRUD operations. */
    apiUrl: string;
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

import { create } from "zustand";

/**
 * Zustand store state for all active data resources.
 */
type ResourcesStore = {
    resources: Record<string, DataResource<any>>;
    setResource: (id: string, resource: DataResource<any>) => void;
    removeResource: (id: string) => void;
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
}));

import { useCallback } from "react";

/**
 * Fetch the resource data (Read)
 */
async function fetchResource<T>(config: DataResourceConfig): Promise<T> {
    const response = await fetch(config.apiUrl, {method: 'GET'});
    if (!response.ok) throw new Error("Fetch failed");
    return response.json();
}

//... Put/POST/DELETE functions omitted for brevity. Implement as needed.

export function useDataResource() {
    const { resources, setResource, removeResource } = useDataResourcesStore();

    /**
     * Create a new data resource and start its refresh timer.
     */
    function create<T>(config: DataResourceConfig) {
        if (resources[config.id]) return; // already exists

        let intervalId: number | undefined;

        const load = async () => {
            setResource(config.id, {
                config,
                data: null,
                status: "loading",
                error: null,
                isMutating: false,
                intervalId,
            });
            try {
                const data = await fetchResource<T>(config);
                setResource(config.id, {
                    config,
                    data,
                    status: "success",
                    error: null,
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

        // Setup interval
        intervalId = setInterval(() => {
            if (resources[config.id]?.isMutating) return;
            load();
        }, config.refreshRate);

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
        const intervalId = setInterval(() => {
            if (resources[id]?.isMutating) return;
            fetchResource(resource.config).then((data) => {
                setResource(id, {
                    ...resource,
                    data,
                    status: "success",
                    error: null,
                    intervalId,
                });
            });
        }, newRate);

        setResource(id, {
            ...resource,
            config: { ...resource.config, refreshRate: newRate },
            intervalId,
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

    return { resources, create, changeRefreshRate, release };
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
                await res.json();
                // Optionally re-fetch data afterward
            } finally {
                setResource(id, { ...resource, isMutating: false });
            }
        },
        [id, config, resource, setResource]
    );

    // UPDATE (PATCH as example)
    const update = useCallback(
        async (item: Partial<T> & { id: string | number }) => {
            if (!config) throw new Error("Resource does not exist");
            setResource(id, { ...resource, isMutating: true });
            try {
                const res = await fetch(`${config.apiUrl}/${item.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(item),
                });
                if (!res.ok) throw new Error("Update failed");
                await res.json();
                // Optionally re-fetch data afterward
            } finally {
                setResource(id, { ...resource, isMutating: false });
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
            } finally {
                setResource(id, { ...resource, isMutating: false });
            }
        },
        [id, config, resource, setResource]
    );

    // READ: just return `resource.data`
    return {
        data: resource?.data as T | null,
        status: resource?.status,
        error: resource?.error,
        isMutating: resource?.isMutating,
        create,
        update,
        remove,
        reload: () => {
            /* Optionally trigger a manual reload */
        },
    };
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