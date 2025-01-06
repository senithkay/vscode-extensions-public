/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useRef, useState } from 'react';
import { Codicon, COMPLETION_ITEM_KIND, getIcon, HelperPane } from '@wso2-enterprise/ui-toolkit';
import { HelperPaneFunctionInfo } from '../../../Form/types';
import { LibraryBrowser } from './LibraryBrowser';

type FunctionsPageProps = {
    isLoading: boolean;
    functionInfo: HelperPaneFunctionInfo;
    libraryBrowserInfo: HelperPaneFunctionInfo;
    setCurrentPage: (page: number) => void;
    setFunctionFilterText: (filterText: string) => void;
    setLibraryFilterText: (filterText: string) => void;
    onClose: () => void;
    onChange: (value: string) => void;
};

export const FunctionsPage = ({
    isLoading,
    functionInfo,
    libraryBrowserInfo,
    setCurrentPage,
    setFunctionFilterText,
    setLibraryFilterText,
    onClose,
    onChange
}: FunctionsPageProps) => {
    const firstRender = useRef<boolean>(true);
    const [searchValue, setSearchValue] = useState<string>('');
    const [isLibraryBrowserOpen, setIsLibraryBrowserOpen] = useState<boolean>(false);

    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            setFunctionFilterText('');
        }
    }, []);

    const handleFunctionSearch = (searchText: string) => {
        setFunctionFilterText(searchText);
        setSearchValue(searchText);
    };

    return (
        <>
            <HelperPane.Header
                title="Functions"
                onBack={() => setCurrentPage(0)}
                onClose={onClose}
                searchValue={searchValue}
                onSearch={handleFunctionSearch}
            />
            <HelperPane.Body isLoading={!isLibraryBrowserOpen && isLoading}>
                {functionInfo?.category.map((category) => (
                    <HelperPane.Section
                        title={category.label}
                        {...(category.label === 'Current Integration' && {
                            collapsible: true,
                            defaultCollapsed: true,
                            columns: 2,
                            collapsedItemsCount: 6
                        })}
                    >
                        {category.items?.map((item) => (
                            <HelperPane.CompletionItem
                                label={item.label}
                                type={item.type}
                                onClick={() => onChange(`${item.label}(`)}
                                getIcon={() => getIcon(COMPLETION_ITEM_KIND.Function)}
                            />
                        ))}
                        {category.subCategory?.map((subCategory) => (
                            <HelperPane.SubSection
                                title={subCategory.label}
                                collapsible
                                defaultCollapsed
                                columns={2}
                                collapsedItemsCount={6}
                            >
                                {subCategory.items?.map((item) => (
                                    <HelperPane.CompletionItem
                                        label={item.label}
                                        onClick={() => onChange(`${item.label}(`)}
                                        getIcon={() => getIcon(COMPLETION_ITEM_KIND.Function)}
                                    />
                                ))}
                            </HelperPane.SubSection>
                        ))}
                    </HelperPane.Section>
                ))}
            </HelperPane.Body>
            <HelperPane.Footer>
                <HelperPane.IconButton
                    title="Open library browser"
                    getIcon={() => <Codicon name="library" />}
                    onClick={() => setIsLibraryBrowserOpen(true)}
                />
            </HelperPane.Footer>
            {isLibraryBrowserOpen && (
                <LibraryBrowser
                    isLoading={isLoading}
                    libraryBrowserInfo={libraryBrowserInfo as HelperPaneFunctionInfo}
                    setFilterText={setLibraryFilterText}
                    onBack={() => setIsLibraryBrowserOpen(false)}
                    onClose={onClose}
                    onChange={onChange}
                />
            )}
        </>
    );
};
