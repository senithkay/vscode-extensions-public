/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useState } from 'react';
import { HelperPane } from '@wso2-enterprise/ui-toolkit';
import { CategoryPage } from './CategoryPage';
import { ConfigurablePage } from './ConfigurablePage';
import { FunctionsPage } from './FunctionsPage';
import { LibraryBrowser } from './LibraryBrowser';
import { VariablesPage } from './VariablesPage';
import { HelperPaneFunctionInfo } from '../../../Form/types';
import { HelperPaneVariableInfo } from '../../../Form/types';
import { HelperPaneData } from '../../../Form/types';

export type HelperPaneProps = {
    isLoadingHelperPaneInfo: boolean;
    variableInfo: HelperPaneData;
    functionInfo: HelperPaneData;
    libraryBrowserInfo: HelperPaneData;
    onClose: () => void;
    setFilterText: (type: string, filterText: string) => void;
    onChange: (value: string) => void;
};

const HelperPaneEl = ({
    isLoadingHelperPaneInfo,
    variableInfo,
    functionInfo,
    libraryBrowserInfo,
    onClose,
    setFilterText,
    onChange
}: HelperPaneProps) => {
    const [currentPage, setCurrentPage] = useState<number>(0);

    return (
        <HelperPane>
            {currentPage === 0 && <CategoryPage setCurrentPage={setCurrentPage} onClose={onClose} />}
            {currentPage === 1 && (
                <VariablesPage
                    isLoading={isLoadingHelperPaneInfo}
                    variableInfo={variableInfo as HelperPaneVariableInfo}
                    setCurrentPage={setCurrentPage}
                    setFilterText={(filterText) => setFilterText('variables', filterText)}
                    onClose={onClose}
                    onChange={onChange}
                />
            )}
            {currentPage === 2 && (
                <FunctionsPage
                    isLoading={isLoadingHelperPaneInfo}
                    functionInfo={functionInfo as HelperPaneFunctionInfo}
                    setCurrentPage={setCurrentPage}
                    setFilterText={(filterText) => setFilterText('functions', filterText)}
                    onClose={onClose}
                    onChange={onChange}
                />
            )}
            {/* {currentPage === 3 && (
                <ConfigurablePage
                    setCurrentPage={setCurrentPage}
                    setFilterText={(filterText) => setFilterText('configurable', filterText)}
                    onClose={onClose}
                />
            )} */}
            {currentPage === 4 && (
                <LibraryBrowser
                    isLoading={isLoadingHelperPaneInfo}
                    libraryBrowserInfo={libraryBrowserInfo as HelperPaneFunctionInfo}
                    setFilterText={(filterText) => setFilterText('libraries', filterText)}
                    onBack={() => setCurrentPage(2)}
                    onClose={onClose}
                    onChange={onChange}
                />
            )}
        </HelperPane>
    );
};

export const getHelperPane = (
    isLoadingHelperPaneInfo: boolean,
    variableInfo: HelperPaneData,
    functionInfo: HelperPaneData,
    libraryBrowserInfo: HelperPaneData,
    onClose: () => void,
    setFilterText: (type: string, filterText: string) => void,
    onChange: (value: string) => void
) => {
    return (
        <HelperPaneEl
            isLoadingHelperPaneInfo={isLoadingHelperPaneInfo}
            variableInfo={variableInfo}
            libraryBrowserInfo={libraryBrowserInfo}
            functionInfo={functionInfo}
            onClose={onClose}
            setFilterText={setFilterText}
            onChange={onChange}
        />
    );
};
