# Library Structure

## components: Reusable, atomic/common components

## features: Business/domain features and page elements

## layouts: Layout wrappers

## pages: Route entry points

## hooks: Hooks not associated with a specific context

## utils: TypeScript functions not associated with a specific context or component.

## types: TyepScript types that are not associated with a specific context or component.

# Todo
Transfer to subdivision - how to handle this? create an "All" parcel to contain it?
--- Is there a subdivision infrastructure parcel, should it be like any other parcel except a name? Probably!
--- would it be different than the "All" parcel?

Return of pallet or item from parcel to inventory, this should be a return process starting at the parcel or pallet.
--- should we allow negitive items on the Inventory to Parcel "return" items or would this be confusing?

Modal control and Ribbon controls use the same constant names such as pallet and inventory, this gets confusing.