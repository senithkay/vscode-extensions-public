/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useRef, useState } from 'react';
import { COMPLETION_ITEM_KIND, getIcon, HelperPane } from '@wso2-enterprise/ui-toolkit';
import { HelperPaneCompletionItem } from '@wso2-enterprise/mi-core';
import { traverseHelperPaneCompletionItem } from '../utils';

type ConfigsPageProps = {
    isLoading: boolean;
    configInfo: HelperPaneCompletionItem[];
    setCurrentPage: (page: number) => void;
    setFilterText: (filterText: string) => void;
    onClose: () => void;
    onChange: (value: string) => void;
};

export const ConfigsPage = ({
    isLoading,
    configInfo,
    setCurrentPage,
    setFilterText,
    onClose,
    onChange
}: ConfigsPageProps) => {
    const firstRender = useRef<boolean>(true);
    const [searchValue, setSearchValue] = useState<string>('');

    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            setFilterText('');
        }
    }, []);

    const handleSearch = (searchText: string) => {
        setFilterText(searchText);
        setSearchValue(searchText);
    };

    const getCompletionItemIcon = () => getIcon(COMPLETION_ITEM_KIND.Variable);

    return (
        <>
            <HelperPane.Header
                title="Configs"
                onBack={() => setCurrentPage(0)}
                onClose={onClose}
                searchValue={searchValue}
                onSearch={handleSearch}
            />
            <HelperPane.Body isLoading={isLoading}>
                {configInfo?.map((config) => (
                    traverseHelperPaneCompletionItem(config, onChange, getCompletionItemIcon)
                ))}
            </HelperPane.Body>
        </>
    );
};
