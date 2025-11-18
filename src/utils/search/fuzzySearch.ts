import Fuse from 'fuse.js';

/**
 * Perform a fuzzy search on the name and address fields of the TableData array.
 * 
 * @param data - The array of TableData to search.
 * @param searchTerm - The query string to search for.
 * @param keys - The object keys for the fields to be searched.
 * @returns Array of TableData objects matching the fuzzy search.
 */
export function fuzzySearch<T extends object>(
    data: T[],
    searchTerm: string,
    keys: string[],
    threshold = 0.4
): T[] {
    if (!searchTerm.trim()) {
        return data; // Return all if no search term provided
    }
    console.log(keys, searchTerm, data)
    const fuse = new Fuse(data, {
        keys,
        threshold
    });

    return fuse.search(searchTerm).map(result => result.item);
}