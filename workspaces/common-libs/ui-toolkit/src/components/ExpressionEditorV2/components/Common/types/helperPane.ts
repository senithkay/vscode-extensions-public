/* eslint-disable @typescript-eslint/ban-types */
/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { CSSProperties, PropsWithChildren, ReactNode } from "react";
import { StyleBase } from "./common";
import { HelperPaneOrigin } from "../../../types/common";

export type ArrowProps = StyleBase & {
    origin: HelperPaneOrigin;
}

export type LibraryBrowserProps = PropsWithChildren<{
    loading?: boolean;
    searchValue: string;
    titleSx?: CSSProperties;
    onSearch: (searchTerm: string) => void;
    onClose: () => void;
}>;

export type HelperPaneIconButtonProps = {
    title: string;
    getIcon: () => ReactNode;
    onClick: () => void;
}

export type HelperPaneFooterProps = PropsWithChildren<{}>;

export type HelperPaneCompletionItemProps = PropsWithChildren<{
    level?: number;
    label: string;
    type?: string;
    getIcon?: () => ReactNode;
    onClick: () => void;
}>;

export type HelperPaneCategoryItemProps = {
    label: string;
    labelSx?: CSSProperties;
    onClick: () => void;
    getIcon?: () => ReactNode;
};

type CollapsibleConditionalProps = {
    collapsible: boolean;
    defaultCollapsed?: boolean;
    collapsedItemsCount?: number;
} | {
    collapsible?: never;
    defaultCollapsed?: never;
    collapsedItemsCount?: never;
}

export type LoadingItemProps = {
    columns?: number;
}

export type PanelViewProps = PropsWithChildren<{
    id: number;
}>;

export type PanelTabProps = {
    id: number;
    title: string;
};

export type PanelsProps = PropsWithChildren<{}>;

export type HelperPaneSectionProps = PropsWithChildren<{
    title: string;
    columns?: number;
    loading?: boolean;
    titleSx?: CSSProperties;
} & CollapsibleConditionalProps>;

type SearchBoxConditionalProps = {
    searchValue: string;
    onSearch: (searchTerm: string) => void;
} | {
    searchValue?: never;
    onSearch?: never;
}

export type HelperPaneBodyProps = PropsWithChildren<{
    loading?: boolean;
} & StyleBase>;

export type HelperPaneHeaderProps = SearchBoxConditionalProps & {
    title?: string;
    titleSx?: CSSProperties;
    onBack?: () => void;
    onClose?: () => void;
};

export type HelperPaneProps = PropsWithChildren<{
    sx?: CSSProperties;
}>;
