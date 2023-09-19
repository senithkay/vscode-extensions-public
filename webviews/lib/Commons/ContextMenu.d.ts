import React from "react";
export interface MenuItem {
    id: number | string;
    label: React.ReactNode;
    onClick: () => void;
    disabled?: boolean;
}
interface Props {
    items: MenuItem[];
    loading?: boolean;
}
export declare const ContextMenu: React.FC<Props>;
export {};
