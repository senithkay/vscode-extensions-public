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
import { HelperPaneVariableInfo } from '../../../Form/types';

type VariablesPageProps = {
    isLoading: boolean;
    variableInfo: HelperPaneVariableInfo;
    setCurrentPage: (page: number) => void;
    setFilterText: (filterText: string) => void;
    onClose: () => void;
    onChange: (value: string) => void;
};

export const VariablesPage = ({
    isLoading,
    variableInfo,
    setCurrentPage,
    setFilterText,
    onClose,
    onChange
}: VariablesPageProps) => {
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

    return (
        <>
            <HelperPane.Header
                title="Variables"
                onBack={() => setCurrentPage(0)}
                onClose={onClose}
                searchValue={searchValue}
                onSearch={handleSearch}
            />
            <HelperPane.Body loading={isLoading}>
                {variableInfo?.category.map((category) => (
                    <HelperPane.Section title={category.label}>
                        {category.items.map((item) => (
                            <HelperPane.CompletionItem
                                label={item.label}
                                type={item.type}
                                onClick={() => onChange(item.label)}
                                getIcon={() => getIcon(COMPLETION_ITEM_KIND.Variable)}
                            />
                        ))}
                    </HelperPane.Section>
                ))}
            </HelperPane.Body>
        </>
    );
};
