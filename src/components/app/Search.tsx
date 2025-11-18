import classes from './styles/Search.module.css'
import { type JSX, useState } from 'react';
import { ActionIcon, Autocomplete, Box, Button, Group, Popover, Pill, PillGroup, Stack, Text } from "@mantine/core";
import { useDebouncedCallback, useDisclosure } from '@mantine/hooks';
import { IconExclamationCircle, IconSearch, IconX } from "@tabler/icons-react";
import { existsByProp, toggleByProp } from '../../utils/array';
import type { SearchFnType } from './hooks/useSearch';
import { useThemeStore } from '../../stores';
/**
 * @prop {boolean}  visibleFrom     - Used to control the formatting on mobile devices
 * @prop {object}   sources         - Array of database and corresponding search index to display as pills to narrow the search function
 * @prop {function} searchFn        - A function to perform the database search
 * @prop {array}    searchData      - The data returned from the search
 * @prop {function} selected        - A function to communicate which search result row was selected
 */
interface SearchProps {
    searching: boolean
}
export type SearchControlProps = {
    unsavedChanges: any,
    requestSave: () => void,
}
export type SelectedDatabase = {
    db: string;
    collection: string;
    idx: string;
    title: string;
}
export type DatabaseMeta = {
    db: string;
    collection: string;
    idx: string;
    title: string;
    icon: Element | JSX.Element
};
// type SearchResult = {
//     title: string;
//     db: string;
//     key: number;
// };
type SearchResult = {
    db: string;
    docs: any[]
};
type SearchAutocompleteProps<T> = {
    sources: DatabaseMeta[]
    searchFn: SearchFnType
    selected: ({ ...Database }) => void;
    loading: boolean;
    limit?: number
};
const ROW_LIMIT = 15
export function Search({ searching, }: SearchProps) {
    const { isMobileOrTablet } = useThemeStore()
    // const { searchFn, searchSources, unsavedChanges, requestSave, requestDiscard } = usePageLayoutSearch()
    // const [searchSelected, { open, toggle }] = useDisclosure(false)

    return (
        <>
            {/* <UnsavedChanges enabled={unsavedChanges} isMobileOrTablet={isMobileOrTablet} />
            <SearchButton enabled={!unsavedChanges} opened={searchSelected} loading={searching} open={open} toggle={toggle} /> */}
        </>
    )
    interface UnsavedChangesProps {
        enabled: boolean
        isMobileOrTablet?: boolean
    }
    function UnsavedChanges({ enabled, isMobileOrTablet }: UnsavedChangesProps) {
        if (!enabled) return <></>
        return (
            <div className={classes.sBar}>
                <div className={classes.sIcon} ><IconExclamationCircle size={18} /></div>
                {!isMobileOrTablet &&
                    <div className={classes.sText}><Text>Unsaved changes</Text></div>
                }
                <div className={classes.sBtns}>
                    <Group>
                        {/* <Button variant="outline" onClick={() => requestDiscard()} color='#bf9f16'>Discard</Button>
                        <Button variant="outline" onClick={() => requestSave()}>&nbsp;&nbsp;Save&nbsp;&nbsp;</Button> */}
                    </Group>
                </div>
            </div>
        )
    }
    interface SearchButtonProps {
        enabled: boolean
        opened: boolean
        loading: boolean
        open: () => void
        toggle: () => void
    }
    function SearchButton({ enabled, opened, loading, open, toggle }: SearchButtonProps) {
        if (!enabled) return <></>
        return (
            <Popover offset={-38} width='target' opened={opened} position='bottom-start'
                shadow='md' transitionProps={{ transition: 'pop-top-left', duration: 150 }}
                clickOutsideEvents={['mouseup', 'touchend']}
                onDismiss={toggle}
            >
                <Popover.Target>
                    <div className={classes.sBar} onClick={open}>
                        <div className={classes.sIcon} ><IconSearch size={18} /></div>
                        <div className={classes.sText}><Text>Search....</Text></div>
                    </div>
                </Popover.Target>
                <Popover.Dropdown>
                    <Box p='xs'>
                        {/* <DatabaseSearchAutocomplete loading={loading} limit={ROW_LIMIT}
                            sources={searchSources}
                            searchFn={searchFn}
                            selected={function (item: unknown): void {
                                console.log('selected', item);
                            }} /> */}
                    </Box>
                </Popover.Dropdown>
            </Popover>
        )
    }
}

export function DatabaseSearchAutocomplete<T>({
    sources,
    searchFn,
    selected,
    limit = 15
}: SearchAutocompleteProps<T>) {
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false)
    const [searchData, setSearchResults] = useState<SearchResult[]>()
    const [selectedDBs, setSelectedDBs] = useState<SelectedDatabase[]>([])
    console.log(sources)
    // // When search or database changes, run searchFn
    // useEffect(() => {
    //     if (selectedDb) {
    //         searchFn(search, selectedDb);
    //     }
    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [selectedDb]);

    const handleSearch = (query: string) => {
        console.log(query)
        setSearch(query)
        query.length > 2 && handleSearchCallback(query)
    }
    const handleSearchCallback = useDebouncedCallback(async (query: string) => {
        setLoading(true);
        console.log(searchFn)
        console.log(query, selectedDBs)
        setSearchResults(await searchFn({ query: query, selectedDBs: [...selectedDBs] }));
        setLoading(false);
    }, 750);

    const searchString = () => {
        if (selectedDBs.length === 0) return `Search....`
        if (selectedDBs.length > 1) return `Search selected...`
        return `Search in ${selectedDBs[0].title}...`
    }
    const pillQuantity = (db: DatabaseMeta) => {
        // console.log(db, searchData)
        if (searchData === undefined || searchData.length === 0) return ''
        let theDB = searchData.find((sf) => sf.db === db.db)
        return theDB ? ` ${theDB.docs.length}` : ''
    }
    /**
     * @todo - When we have search results and a pill is selected then filter the list for only that database.
     */
    return (
        <Stack gap="xs">
            <Autocomplete
                placeholder={searchString()}
                value={search}
                onChange={handleSearch}
                data={[]} // We'll render results custom below
                leftSection={
                    <ActionIcon variant='default' loading={loading}>
                        <IconSearch size={18} />
                    </ActionIcon>
                }
            />
            <PillGroup>
                <ActionIcon variant='default' disabled={selectedDBs.length === 0} onClick={() => setSelectedDBs([])}>
                    <IconX size={14} />
                </ActionIcon>
                {sources.map((db, i) => (
                    <Pill
                        key={db.db + db.idx}
                        onClick={() => {
                            const newVal = toggleByProp(selectedDBs, db, 'title')
                            console.log(newVal)
                            setSelectedDBs(newVal)
                        }}
                        c={existsByProp(selectedDBs, db, 'title') ? 'blue' : 'gray'}
                        variant={existsByProp(selectedDBs, db, 'title') ? 'default' : 'filled'}
                    >
                        {`${db.title}${pillQuantity(db)}`}
                    </Pill>
                ))}
            </PillGroup>
            <Stack gap={0}>
                {searchData && searchData.length === 0 && search ? (
                    <Text c="dimmed" size="sm" fs='italic'>
                        No results found.
                    </Text>
                ) : (
                    searchData && searchData.slice(0, limit).map((item, idx) => (
                        <div className={classes.sDropDown}
                            key={idx}
                            onMouseDown={() => selected(item)}
                            onClick={() => selected(item)}
                        >
                            {item.db}
                        </div>
                    ))
                )}
            </Stack>
        </Stack>
    );
}
