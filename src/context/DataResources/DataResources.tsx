import React, { createContext, useContext, useRef, useState, useEffect, type ReactNode } from 'react';




/**
 * Resource CRUD endpoints
 */
export interface ResourceAPI {
    create: string;
    read: string;
    update: string;
    delete: string;
}

/**
 * Data Resource Definition
 */
export interface DataResourceConfig<T> {
    id: string;
    api: ResourceAPI;
    refreshRate: number; // milliseconds
    initialData?: T;
}

/**
 * Data Resource state
 */
export interface DataResourceState<T> {
    data: T | null;
    loading: boolean;
    error: unknown;
    isMutating: boolean;
    setRefreshRate: (rate: number) => void;
    release: () => void;
    refresh: () => void;
    crud: CRUDMethods<T>;
}

/**
 * CRUD method signatures
 */
export interface CRUDMethods<T> {
    create: (item: Partial<T>) => Promise<void>;
    read: () => Promise<void>;
    update: (item: T) => Promise<void>;
    delete: (id: string | number) => Promise<void>;
}







type InternalResource<T> = {
    config: DataResourceConfig<T>;
    state: DataResourceState<T>;
};

interface DataResourcesContextType {
    /**
     * Create or get a data resource in context
     */
    createResource: <T>(config: DataResourceConfig<T>) => void;

    /**
     * Change the refresh rate for a resource by id
     */
    setRefreshRate: (id: string, rate: number) => void;

    /**
     * Release/unregister the data resource
     */
    releaseResource: (id: string) => void;

    /**
     * Get resource state
     */
    getResource: <T>(id: string) => DataResourceState<T> | undefined;
}

const DataResourcesContext = createContext<DataResourcesContextType | null>(null);

/**
 * Provides a Data Resources Context for managing multiple data resources.
 */
export const DataResourcesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [resources, setResources] = useState<Record<string, InternalResource<any>>>({});

    /**
     * Create and initialize a resource.
     */
    const createResource = <T,>(config: DataResourceConfig<T>) => {
        setResources(prev => {
            if (prev[config.id]) return prev; // do not recreate
            return {
                ...prev,
                [config.id]: {
                    config,
                    state: createResourceState(config, removeResource),
                },
            };
        });
    };

    /**
     * Remove a resource from context
     */
    const removeResource = (id: string) => {
        setResources(prev => {
            const { [id]: _, ...rest } = prev;
            return rest;
        });
    };

    /**
     * Set refresh rate
     */
    const setRefreshRate = (id: string, rate: number) => {
        setResources(prev => {
            const res = prev[id];
            if (!res) return prev;
            res.state.setRefreshRate(rate);
            res.config.refreshRate = rate;
            return { ...prev, [id]: res };
        });
    };

    /**
     * Release a resource (public method)
     */
    const releaseResource = (id: string) => {
        resources[id]?.state.release();
        removeResource(id);
    };

    /**
     * Get the resource state object, typed
     */
    const getResource = <T,>(id: string): DataResourceState<T> | undefined => resources[id]?.state;

    // Provide memo'd context
    const value = {
        createResource,
        setRefreshRate,
        getResource,
        releaseResource,
    };

    return (
        <DataResourcesContext.Provider value={value}>
            {children}
        </DataResourcesContext.Provider>
    );
};



// import { useEffect, useRef, useCallback } from "react";

function createResourceState<T>(
    config: DataResourceConfig<T>,
    onRelease: (id: string) => void
): DataResourceState<T> {
    let intervalRef: number | null = null;
    let state: DataResourceState<T>;

    const listeners = new Set<() => void>();
    let _data: T | null = config.initialData ?? null;
    let _loading = false;
    let _error: unknown = null;
    let _isMutating = false;
    let _refreshRate = config.refreshRate;

    /**
     * Notify all listeners (for hook updates)
     */
    const notify = () => {
        listeners.forEach(fn => fn());
    };

    /**
     * Internal: CRUD operations that update state
     */
    const read = async () => {
        try {
            _loading = true;
            _error = null;
            notify();
            const response = await fetch(config.api.read);
            _data = await response.json();
            _error = null;
        } catch (e) {
            _error = e;
        } finally {
            _loading = false;
            notify();
        }
    };

    const create = async (item: Partial<T>) => {
        pauseRefresh();
        _isMutating = true;
        notify();
        try {
            await fetch(config.api.create, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(item),
            });
            // re-fetch
            await read();
        } finally {
            _isMutating = false;
            notify();
            resumeRefresh();
        }
    };

    const update = async (item: T) => {
        pauseRefresh();
        _isMutating = true;
        notify();
        try {
            await fetch(config.api.update, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(item),
            });
            await read();
        } finally {
            _isMutating = false;
            notify();
            resumeRefresh();
        }
    };

    const deleteItem = async (id: string | number) => {
        pauseRefresh();
        _isMutating = true;
        notify();
        try {
            await fetch(`${config.api.delete}/${id}`, {
                method: 'DELETE',
            });
            await read();
        } finally {
            _isMutating = false;
            notify();
            resumeRefresh();
        }
    };

    /**
     * Start/Stop refresh interval
     */
    const startRefresh = () => {
        if (intervalRef) return;
        intervalRef = setInterval(async () => {
            if (_isMutating) return;
            await read();
        }, _refreshRate);
    };

    const pauseRefresh = () => {
        if (intervalRef) clearInterval(intervalRef);
        intervalRef = null;
    };

    const resumeRefresh = () => {
        pauseRefresh();
        startRefresh();
    };

    /**
     * Change refresh rate
     */
    const setRefreshRate = (rate: number) => {
        _refreshRate = rate;
        resumeRefresh();
    };

    /**
     * Release resource
     */
    const release = () => {
        pauseRefresh();
        onRelease(config.id);
    };

    /**
     * Initial fetch and refresh
     */
    (async () => {
        await read();
        startRefresh();
    })();

    state = {
        get data() {
            return _data;
        },
        get loading() {
            return _loading;
        },
        get error() {
            return _error;
        },
        get isMutating() {
            return _isMutating;
        },
        setRefreshRate,
        release,
        refresh: read,
        crud: { create, read, update, delete: deleteItem }
    };

    return state;
}


/**
 * Provides methods to create, set refresh, or release a data resource.
 */
export function useDataResource() {
    const ctx = useContext(DataResourcesContext);
    if (!ctx) throw new Error('useDataResource must be used within DataResourcesProvider');
    return {
        /**
         * Create Resource
         */
        createResource: ctx.createResource,

        /**
         * Set refresh rate for a resource
         */
        setRefreshRate: ctx.setRefreshRate,

        /**
         * Release/unregister a resource
         */
        releaseResource: ctx.releaseResource
    };
}

/**

Get the resource data state and CRUD methods.
@template T Resource Type
@param {string} id The unique resource ID */ export function useResourceData<T>(id: string): DataResourceState<T> | undefined {
    const ctx = useContext(DataResourcesContext); if (!ctx) throw new Error('useResourceData must be used within DataResourcesProvider'); const [, setVersion] = useState(0);
    // Subscribe to resource state events to trigger updates
    const state = ctx.getResource<T>(id);

    // Simulate "notify" with polling, for simplicity. You can improve this by using an event emitter.
    useEffect(() => {
        if (!state) return;
        // Polling approach for demo; for production, use observable or event system.
        const interval = setInterval(() => setVersion(v => v + 1), 500);
        return () => clearInterval(interval);
    }, [id, state]);

    return state;
}