/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { COMPLETION_ITEM_KIND, getIcon, HelperPane } from '@wso2-enterprise/ui-toolkit';
import { HelperPaneFunctionInfo } from '@wso2-enterprise/mi-core';

type FunctionsPageProps = {
    isLoading: boolean;
    functionInfo: HelperPaneFunctionInfo;
    setFilterText: (filterText: string) => void;
    onChange: (value: string) => void;
};

export const FunctionsPage = ({
    isLoading,
    functionInfo,
    setFilterText,
    onChange
}: FunctionsPageProps) => {
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

    const sortedFunctionInfo = useMemo(() => {
        if (!functionInfo || Object.keys(functionInfo).length === 0) {
            return [];
        }

        // Sort the items in each group
        const functionInfoArrayWithSortedItems = [];
        for (const [group, groupInfo] of Object.entries(functionInfo)) {
            const sortedItems = groupInfo.items.sort((a, b) => a.label.localeCompare(b.label));
            functionInfoArrayWithSortedItems.push({
                group,
                ...groupInfo,
                items: sortedItems
            });
        }

        // Sort the groups
        const sortedFunctionInfo = functionInfoArrayWithSortedItems.sort((a, b) => a.group.localeCompare(b.group));

        return sortedFunctionInfo;
    }, [functionInfo]);

    const handleFunctionItemClick = (insertText: string) => {
        const functionName = insertText.split('(')[0];
        onChange(`${functionName}(`);
    }

    return (
        <>
            <HelperPane.Header
                searchValue={searchValue}
                onSearch={handleSearch}
            />
            <HelperPane.Body loading={isLoading}>
                {sortedFunctionInfo.map(({ group, items }) => (
                    <HelperPane.Section title={group}>
                        {items.map((fn) => (
                            <HelperPane.CompletionItem
                                label={fn.label}
                                onClick={() => handleFunctionItemClick(fn.insertText)}
                                getIcon={() => getIcon(COMPLETION_ITEM_KIND.Function)}
                            />
                        ))}
                    </HelperPane.Section>
                ))}
            </HelperPane.Body>
        </>
    );
};
