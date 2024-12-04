/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { PropsWithChildren, ReactNode } from "react";

export type HelperPaneIconButtonProps = {
    title: string;
    getIcon: () => ReactNode;
    onClick: () => void;
}

export type HelperPaneCompletionItemProps = {
    label: string;
    type?: string;
    getIcon?: () => ReactNode;
};

export type HelperPaneSectionProps = PropsWithChildren<{
    title: string;
}>;

type SearchBoxConditionalProps = {
    searchValue: string;
    onSearch: (searchTerm: string) => void;
} | {
    searchValue?: never;
    onSearch?: never;
}

export type HelperPaneHeaderProps = SearchBoxConditionalProps & {
    title?: string;
    onBack?: () => void;
    onClose?: () => void;
};

export type HelperPaneProps = PropsWithChildren<{
    show: boolean;
}>;
