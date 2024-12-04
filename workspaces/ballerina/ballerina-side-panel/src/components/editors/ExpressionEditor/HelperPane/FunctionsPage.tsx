/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useState } from 'react';
import { Codicon, HelperPane } from '@wso2-enterprise/ui-toolkit';

type FunctionsPageProps = {
    setCurrentPage: (page: number) => void;
    onClose: () => void;
};

export const FunctionsPage = ({ setCurrentPage, onClose }: FunctionsPageProps) => {
    const [searchValue, setSearchValue] = useState<string>('');

    return (
        <>
            <HelperPane.Header
                title="Functions"
                onBack={() => setCurrentPage(0)}
                onClose={onClose}
                searchValue={searchValue}
                onSearch={setSearchValue}
            />
            <HelperPane.Body>
                <HelperPane.CategoryItem label="Functions" onClick={() => setCurrentPage(1)} />
            </HelperPane.Body>
            <HelperPane.Footer>
                <HelperPane.IconButton
                    title="Open library browser"
                    getIcon={() => <Codicon name="library" />}
                    onClick={() => {}}
                />
            </HelperPane.Footer>
        </>
    );
};
