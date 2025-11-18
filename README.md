# Habitat Inventory Application

## Data Resources
A data resource is defined to be a name associated with a refresh rate, a schema object, and a CRUD API URL for a backend database. 

The schema object includes default viewing information used by the Data View Resource, such as order, size, type for display and validation, etc.

| Name            | Type                                                                   | Description                              |   |   |
|-----------------|------------------------------------------------------------------------|------------------------------------------|---|---|
| title           | string                                                                 | Display label                             |   |   |
| hide            | boolean                                                                | Do not display                           |   |   |
| order           | number                                                                 | Display order                            |   |   |
| type            | string \| number \| image \|<br>select \| boolean \| json              | Data type                                |   |   |
| size            | number                                                                 | Size of the data                         |   |   |
| isArray         | boolean                                                                | Treat data as an array                   |   |   |
| defaultValue    | string \| number \| null \| undefined \| object                        | Default value for new entry              |   |   |
| required        | boolean                                                                | Required data element                    |   |   |
| pattern         | regex string                                                           | allowed values                           |   |   |
| filterPrimary   | boolean                                                                | This field is used as a primary filter   |   |   |
| filterSecondary | boolean                                                                | This field is used as a secondary filter |   |   |
| filterType      | equals \| fuzzy \| includes \|<br>(props) => {return // true or false} | The filter to be applied to this field.  |   |   |
| validate        | (props) => {return {isValid: boolean, msg: string}}                    | Additional validation logic              |   |   |

```
const dataMeta: DataMetaType = {
    _id: {hide: true, default: uniqueKey()},
    name: {
        first: {title: 'First', order: 1, type: 'string', size: 50, filterType: 'fuzzy', default: ''},
        last: {title: 'Last', order: 2, type: 'string', size: 50, filterType: 'fuzzy', default: ''},
    },
    addr: {title: 'Address', order: 3, type: 'string', size: 80, filterType: 'fuzzy', default: ''},
    familySize: {title 'Household', order: 4, type: 'number', size: 8, default: null}
}

type DataMetaType = {
    [key: string]: MetaType | DataMetaType;
};

export type MetaType = {
    title: string,
    hide?: boolean | undefined
    order?: number
    type: 'string' | 'select' | 'number' | 'image' | 'json' | 'boolean',
    isArray?: boolean | undefined
    required?: boolean | undefined,
    pattern?: string | undefined,
    filterPrimary?: boolean
    filterSecondary?: boolean
    filterType?:
        'equals' |
        'fuzzy' |
        'includes' |
        (props) => {
            return // true or false based on custom logic
        }
    validate?: (e: any) => { isValid: boolean, msg: string },
    size?: number | string,
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
