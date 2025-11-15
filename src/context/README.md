# Contexts

## Category

## Data
Manages the CRUD actions for one or more Mongo Databases. A Data Resource is registered by providing a name, a refresh interval, and the CRUD API URL for that data resource. Hooks are provided to register or remove a data resource and for the CRUD actions.

## DataViews
Manages views to be displayed by various components. A new view is registered against a Data Resource with a set of filters, page sizes, sort order. The view is returned to them via a hook by pulling a copy of the information from the Data Provider.

## Main

## Settings
