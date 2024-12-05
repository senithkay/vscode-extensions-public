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

export type HelperPaneProps = {
    onClose: () => void;
};

const HelperPaneEl = ({ onClose }: HelperPaneProps) => {
    const [currentPage, setCurrentPage] = useState<number>(0);

    return (
        <HelperPane>
            {currentPage === 0 && <CategoryPage setCurrentPage={setCurrentPage} onClose={onClose} />}
            {currentPage === 1 && <VariablesPage setCurrentPage={setCurrentPage} onClose={onClose} />}
            {currentPage === 2 && <FunctionsPage setCurrentPage={setCurrentPage} onClose={onClose} />}
            {currentPage === 3 && <ConfigurablePage setCurrentPage={setCurrentPage} onClose={onClose} />}
            {currentPage === 4 && <LibraryBrowser onClose={() => setCurrentPage(2)} />}
        </HelperPane>
    );
};

export const getHelperPane = (onClose: () => void) => {
    return <HelperPaneEl onClose={onClose} />;
};
