/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useState } from 'react';
import { Codicon, COMPLETION_ITEM_KIND, getIcon, HelperPane } from '@wso2-enterprise/ui-toolkit';

type ConfigurablePageProps = {
    setCurrentPage: (page: number) => void;
    onClose: () => void;
};

export const ConfigurablePage = ({ setCurrentPage, onClose }: ConfigurablePageProps) => {
    const [searchValue, setSearchValue] = useState<string>('');

    return (
        <>
            <HelperPane.Header
                title="Configurables"
                onBack={() => setCurrentPage(0)}
                onClose={onClose}
                searchValue={searchValue}
                onSearch={setSearchValue}
            />
            <HelperPane.Body>
                <HelperPane.CompletionItem
                    label="key1"
                    type="string"
                    onClick={() => setCurrentPage(1)}
                    getIcon={() => getIcon(COMPLETION_ITEM_KIND.Variable)}
                />
                <HelperPane.CompletionItem
                    label="key2"
                    type="int"
                    onClick={() => setCurrentPage(1)}
                    getIcon={() => getIcon(COMPLETION_ITEM_KIND.Variable)}
                />
            </HelperPane.Body>
        </>
    );
};
