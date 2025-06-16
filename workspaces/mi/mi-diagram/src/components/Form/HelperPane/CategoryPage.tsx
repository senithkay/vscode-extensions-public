/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from 'react';
import { Position } from 'vscode-languageserver-types';
import { Divider, HelperPane } from '@wso2-enterprise/ui-toolkit';
import { FunctionsPage } from './FunctionsPage';
import { ConfigsPage } from './ConfigsPage';
import { PAGE, Page } from './index';

type PanelPageProps = {
    setCurrentPage: (page: Page) => void;
};

type CategoryPageProps = {
    position: Position;
    setCurrentPage: (page: Page) => void;
    onClose: () => void;
    onChange: (value: string) => void;
    addFunction?: (value: string) => void;
};

const DataPanel = ({ setCurrentPage }: PanelPageProps) => {
    return (
        <>
            <HelperPane.CategoryItem label="Payload" onClick={() => setCurrentPage(PAGE.PAYLOAD)} />
            <HelperPane.CategoryItem label="Variables" onClick={() => setCurrentPage(PAGE.VARIABLES)} />
            <HelperPane.CategoryItem label="Headers" onClick={() => setCurrentPage(PAGE.HEADERS)} />
            <Divider />
            <HelperPane.CategoryItem label="Params" onClick={() => setCurrentPage(PAGE.PARAMS)} />
            <HelperPane.CategoryItem label="Properties" onClick={() => setCurrentPage(PAGE.PROPERTIES)} />
        </>
    );
};

export const CategoryPage = ({
    position,
    setCurrentPage,
    onChange,
    addFunction
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
                        <FunctionsPage position={position} onChange={onChange} addFunction={addFunction} />
                    </HelperPane.PanelView>
                    <HelperPane.PanelView id={2}>
                        <ConfigsPage position={position} onChange={onChange} />
                    </HelperPane.PanelView>
                </HelperPane.Panels>
            </HelperPane.Body>
        </>
    );
};
