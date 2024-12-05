/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { COMPLETION_ITEM_KIND, getIcon, HelperPane } from '@wso2-enterprise/ui-toolkit';
import React, { useState } from 'react';

type LibraryBrowserProps = {
    onClose: () => void;
};

export const LibraryBrowser = ({ onClose }: LibraryBrowserProps) => {
    const [searchValue, setSearchValue] = useState<string>('');

    return (
        <HelperPane.LibraryBrowser searchValue={searchValue} onSearch={setSearchValue} onClose={onClose}>
            <HelperPane.LibraryBrowserSection title="Variables">
                <HelperPane.LibraryBrowserSubSection title="Scope Variables" columns={4}>
                    <HelperPane.CompletionItem
                        label="sample"
                        type="string"
                        getIcon={() => getIcon(COMPLETION_ITEM_KIND.Variable)}
                        onClick={() => {}}
                    />
                    <HelperPane.CompletionItem
                        label="sample1"
                        type="string"
                        getIcon={() => getIcon(COMPLETION_ITEM_KIND.Variable)}
                        onClick={() => {}}
                    />
                    <HelperPane.CompletionItem
                        label="sample"
                        type="string"
                        getIcon={() => getIcon(COMPLETION_ITEM_KIND.Variable)}
                        onClick={() => {}}
                    />
                    <HelperPane.CompletionItem
                        label="sample1"
                        type="string"
                        getIcon={() => getIcon(COMPLETION_ITEM_KIND.Variable)}
                        onClick={() => {}}
                    />
                </HelperPane.LibraryBrowserSubSection>
            </HelperPane.LibraryBrowserSection>
        </HelperPane.LibraryBrowser>
    );
};
