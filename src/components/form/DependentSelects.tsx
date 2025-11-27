import React from 'react';
import { Select, SimpleGrid } from '@mantine/core';

type CategoryWithSubMenu = {
    category: string;
    catKey: string;
    serials?: boolean;
    subMenu: string[];
};

type CategorySubmenuSelectProps<T extends CategoryWithSubMenu> = {
    categories?: T[];
    onChange: (selection: { category: T; subMenu: string }) => void;
    categoryLabel?: string;
    subMenuLabel?: string;
    initial?: { catKey: string; subMenu: string }; // <-- Add this prop
};

export function DependentSelect<T extends CategoryWithSubMenu>({
    categories,
    onChange,
    categoryLabel = 'Category',
    subMenuLabel = 'Submenu',
    initial,
}: CategorySubmenuSelectProps<T>) {
    const [selectedCatKey, setSelectedCatKey] = React.useState<string | null>(initial?.catKey ?? null);
    const [selectedSubMenu, setSelectedSubMenu] = React.useState<string | null>(initial?.subMenu ?? null);

    // If categories or initial change, reset selections accordingly
    React.useEffect(() => {
        if (!categories) {
            setSelectedCatKey(null);
            setSelectedSubMenu(null);
        } else if (initial) {
            setSelectedCatKey(initial.catKey);
            setSelectedSubMenu(initial.subMenu);
        }
    }, [categories, initial]);

    // Find selected category
    const selectedCategory =
        categories && selectedCatKey
            ? categories.find((cat) => cat.catKey === selectedCatKey)
            : undefined;

    // Fire onChange only if both are selected (and match actual category/subMenu)
    React.useEffect(() => {
        if (selectedCategory && selectedSubMenu && selectedCategory.subMenu.includes(selectedSubMenu)) {
            onChange({ category: selectedCategory, subMenu: selectedSubMenu });
        }
    }, [selectedCategory, selectedSubMenu]);

    const categoryData =
        categories?.map((cat) => ({
            value: cat.catKey,
            label: cat.category,
        })) ?? [];

    const subMenuData =
        selectedCategory?.subMenu.map((item) => ({
            value: item,
            label: item,
        })) ?? [];

    return (
        <SimpleGrid cols={2}>
            <Select
                label={categoryLabel}
                data={categoryData}
                value={selectedCatKey}
                onChange={(value) => {
                    setSelectedCatKey(value);
                    setSelectedSubMenu(null);
                }}
                placeholder={categories ? `Select ${categoryLabel}` : 'Loading items...'}
                disabled={!categories || categories.length === 0}
                searchable
                // withinPortal
                clearable
                nothingFoundMessage={categories ? 'No categories' : 'Loading...'}
            />
            <Select
                label={subMenuLabel}
                data={subMenuData}
                value={selectedSubMenu}
                onChange={setSelectedSubMenu}
                placeholder={
                    selectedCatKey
                        ? `Select ${subMenuLabel}`
                        : categories
                            ? 'Select category first'
                            : 'Loading...'
                }
                disabled={!selectedCategory}
                searchable
                // withinPortal
                clearable
                nothingFoundMessage={selectedCategory ? `No ${subMenuLabel}` : `Select ${categoryLabel}`}
            />
        </SimpleGrid>
    );
}