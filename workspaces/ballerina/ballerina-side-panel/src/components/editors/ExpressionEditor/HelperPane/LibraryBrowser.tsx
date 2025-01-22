/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { COMPLETION_ITEM_KIND, getIcon, HelperPane } from '@wso2-enterprise/ui-toolkit';
import React, { useEffect, useRef, useState } from 'react';
import { HelperPaneFunctionInfo } from '../../../Form/types';

type LibraryBrowserProps = {
    isLoading: boolean;
    libraryBrowserInfo: HelperPaneFunctionInfo;
    setFilterText: (filterText: string) => void;
    onBack: () => void;
    onClose: () => void;
    onChange: (value: string) => void;
};

export const LibraryBrowser = ({
    isLoading,
    libraryBrowserInfo,
    setFilterText,
    onBack,
    onClose,
    onChange
}: LibraryBrowserProps) => {
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
        <HelperPane.LibraryBrowser
            loading={isLoading}
            searchValue={searchValue}
            onSearch={handleSearch}
            onClose={onBack}
        >
            {libraryBrowserInfo?.category.map((category) => (
                <HelperPane.LibraryBrowserSection
                    title={category.label}
                    {...(category.label === 'Current Integration' && {
                        columns: 4
                    })}
                >
                    {category.items?.map((item) => (
                        <HelperPane.CompletionItem
                            label={item.label}
                            type={item.type}
                            getIcon={() => getIcon(COMPLETION_ITEM_KIND.Function)}
                            onClick={() => {
                                onChange(`${item.label}(`);
                                onClose();
                            }}
                        />
                    ))}
                    {category.subCategory?.map((subCategory) => (
                        <HelperPane.LibraryBrowserSubSection title={subCategory.label} columns={4}>
                            {subCategory.items?.map((item) => (
                                <HelperPane.CompletionItem
                                    label={item.label}
                                    getIcon={() => getIcon(COMPLETION_ITEM_KIND.Function)}
                                    onClick={() => {
                                        onChange(`${item.label}(`);
                                        onClose();
                                    }}
                                />
                            ))}
                        </HelperPane.LibraryBrowserSubSection>
                    ))}
                </HelperPane.LibraryBrowserSection>
            ))}
        </HelperPane.LibraryBrowser>
    );
};
