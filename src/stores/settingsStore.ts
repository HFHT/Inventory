// store/settingsStore.ts

import { create } from 'zustand';
import { getSettings } from '../services/database/getSettings';

// Types
type User = { _id: string, name: string, /* ...other fields */ };
type CategoryMenuItems = {
    category: string;
    catKey: string;
    serials: boolean;
    subMenu: string[];
};
type Category = {
    toolMenuItems: CategoryMenuItems[];
    constructionMenuItems: CategoryMenuItems[];
};
type Location = {
    Name: string;
    lat: number;
    lon: number;
    Org?: {Aisle: string; Bay: string}[];
    hide?: boolean;
    id?: string;
}
type Locations = { _id: string, Locations: Location[]};
type Prompt = { _id: string, text: string, /* ... */ };
type Select = { _id: string, value: string, /* ... */ };

interface SettingsState {
    users: User[];
    categories: Category;
    locations: Locations;
    prompts: Prompt[];
    selects: Select[];
    fetchSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
    users: [],
    categories: { toolMenuItems: [], constructionMenuItems: [] },
    locations: {_id: 'x', Locations: []},
    prompts: [],
    selects: [],
    fetchSettings: async () => {
        const data = await getSettings();
        set({
            users: data.users || [],
            categories: data._categories[0] || { toolMenuItems: [], constructionMenuItems: [] },
            locations: data._locations[0] || [],
            prompts: data._prompts || [],
            selects: data._selects || [],
        });
    },
}));

// Individual hooks for each collection
export const useUsers = () => useSettingsStore((state) => state.users);
export const useCategories = () => useSettingsStore((state) => state.categories);
export const useLocations = () => useSettingsStore((state) => state.locations);
export const usePrompts = () => useSettingsStore((state) => state.prompts);
export const useSelects = () => useSettingsStore((state) => state.selects);
export const useFetchSettings = () => useSettingsStore((state) => state.fetchSettings);
