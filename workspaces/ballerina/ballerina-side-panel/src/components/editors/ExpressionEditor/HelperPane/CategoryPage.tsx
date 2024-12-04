/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from 'react';
import { HelperPane } from '@wso2-enterprise/ui-toolkit';

type CategoryPageProps = {
    setCurrentPage: (page: number) => void;
    onClose: () => void;
};

export const CategoryPage = ({ setCurrentPage, onClose }: CategoryPageProps) => {
    return (
        <>
            <HelperPane.Header title="Select Category" onClose={onClose} />
            <HelperPane.Body>
                <HelperPane.CategoryItem label="Variables" onClick={() => setCurrentPage(1)} />
                <HelperPane.CategoryItem label="Functions" onClick={() => setCurrentPage(2)} />
                <HelperPane.CategoryItem label="Configurables" onClick={() => setCurrentPage(3)} />
            </HelperPane.Body>
        </>
    );
};
