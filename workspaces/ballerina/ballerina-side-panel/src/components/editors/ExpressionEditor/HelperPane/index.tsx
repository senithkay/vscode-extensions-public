/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useState } from 'react';
import { HelperPaneData, HelperPaneFunctionInfo, HelperPaneVariableInfo } from '@wso2-enterprise/ballerina-core';
import { HelperPane } from '@wso2-enterprise/ui-toolkit';
import { CategoryPage } from './CategoryPage';
import { ConfigurablePage } from './ConfigurablePage';
import { FunctionsPage } from './FunctionsPage';
import { LibraryBrowser } from './LibraryBrowser';
import { VariablesPage } from './VariablesPage';

export type HelperPaneProps = {
    helperPaneData: HelperPaneData;
    onClose: () => void;
    setFilterText: (type: string, filterText: string) => void;
};

const HelperPaneEl = ({ helperPaneData, onClose, setFilterText }: HelperPaneProps) => {
    const [currentPage, setCurrentPage] = useState<number>(0);

    return (
        <HelperPane>
            {currentPage === 0 && <CategoryPage setCurrentPage={setCurrentPage} onClose={onClose} />}
            {currentPage === 1 && (
                <VariablesPage
                    variableInfo={helperPaneData as HelperPaneVariableInfo}
                    setCurrentPage={setCurrentPage}
                    setFilterText={(filterText) => setFilterText('variables', filterText)}
                    onClose={onClose}
                />
            )}
            {currentPage === 2 && (
                <FunctionsPage
                    functionInfo={helperPaneData as HelperPaneFunctionInfo}
                    setCurrentPage={setCurrentPage}
                    setFilterText={(filterText) => setFilterText('functions', filterText)}
                    onClose={onClose}
                />
            )}
            {currentPage === 3 && (
                <ConfigurablePage
                    setCurrentPage={setCurrentPage}
                    setFilterText={(filterText) => setFilterText('configurable', filterText)}
                    onClose={onClose}
                />
            )}
            {currentPage === 4 && (
                <LibraryBrowser
                    setFilterText={(filterText) => setFilterText('library', filterText)}
                    onClose={() => setCurrentPage(2)}
                />
            )}
        </HelperPane>
    );
};

export const getHelperPane = (
    helperPaneData: HelperPaneData,
    onClose: () => void,
    setFilterText: (type: string, filterText: string) => void
) => {
    return <HelperPaneEl helperPaneData={helperPaneData} onClose={onClose} setFilterText={setFilterText} />;
};
