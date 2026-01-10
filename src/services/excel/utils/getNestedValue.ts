/**
 * When provided with a nested property such as: name.first, it will return the value of that property or undefined if not found.
 * Also handles array indices, e.g. address.geocode[2].
 * 
 * @param obj
 * @param path 
 * @returns string | number | object | undefined 
 * 
 * @example
 * const donorObj = {_id: '1234', name: {first: 'Joe', last: 'Smith'}, x: {y: {z: 42}}, ary: [1,2], address: { geocode: [10, 20, 42] } }
 * getNestedValue(donorObj, 'name.first')       // Joe
 * getNestedValue(donorObj, 'x.y.z')            // 42
 * getNestedValue(donorObj, 'ary.length')       // 2
 * getNestedValue(donorObj, 'address.geocode[2]') // 42
 */

export function getNestedValue(obj: unknown, path: string): unknown {
    if (typeof path !== 'string') return undefined;

    // Split by "." but keep array indices, e.g. "address.geocode[2]" => ["address", "geocode[2]"]
    const parts = path.split('.');

    let current: any = obj;

    for (let part of parts) {
        if (current == null) return undefined;

        // Regular property (with possible array indexes)
        const regex = /^([a-zA-Z0-9_$]+)(\[(\d+)\])?$/;
        const match = regex.exec(part);

        if (!match) return undefined;

        const key = match[1];
        const hasIndex = !!match[2];
        const idx = hasIndex ? parseInt(match[3], 10) : undefined;

        // If key is 'length' and no array index, return length if applicable
        if (key === 'length' && !hasIndex) {
            return typeof current === 'string' || Array.isArray(current)
                ? current.length
                : undefined;
        }

        current = current[key];

        if (hasIndex) {
            if (!Array.isArray(current)) return undefined;
            current = current[idx!];
        }
    }

    return current;
}