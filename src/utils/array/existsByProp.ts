/**
 * For Objects, check if an object exists in an array of objects using one of the object properties.
 * 
 * @param array 
 * @param entry 
 * @param prop 
 * @returns boolean
 * 
 * @example
    type User = { id: number; name: string };
    const users: User[] = [ { id: 1, name: "Alice" }, { id: 2, name: "Bob" } ];
    const exists = existsByProp(users, { id: 2, name: "Bobby" }, "id"); // true
    const notExists = existsByProp(users, { id: 3, name: "Clara" }, "id"); // false
 */
export function existsByProp<T, K extends keyof T>(
    array: T[],
    entry: T,
    prop: K
): boolean {
    console.log(array.some(item => item[prop] === entry[prop]), prop, array, entry)
    return array.some(item => item[prop] === entry[prop]);
}