/**
 * Adds the entry if no existing entry with the property value.
 * Removes the entry if an entry with the property value exists.
 * Returns the new array.
 * @param array 
 * @param entry 
 * @returns array
 * 
 * @example
    type Item = { id: number; name: string };
    let items: Item[] = [ { id: 1, name: "Alice" }, { id: 2, name: "Bob" } ];
    // Remove object with id=2
    items = toggleByProp(items, { id: 2, name: "Bob" }, "id"); // [ { id: 1, name: "Alice" } ]
    // Add object with id=3
    items = toggleByProp(items, { id: 3, name: "Clara" }, "id"); // [ { id: 1, name: "Alice" }, { id: 3, name: "Clara" } ]
 */
export function toggleByProp<T, K extends keyof T>(
    array: T[],
    entry: T,
    prop: K
): T[] {
    const exists = array.some(item => item[prop] === entry[prop]);
    console.log(exists, prop, entry, array)
    console.log(entry[prop])
    if (exists) {
        // Remove entries with the same property value
        return array.filter(item => item[prop] !== entry[prop]);
    } else {
        // Add the entry
        return [...array, entry];
    }
}