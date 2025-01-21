/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from 'react';
import { Divider, HelperPane } from '@wso2-enterprise/ui-toolkit';
import { HelperPaneCompletionItem, HelperPaneFunctionInfo } from '@wso2-enterprise/mi-core';
import { FunctionsPage } from './FunctionsPage';
import { ConfigsPage } from './ConfigsPage';

type PanelPageProps = {
    setCurrentPage: (page: number) => void;
};

type CategoryPageProps = {
    isLoading: boolean;
    functionInfo: HelperPaneFunctionInfo;
    configInfo: HelperPaneCompletionItem[];
    setCurrentPage: (page: number) => void;
    setFilterText: (type: string, filterText: string) => void;
    onClose: () => void;
    onChange: (value: string) => void;
};

const DataPanel = ({ setCurrentPage }: PanelPageProps) => {
    return (
        <>
            <HelperPane.CategoryItem label="Payload" onClick={() => setCurrentPage(1)} />
            <HelperPane.CategoryItem label="Variables" onClick={() => setCurrentPage(2)} />
            <HelperPane.CategoryItem label="Headers" onClick={() => setCurrentPage(3)} />
            <Divider />
            <HelperPane.CategoryItem label="Params" onClick={() => setCurrentPage(4)} />
            <HelperPane.CategoryItem label="Properties" onClick={() => setCurrentPage(5)} />
        </>
    );
};

export const CategoryPage = ({
    isLoading,
    functionInfo,
    configInfo,
    setCurrentPage,
    setFilterText,
    onChange
}: CategoryPageProps) => {
    return (
        <>
            <HelperPane.Body>
                <HelperPane.Panels>
                    <HelperPane.PanelTab id={0} title="Data" />
                    <HelperPane.PanelTab id={1} title="Functions" />
                    <HelperPane.PanelTab id={2} title="Configs" />
                    <HelperPane.PanelView id={0}>
                        <DataPanel setCurrentPage={setCurrentPage} />
                    </HelperPane.PanelView>
                    <HelperPane.PanelView id={1}>
                        <FunctionsPage
                            isLoading={isLoading}
                            functionInfo={functionInfo}
                            setFilterText={(filterText) => setFilterText('functions', filterText)}
                            onChange={onChange}
                        />
                    </HelperPane.PanelView>
                    <HelperPane.PanelView id={2}>
                        <ConfigsPage
                            isLoading={isLoading}
                            configInfo={configInfo}
                            setFilterText={(filterText) => setFilterText('configs', filterText)}
                            onChange={onChange}
                        />
                    </HelperPane.PanelView>
                </HelperPane.Panels>
            </HelperPane.Body>
        </>
    );
};
