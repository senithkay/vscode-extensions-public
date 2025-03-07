/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { HelperPaneHeight } from "@wso2-enterprise/ui-toolkit";

import { RefObject } from 'react';

import { debounce } from 'lodash';
import { useCallback, useState } from 'react';
import { LineRange } from '@wso2-enterprise/ballerina-core';
import {
    TypeHelperCategory,
    TypeHelperComponent,
    TypeHelperItem,
    TypeHelperOperator
} from '@wso2-enterprise/type-editor';
import { useRpcContext } from '@wso2-enterprise/ballerina-rpc-client';
import { filterOperators, filterTypes, getTypeBrowserTypes, getTypes } from '../TypeEditor/utils';
import { TYPE_HELPER_OPERATORS } from '../TypeEditor/constants';

type TypeHelperProps = {
    typeBrowserRef: RefObject<HTMLDivElement>;
    filePath: string;
    targetLineRange: LineRange;
    currentType: string;
    currentCursorPosition: number;
    helperPaneHeight: HelperPaneHeight;
    onChange: (newType: string, newCursorPosition: number) => void;
    changeTypeHelperState: (isOpen: boolean) => void;
};

const TypeHelperEl = (props: TypeHelperProps) => {
    const {
        filePath,
        targetLineRange,
        currentType,
        currentCursorPosition,
        helperPaneHeight,
        onChange,
        changeTypeHelperState,
        typeBrowserRef
    } = props;

    const { rpcClient } = useRpcContext();

    const [loading, setLoading] = useState<boolean>(false);
    const [loadingTypeBrowser, setLoadingTypeBrowser] = useState<boolean>(false);

    const [basicTypes, setBasicTypes] = useState<TypeHelperCategory[] | undefined>(undefined);
    const [filteredBasicTypes, setFilteredBasicTypes] = useState<TypeHelperCategory[]>([]);
    const [filteredOperators, setFilteredOperators] = useState<TypeHelperOperator[]>([]);
    const [filteredTypeBrowserTypes, setFilteredTypeBrowserTypes] = useState<TypeHelperCategory[]>([]);

    const debouncedSearchTypeHelper = useCallback(
        debounce((searchText: string, isType: boolean) => {
            if (isType && basicTypes === undefined) {
                if (rpcClient) {
                    rpcClient
                        .getBIDiagramRpcClient()
                        .getVisibleTypes({
                            filePath: filePath,
                            position: {
                                line: targetLineRange.startLine.line,
                                offset: targetLineRange.startLine.offset
                            }
                        })
                        .then((types) => {
                            setBasicTypes(getTypes(types));
                            setFilteredBasicTypes(getTypes(types));
                        })
                        .finally(() => {
                            setLoading(false);
                        });
                }
            } else if (isType) {
                setFilteredBasicTypes(filterTypes(basicTypes, searchText));
            } else {
                setFilteredOperators(filterOperators(TYPE_HELPER_OPERATORS, searchText));
            }

            setLoading(false);
        }, 150),
        [basicTypes, filePath, targetLineRange]
    );

    const handleSearchTypeHelper = useCallback(
        (searchText: string, isType: boolean) => {
            setLoading(true);
            debouncedSearchTypeHelper(searchText, isType);
        },
        [debouncedSearchTypeHelper, basicTypes]
    );

    const debouncedSearchTypeBrowser = useCallback(
        debounce((searchText: string) => {
            if (rpcClient) {
                setLoadingTypeBrowser(true);
                rpcClient.getVisualizerLocation().then((machineView) => {
                    rpcClient
                        .getBIDiagramRpcClient()
                        .search({
                            filePath: machineView.metadata.recordFilePath,
                            position: targetLineRange,
                            queryMap: {
                                q: searchText,
                                offset: 0,
                                limit: 60
                            },
                            searchKind: 'TYPE'
                        })
                        .then((response) => {
                            setFilteredTypeBrowserTypes(getTypeBrowserTypes(response.categories));
                        })
                        .finally(() => {
                            setLoadingTypeBrowser(false);
                        });
                });
            }
        }, 150),
        [filteredTypeBrowserTypes]
    );

    const handleSearchTypeBrowser = useCallback(
        (searchText: string) => {
            setLoadingTypeBrowser(true);
            debouncedSearchTypeBrowser(searchText);
        },
        [debouncedSearchTypeBrowser, filteredTypeBrowserTypes]
    );

    const handleTypeItemClick = (item: TypeHelperItem) => {
        console.log(item);
    };

    const handleTypeHelperClose = () => {
        changeTypeHelperState(false);
    };

    return (
        <TypeHelperComponent
            currentType={currentType}
            currentCursorPosition={currentCursorPosition}
            loading={loading}
            loadingTypeBrowser={loadingTypeBrowser}
            basicTypes={filteredBasicTypes}
            operators={filteredOperators}
            typeBrowserTypes={filteredTypeBrowserTypes}
            typeBrowserRef={typeBrowserRef}
            typeHelperHeight={helperPaneHeight}
            onChange={onChange}
            onSearchTypeHelper={handleSearchTypeHelper}
            onSearchTypeBrowser={handleSearchTypeBrowser}
            onTypeItemClick={handleTypeItemClick}
            onClose={handleTypeHelperClose}
        />
    );
};

export const getTypeHelper = (
    typeBrowserRef: RefObject<HTMLDivElement>,
    filePath: string,
    targetLineRange: LineRange,
    currentType: string,
    currentCursorPosition: number,
    helperPaneHeight: HelperPaneHeight,
    onChange: (newType: string, newCursorPosition: number) => void,
    changeTypeHelperState: (isOpen: boolean) => void
) => {
    return (
        <TypeHelperEl
            typeBrowserRef={typeBrowserRef}
            filePath={filePath}
            targetLineRange={targetLineRange}
            currentType={currentType}
            currentCursorPosition={currentCursorPosition}
            helperPaneHeight={helperPaneHeight}
            onChange={onChange}
            changeTypeHelperState={changeTypeHelperState}
        />
    );
};
