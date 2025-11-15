# Habitat Inventory Application

## Data Resources
A data resource is defined to be a name associated with a refresh rate, a schema object, and a CRUD API URL for a backend database. 

The schema object includes default viewing information used by the Data View Resource, such as order, size, type for display and validation, etc.

```
const dataMeta: DataMetaType = {
    _id: {hide: true, default: uniqueKey()},
    name: {title: 'Name', order: 1, type: 'string', size: 50, filterType: 'fuzzy', default: ''},
    addr: {title: 'Address', order: 2, type: 'string', size: 80, filterType: 'fuzzy', default: ''},
    familySize: {title 'Household', order: 3, type: 'number', size: 8, default: null}
}

type DataMetaType = {
    [key: string]: MetaType | DataMetaType;
};

export type HeaderType = {
    title: string,
    hide?: boolean | undefined
    type: 'string' | 'select' | 'number' | 'image' | 'json' | 'boolean',
    isArray?: boolean | undefined
    required?: boolean | undefined,
    pattern?: string | undefined,
    filterPrimary?: boolean
    filterSecondary?: boolean
    filterType?:
        'arrIncludes' |
        'arrIncludesAll' |
        'arrIncludesSome' |
        'equals' |
        'equalsString' |
        'equalsStringSensitive' |
        'fuzzy' |
        'includesString' |
        'includesStringSensitive' |
        'inNumberRange' |
        'weakEquals'
    validate?: (e: any) => { isValid: boolean, msg: string },
    size?: number | string,
    options?: { value: string, label: string }[],
    default?: any
}
```

### Data Resource hooks
useDataResource with methods of create the resource, change the refresh rate, and release the resource
useResourceData with CRUD methods (Create, Read, Update, Delete)

## Data View Resources
A data view resource is defined to be a name associated with a Data Resource name along with filters, sorting order, pagination start and length

### Data View Resource hooks
useDataViewResource with methods to create the resource and release the resource
useDataView with methods to change the filtering, sorting order, pagination
