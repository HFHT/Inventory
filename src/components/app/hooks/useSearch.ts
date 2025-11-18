/**
 * Obtains search result from a user provided API that provides the results of queries to one or more database search requests.
 * @props {array}  requests                 - an array of collection, index, and query used by the API to perform the search
 * @props {string} connectionURI            - a database connection URI string
 * @param {string} db                       - a string containing the name of a collection or db
 * @param {string} idx                      - a string containing the search index name
 * @param {string} query                    - a string containing the search query
 */

import { type SelectedDatabase } from "../Search"

export type SearchDBType = {
    db: string
    collection: string
    idx: string
}
export type SelectedDBType = {
    db: string
    collection: string
    idx: string
    title: string
}
export type SearchHookProps = {
    query: string
    selectedDBs: SelectedDatabase[]
}

export type SearchFnType = ({ query, selectedDBs }: SearchHookProps) => Promise<any>;

export function useSearch(connectionURI: string, searchDBs: SearchDBType[]) {
    // const [isBusy, setIsBusy] = useState(false)
    var header: any = { headers: new Headers() }

    const search = async ({ query, selectedDBs }: SearchHookProps) => {
        /**
         * Minimize the number of database fetches.
         * 
         * @todo    - don't fetch until the 3rd character
         * @todo    - continue filtering the returned data until the filtered data length is zero, then fetch again.
         * @todo    - on back space continue filtering until the 1st character, then at 0 character empty search results.      
         */
        console.log(query, selectedDBs, searchDBs)
        if (!searchDBs || searchDBs.length === 0) {
            console.error('useSearch missing the array of searchable databases!')
            return []
        }
        const searchTargets = (!selectedDBs || selectedDBs.length === 0) ? [...searchDBs] : [...selectedDBs]
        if (searchTargets.length === 0) {
            console.error('useSearch missing searchable databases!')
        }
        const searches = searchDBs.filter(item =>
            searchTargets.some(
                filter =>
                    filter.collection === item.collection
                // item.title.toLowerCase().includes(filter.query.toLowerCase())
            )
        );
        console.log(searches)
        header = { method: 'POST' }
        header.body = JSON.stringify(searches.map((sm) => ({ ...sm, query: query })))
        // setIsBusy(true)
        const res = await fetch(connectionURI, header);
        // setIsBusy(false)
        if (!res.ok) {
            console.warn('Search fetchJson-err', res)
            // throw new Error(`${res.status}: ${await res.text()}`);
        }
        const retVal = await res.json()
        return retVal.filter((rf: { db: string, docs: any[] }) => rf.docs.length > 0)
        return res.json();
    }

    return { search } as const
}
