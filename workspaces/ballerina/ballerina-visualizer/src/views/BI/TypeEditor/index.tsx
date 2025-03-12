/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { useCallback, useEffect, useState } from 'react';
import { debounce } from 'lodash';
import { LineRange, Type } from '@wso2-enterprise/ballerina-core';
import { useRpcContext } from '@wso2-enterprise/ballerina-rpc-client';
import { TypeEditor, TypeHelperCategory, TypeHelperItem, TypeHelperOperator } from '@wso2-enterprise/type-editor';
import { TYPE_HELPER_OPERATORS } from './constants';
import { filterOperators, filterTypes, getTypeBrowserTypes, getTypes } from './utils';

type FormTypeEditorProps = {
    type?: Type;
    onTypeChange: (type: Type) => void;
    newType: boolean;
    isGraphql?: boolean;
};

export const FormTypeEditor = (props: FormTypeEditorProps) => {
    const { type, onTypeChange, newType, isGraphql } = props;
    const { rpcClient } = useRpcContext();

    const [filePath, setFilePath] = useState<string | undefined>(undefined);
    const [targetLineRange, setTargetLineRange] = useState<LineRange | undefined>(undefined);

    const [loading, setLoading] = useState<boolean>(false);
    const [loadingTypeBrowser, setLoadingTypeBrowser] = useState<boolean>(false);

    const [basicTypes, setBasicTypes] = useState<TypeHelperCategory[] | undefined>(undefined);
    const [filteredBasicTypes, setFilteredBasicTypes] = useState<TypeHelperCategory[]>([]);
    const [filteredOperators, setFilteredOperators] = useState<TypeHelperOperator[]>([]);
    const [filteredTypeBrowserTypes, setFilteredTypeBrowserTypes] = useState<TypeHelperCategory[]>([]);

    useEffect(() => {
        if (rpcClient) {
            rpcClient.getVisualizerLocation().then((machineView) => {
                setFilePath(machineView.metadata.recordFilePath);
                rpcClient
                    .getBIDiagramRpcClient()
                    .getEndOfFile({
                        filePath: machineView.metadata.recordFilePath
                    })
                    .then((linePosition) => {
                        setTargetLineRange({
                            startLine: linePosition,
                            endLine: linePosition
                        });
                    });
            });
        }
    }, [rpcClient]);

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
                rpcClient
                    .getBIDiagramRpcClient()
                    .search({
                        filePath: filePath,
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
        // TODO: Implement this onces the LS API is ready
        console.log(item);
    };

    return (
        <>
            {filePath && targetLineRange && (
                <TypeEditor
                    type={type}
                    rpcClient={rpcClient}
                    onTypeChange={onTypeChange}
                    newType={newType}
                    isGraphql={isGraphql}
                    typeHelper={{
                        loading,
                        loadingTypeBrowser,
                        basicTypes: filteredBasicTypes,
                        operators: filteredOperators,
                        typeBrowserTypes: filteredTypeBrowserTypes,
                        onSearchTypeHelper: handleSearchTypeHelper,
                        onSearchTypeBrowser: handleSearchTypeBrowser,
                        onTypeItemClick: handleTypeItemClick
                    }}
                />
            )}
        </>
    );
};
