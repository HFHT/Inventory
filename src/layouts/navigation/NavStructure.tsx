import { VimeoGatedPlayer } from '../../components/display';
import { Actions, Construction, HomeBuyers, HomePage, Homes, OfficeMain, Pallet, Parcels, Receipts, UserSettings } from '../../pages'
import { TempTransformParcels } from '../../pages/TempTransformParcels';
import { TwoLevelTable } from '../../pages/TwoLevelTable';
import type { NavItem } from '../../stores';

/**
 * Navigation item for the application.
 * 
 * @typedef {Object} NavItem
 * @property {string} label - Display name in the navigation menu.
 * @property {React.ReactNode=} page - The React element to render for this route (if it's a leaf node).
 * @property {string} key - Unique string key for this navigation item.
 * @property {NavItem[]=} children - Child navigation items (for hierarchical menus).
 */

/**
 * The overall navigation structure used by AppLayout.
 * 
 * Each item represents a main navigation link or nested menu. Leaf nodes provide a `page`
 * React component which is rendered by the PageManager based on selection.
 * 
 * - Labels are user-facing.
 * - `page` components are rendered for leaf navigation items.
 * - Nested items are specified in the `children` array.
 * 
 * @type {NavItem[]}
 */
export const navStructure: NavItem[] = [
    /**
     * Home page (dashboard/landing).
     */
    {
        label: 'Home',
        page: <HomePage />,
        key: 'Home'
    },

    /**
    * Actions section: scan, palletize, receipts, inventory.
    */
    {
        label: 'Actions',
        key: 'Actions',
        children: [
            {
                label: 'Video',
                // page: <VimeoGatedPlayer videoId={'1166414018/f02805b0d6'} />,
                page: <VimeoGatedPlayer debug={true}/>,
                key: 'Video'
            },
            {
                label: 'Search',
                page: <Actions category='Search' />,
                key: 'Search'
            },
            {
                label: 'Transfer',
                page: <Actions category='Transfer' />,
                key: 'Transfer'
            },
            {
                label: 'Receive',
                page: <Actions category='Receive' />,
                key: 'Receive'
            },
            {
                label: 'Scrap',
                page: <Actions category='Scrap' />,
                key: 'Scrap'
            },
            {
                label: 'Receipts',
                page: <Receipts />,
                key: 'Receipts'
            },
            {
                label: 'Returns',
                page: <Receipts />,
                key: 'Returns'
            },
            {
                label: 'Perform Inventory',
                page: <Actions category='Inventory' />,
                key: 'Inventory'
            },
        ],
    },

    /**
     * Construction materials/categories section.
     */
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
                label: 'Windows',
                key: 'Windows',
                page: <Construction category='Windows' />
            },
            {
                label: 'Assemblies',
                key: 'Assemblies',
                section: true,
                page: <Construction category='Assemblies' />
            },
            {
                label: 'Pallet',
                key: 'Pallet',
                page: <Pallet />
            },

        ]
    },

    /**
     * Tools menu (no children yet).
     */
    {
        label: 'Tools',
        key: 'Tools',
        children: []
    },

    /*
    // Example for future Home Models section:
    // {
    //   label: 'Home Models',
    //   key: 'Home Models',
    //   children: [
    //     { label: 'List', page: 'Models', key: 'Models' },
    //     { label: 'Design', page: 'Design', key: 'Design' },
    //   ],
    // },
    */

    /**
     * Parcel management (inventory, list, map).
     */
    {
        label: 'Parcels',
        key: 'Parcels',
        children: [
            {
                label: 'Parcel Inventory',
                page: <Parcels category='Parcels' />,
                key: 'ParcelInventory'
            },
            {
                label: 'List',
                page: <Parcels category='List' />,
                key: 'ParcelList'
            },
            {
                label: 'Import',
                page: <TempTransformParcels />,
                key: 'HomesTable'
            },
            {
                label: 'Map',
                page: <Homes category='HomesMap' />,
                key: 'HomesMap'
            },
        ],
    },

    /**
     * Home buyers section (includes mortgages, delinquencies, etc).
     */
    {
        label: 'Home Buyers',
        key: 'Home Buyers',
        children: [
            /*
            // Uncomment to enable HomeBuyerList:
            // {
            //   label: 'List',
            //   page: 'HomeBuyerList',
            //   key: 'HomeBuyerList'
            // },
            */
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

    /**
     * Office equipment management.
     */
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

    /**
     * Application settings (user account, models, subdivisions, users).
     */
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