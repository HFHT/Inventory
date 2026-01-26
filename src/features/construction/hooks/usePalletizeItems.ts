import { useState, useEffect, useMemo } from "react";
import { useTransferBase } from "./useTransferBase";
import { palletizeItems } from "../services/palletizeItems";
import { defaultPallet } from "../constants";
import type { BasePallet, BulkInventoryItem } from "../../../types/construction";
import { useResourceData } from "../../../stores";

/**
 * Logic for the palletization flow.
 * @returns {object} State/actions for palletizing items.
 */
export function usePalletizeItems({ db, type }: { db: string, type: 'pallet' | 'inventory' }) {
    const {
        selects,
        setSelects,
        rowSelections,
        setRowSKU,
        setRowAmount,
        handleParcelSelectChange,
        rowQuantity,
        setFromLocation,
        removeItem,
        transferList,
        transferResults,
        setTransferResults,
        transferResultsColor
        // Intentionally omitting locations etc for brevity
    } = useTransferBase({ db, type: type });

    // Palletization-specific state
    const [selectedPallet, setSelectedPallet] = useState<BasePallet>(defaultPallet);
    const [selectedPalletName, setSelectedPalletName] = useState<string>('');
    const [havePalletInfo, setHavePalletInfo] = useState(false);
    /** The favorite image for the provided palletName */
    const [favoriteImage, setFavoriteImage] = useState<string | null>(null)

    /** Pallet inventory data, only for available (not shipped) pallets */
    const { data: palletData, reload: reloadPallet } = useResourceData<BasePallet[]>("palletInventory");
    const palletList = useMemo(() => {
        if (!palletData || palletData.length === 0) return [];
        return palletData.filter((d) => d.dateShipped === '').map((d) => d.title);
    }, [palletData]);


    /** Should the palletize button be disabled? */
    function transferDisabled(): boolean {
        if (transferList.length === 0) return true;
        if (transferResults !== undefined) return true;
        return transferList.some((row) => {
            if (!row || !selects.locationOfInventory) return true;
            const sel = rowSelections[row._id];
            return (
                !sel ||
                typeof sel.amount !== "number" ||
                isNaN(sel.amount)
            );
        });
    }

    /** Transfer action for palletizing */
    async function handleTransferOfItems() {
        const contents =
            Object.entries(rowSelections).map(([rowId, rowSelection]) => {
                const { parcel, ...rest } = rowSelection;
                return { ...rest, inventory_id: rowId };
            });
        const updatedSelectedPallet = {
            ...selectedPallet,
            contents: contents,
            fromLocation: selects.locationOfInventory!,
        };
        const result = await palletizeItems({
            controls: { controllingDB: db },
            items: updatedSelectedPallet,
        })
        if (result && result.pallet) setSelectedPallet(result.pallet)
        setTransferResults(result);
        reloadPallet();
        // reloadInventory();
    }

    /** For display on the grid per item */
    const onPalletQuantity = (row: BulkInventoryItem) => {
        const item = selectedPallet.contents.find((f) => f.inventory_id === row._id);
        if (!item) return '0';
        return item.amount;
    };

    // Pallet info effect for UI reset
    useEffect(() => {
        if (selectedPalletName === '') {
            setHavePalletInfo(false);
            setSelectedPallet(defaultPallet);
        } else {
            const thePallet = palletData?.find((d) => d.title === selectedPalletName);
            if (thePallet) {
                const theImage = thePallet.images ? thePallet.images.favorite : null
                setFavoriteImage(theImage)
            } else {
                setFavoriteImage(null)
            }
        }
    }, [selectedPalletName]);

    useEffect(() => {
        if (selects.locationOfInventory === null) setHavePalletInfo(false);
    }, [selects.locationOfInventory]);

    const nextStep = () => {
        const thePallet = palletData?.find((d) => d.title === selectedPalletName);
        setSelectedPallet(thePallet ?? { ...defaultPallet, title: selectedPalletName });
        setSelects((s) => ({ ...s, locationOfParcel: 'pallet' })); // and parcel: null?
        setHavePalletInfo(true);
    };

    const duplicatePalletName = () => {
        const thePallet = palletData?.find((d) => d.title === selectedPalletName);
        return !!thePallet
    }

    return {
        selects,
        rowSelections,
        setRowSKU,
        handleParcelSelectChange,
        handleTransferOfItems,
        rowQuantity,
        setFromLocation,
        setRowAmount,
        transferDisabled,
        removeItem,
        transferList,
        transferResults,
        transferResultsColor,
        selectedPalletName,
        setSelectedPalletName,
        selectedPallet,
        setSelectedPallet,
        havePalletInfo,
        onPalletQuantity,
        palletList,
        nextStep,
        duplicatePalletName,
        favoriteImage
    };
}