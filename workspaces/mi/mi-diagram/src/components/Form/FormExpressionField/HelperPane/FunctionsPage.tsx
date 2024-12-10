/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useMemo, useState } from 'react';
import { COMPLETION_ITEM_KIND, getIcon, HelperPane } from '@wso2-enterprise/ui-toolkit';
import { HelperPaneFunctionInfo } from '@wso2-enterprise/mi-core';

type FunctionsPageProps = {
    isLoading: boolean;
    functionInfo: HelperPaneFunctionInfo;
    setCurrentPage: (page: number) => void;
    setFilterText: (filterText: string) => void;
    onClose: () => void;
    onChange: (value: string) => void;
};

export const FunctionsPage = ({
    isLoading,
    functionInfo,
    setCurrentPage,
    setFilterText,
    onClose,
    onChange
}: FunctionsPageProps) => {
    const [searchValue, setSearchValue] = useState<string>('');

    const handleSearch = (searchText: string) => {
        setFilterText(searchText);
        setSearchValue(searchText);
    };

    const sortedFunctionInfo = useMemo(() => {
        if (!functionInfo || Object.keys(functionInfo).length === 0) {
            return {};
        }

        for (const value of Object.values(functionInfo)) {
            value.sort((a, b) => a.label.localeCompare(b.label));
        }

        return functionInfo;
    }, [functionInfo]);

    return (
        <>
            <HelperPane.Header
                title="Functions"
                onBack={() => setCurrentPage(0)}
                onClose={onClose}
                searchValue={searchValue}
                onSearch={handleSearch}
            />
            <HelperPane.Body isLoading={isLoading}>
                {Object.entries(sortedFunctionInfo).map(([group, functions]) => (
                    <HelperPane.Section title={group}>
                        {functions.map((fn) => (
                            <HelperPane.CompletionItem
                                label={fn.label}
                                onClick={() => onChange(fn.insertText)}
                                getIcon={() => getIcon(COMPLETION_ITEM_KIND.Function)}
                            />
                        ))}
                    </HelperPane.Section>
                ))}
            </HelperPane.Body>
        </>
    );
};
