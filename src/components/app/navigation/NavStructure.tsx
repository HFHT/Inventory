import { Actions, Construction, HomeBuyers, HomePage, Homes, OfficeMain, UserSettings } from "../../../pages";

export const navStructure = [
    {
        label: 'Home',
        page: <HomePage open={ true} />,
    key: 'Home'
    },
{
    label: 'Actions',
        key: 'Actions',
            children: [
                {
                    label: 'Scan Item(s)',
                    page: <Actions category='Scan' />,
          key: 'ScanInput'
                },
                {
                    label: 'Palletize',
                    page: <></>,
          key: 'Palletize'

                },
                {
                    label: 'Receipts',
                    page: <Actions category='Receipts' />,
          key: 'Receipts'

                },
                {
                    label: 'Perform Inventory',
                    page: <></>,
          key: 'Inventory'

                },
            ],
    },
{
    label: 'Construction',
        key: 'Construction',
            children: [
                {
                    label: 'All',
                    key: 'All',
                    page: <Construction category='' />,
                },
                {
                    label: 'Appliance & HVAC',
                    key: 'Appliances',
                    page: <Construction category='Appliances' />,
                },
                {
                    label: 'Building Materials',
                    key: 'BldgMat',
                    page: <Construction category='BldgMat' />
                },
                {
                    label: 'Cabinets',
                    key: 'Cabinet',
                    page: <Construction category='Cabinet' />
                },
                {
                    label: 'Doors',
                    key: 'Door',
                    page: <Construction category='Door' />
                },
                {
                    label: 'Electrical',
                    key: 'Electrical',
                    page: <Construction category='Electrical' />
                },
                {
                    label: 'Lumber',
                    key: 'Lumber',
                    page: <Construction category='Lumber' />
                },
                {
                    label: 'Paint',
                    key: 'Paint',
                    page: <Construction category='Paint' />
                },
                {
                    label: 'Plumbing',
                    key: 'Plumbing',
                    page: <Construction category='Plumbing' />
                },
                {
                    label: 'Supplies',
                    key: 'Supplies',
                    page: <Construction category='Supplies' />
                },
                {
                    label: 'Assemblies',
                    key: 'Assemblies',
                    page: <Construction category='Assemblies' />
                },
                {
                    label: 'Pallet',
                    key: 'Pallet',
                    page: <Construction category='Pallet' />
                },
                {
                    label: 'Windows',
                    key: 'Windows',
                    page: <Construction category='Windows' />
                },
            ]
},
{
    label: 'Tools',
        key: 'Tools',

            children: []
},
// {
//   label: 'Home Models',
//   key: 'Home Models',

//   children: [
//     {
//       label: 'List',
//       page: 'Models',
//       key: 'Models'

//     },
//     {
//       label: 'Design',
//       page: 'Design',
//       key: 'Design'

//     },
//   ],
// },
{
    label: 'Parcels',
        key: 'Parcels',

            children: [
                {
                    label: 'Parcel Inventory',
                    page: <Homes category='Parcels' />,
          key: 'ParcelInventory'
                },
                {
                    label: 'List',
                    page: <Homes category='HomesTable' />,
          key: 'HomesTable'
                },
                {
                    label: 'Map',
                    page: <Homes category='HomesMap' />,
          key: 'HomesMap'
                },
            ],
    },
{
    label: 'Home Buyers',
        key: 'Home Buyers',

            children: [
                // {
                //   label: 'List',
                //   page: 'HomeBuyerList',
                //   key: 'HomeBuyerList'

                // },
                {
                    label: 'Mortgages',
                    page: <HomeBuyers category='Mortgages' />,
          key: 'Mortgages'

                },
                {
                    label: 'Delinquencies',
                    page: <HomeBuyers category='Delinquencies' />,
          key: 'Delinquencies'

                },
                {
                    label: 'Delinquency Reports',
                    page: <HomeBuyers category='DelinquencyReports' />,
          key: 'DelinquencyReports'

                },
                {
                    label: 'Upload New Month',
                    page: <HomeBuyers category='NewReport' />,
          key: 'NewReport'

                },
            ],
    },
{
    label: 'Office',
        key: 'Office',

            children: [
                {
                    label: 'Computers',
                    page: <OfficeMain category='Computers' />,
          key: 'Computers'

                },
            ],
    },
{
    label: 'Settings',
        key: 'Settings',
            children: [
                {
                    label: 'Account',
                    page: <UserSettings />,
          key: 'AccountSettings'
                },
                {
                    label: 'Models',
                    page: <UserSettings />,
          key: 'ModelSettings'
                },
                {
                    label: 'Subdivisions',
                    page: <UserSettings />,
          key: 'SubdivisionSettings'
                },
                {
                    label: 'Users',
                    page: <UserSettings />,
          key: 'UserSettings'
                },
            ],
    },
  ];