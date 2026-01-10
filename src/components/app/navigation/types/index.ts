import type { ReactElement } from "react";

type NavItemBase = {
    label: string;
    key: string;
};

type NavLeaf = NavItemBase & {
    page: ReactElement;
    filter?: string;
    children?: never;
};

type NavGroup = NavItemBase & {
    children: NavItem[];
    filter?: never;
    page?: never;
};

export type NavItem = NavLeaf | NavGroup;

export type NavStructure = NavItem[];