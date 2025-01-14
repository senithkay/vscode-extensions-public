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
import { HelperPaneCompletionItem, HelperPaneFunctionInfo } from '../../../Form/types';
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
    onFunctionItemSelect: (item: HelperPaneCompletionItem) => Promise<string>;
};

export const FunctionsPage = ({
    isLoading,
    functionInfo,
    libraryBrowserInfo,
    setCurrentPage,
    setFunctionFilterText,
    setLibraryFilterText,
    onClose,
    onChange,
    onFunctionItemSelect
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

    const handleFunctionItemSelect = async (item: HelperPaneCompletionItem) => {
        const insertText = await onFunctionItemSelect(item);
        onChange(insertText);
        onClose();
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
                        key={category.label}
                        title={category.label}
                        {...(category.items?.length > 0 && category.subCategory?.length === 0 && {
                            collapsible: true,
                            defaultCollapsed: true,
                            columns: 2,
                            collapsedItemsCount: 6
                        })}
                    >
                        {category.items?.map((item) => (
                            <HelperPane.CompletionItem
                                key={`${category.label}-${item.label}`}
                                label={item.label}
                                type={item.type}
                                onClick={async () => await handleFunctionItemSelect(item)}
                                getIcon={() => getIcon(COMPLETION_ITEM_KIND.Function)}
                            />
                        ))}
                        {category.subCategory?.map((subCategory) => (
                            <HelperPane.SubSection
                                key={`${category.label}-${subCategory.label}`}
                                title={subCategory.label}
                                collapsible
                                defaultCollapsed
                                columns={2}
                                collapsedItemsCount={6}
                            >
                                {subCategory.items?.map((item) => (
                                    <HelperPane.CompletionItem
                                        key={`${category.label}-${subCategory.label}-${item.label}`}
                                        label={item.label}
                                        onClick={async () => await handleFunctionItemSelect(item)}
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
                    onFunctionItemSelect={onFunctionItemSelect}
                />
            )}
        </>
    );
};
