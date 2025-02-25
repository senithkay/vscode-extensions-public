/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { Codicon, COMPLETION_ITEM_KIND, getIcon, HelperPane } from "@wso2-enterprise/ui-toolkit";
import { LibraryBrowser } from "./LibraryBrowser";
import { HelperPaneCompletionItem, HelperPaneFunctionInfo } from "@wso2-enterprise/ballerina-side-panel";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import { LineRange, FunctionKind } from "@wso2-enterprise/ballerina-core";
import { convertToHelperPaneFunction, extractFunctionInsertText } from "../../../utils/bi";
import { debounce } from "lodash";

type FunctionsPageProps = {
    fileName: string;
    targetLineRange: LineRange;
    onClose: () => void;
    onChange: (value: string) => void;
};

export const FunctionsPage = ({ fileName, targetLineRange, onClose, onChange }: FunctionsPageProps) => {
    const { rpcClient } = useRpcContext();
    const firstRender = useRef<boolean>(true);
    const [searchValue, setSearchValue] = useState<string>("");
    const [isLibraryBrowserOpen, setIsLibraryBrowserOpen] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [functionInfo, setFunctionInfo] = useState<HelperPaneFunctionInfo | undefined>(undefined);
    const [libraryBrowserInfo, setLibraryBrowserInfo] = useState<HelperPaneFunctionInfo | undefined>(undefined);

    const debounceFetchFunctionInfo = useCallback(
        debounce((searchText: string, includeAvailableFunctions?: string) => {
            rpcClient
                .getBIDiagramRpcClient()
                .getFunctions({
                    position: targetLineRange,
                    filePath: fileName,
                    queryMap: {
                        q: searchText.trim(),
                        limit: 12,
                        offset: 0,
                        ...(!!includeAvailableFunctions && { includeAvailableFunctions }),
                    },
                })
                .then((response) => {
                    if (response.categories?.length) {
                        if (!!includeAvailableFunctions) {
                            setLibraryBrowserInfo(convertToHelperPaneFunction(response.categories));
                        } else {
                            setFunctionInfo(convertToHelperPaneFunction(response.categories));
                        }
                    }
                })
                .then(() => setIsLoading(false));
        }, 1100),
        [rpcClient, fileName, targetLineRange]
    );

    const fetchFunctionInfo = useCallback(
        (searchText: string, includeAvailableFunctions?: string) => {
            setIsLoading(true);
            debounceFetchFunctionInfo(searchText, includeAvailableFunctions);
        },
        [debounceFetchFunctionInfo, searchValue]
    );

    const onFunctionItemSelect = async (item: HelperPaneCompletionItem) => {
        const response = await rpcClient.getBIDiagramRpcClient().addFunction({
            filePath: fileName,
            codedata: item.codedata,
            kind: item.kind as FunctionKind,
        });

        if (response.template) {
            return extractFunctionInsertText(response.template);
        }

        return "";
    };

    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            fetchFunctionInfo("");
        }
    }, []);

    const handleFunctionSearch = (searchText: string) => {
        setSearchValue(searchText);

        // Search functions
        if (isLibraryBrowserOpen) {
            fetchFunctionInfo(searchText, "true");
        } else {
            fetchFunctionInfo(searchText);
        }
    };

    const handleFunctionItemSelect = async (item: HelperPaneCompletionItem) => {
        const insertText = await onFunctionItemSelect(item);
        onChange(insertText);
        onClose();
    };

    const getCurrentIntegrationFunctions = useCallback(() => {
        const currentIntegrationFunctions = functionInfo?.category.filter(
            (category) => category.label === "Current Integration"
        );

        if (!currentIntegrationFunctions?.[0].items?.length) {
            return undefined;
        }

        return (
            <>
                {currentIntegrationFunctions[0].items.map((item) => (
                    <HelperPane.CompletionItem
                        key={`current-${item.label}`}
                        label={item.label}
                        type={item.type}
                        onClick={async () => await handleFunctionItemSelect(item)}
                        getIcon={() => getIcon(COMPLETION_ITEM_KIND.Function)}
                    />
                ))}
            </>
        );
    }, [functionInfo, handleFunctionItemSelect, getIcon]);

    const getImportedFunctions = useCallback(() => {
        const importedFunctions = functionInfo?.category.filter(
            (category) => category.label === "Imported Functions"
        );

        if (!importedFunctions?.[0].subCategory?.length) {
            return undefined;
        }

        return (
            <>
                {importedFunctions[0].subCategory.map((subCategory) => (
                    <HelperPane.SubSection
                        key={`imported-${subCategory.label}`}
                        title={subCategory.label}
                        collapsible
                        defaultCollapsed
                        columns={2}
                        collapsedItemsCount={6}
                    >
                        {subCategory.items?.map((item) => (
                            <HelperPane.CompletionItem
                                key={`imported-${subCategory.label}-${item.label}`}
                                label={item.label}
                                onClick={async () => await handleFunctionItemSelect(item)}
                                getIcon={() => getIcon(COMPLETION_ITEM_KIND.Function)}
                            />
                        ))}
                </HelperPane.SubSection>
                ))}
            </>
        );
    }, [functionInfo, handleFunctionItemSelect, getIcon])

    return (
        <>
            <HelperPane.Header
                searchValue={searchValue}
                onSearch={handleFunctionSearch}
                titleSx={{ fontFamily: "GilmerRegular" }}
            />
            <HelperPane.Body>
                <HelperPane.Section
                    title="Current Integration"
                    collapsible
                    defaultCollapsed
                    columns={2}
                    collapsedItemsCount={6}
                    loading={isLoading}
                    titleSx={{ fontFamily: "GilmerMedium" }}
                >
                    {getCurrentIntegrationFunctions()}
                </HelperPane.Section>
                <HelperPane.Section
                    title="Imported Functions"
                    loading={isLoading}
                    titleSx={{ fontFamily: "GilmerMedium" }}
                >
                    {getImportedFunctions()}
                </HelperPane.Section>
            </HelperPane.Body>
            <HelperPane.Footer>
                <HelperPane.IconButton
                    title="Open library browser"
                    getIcon={() => <Codicon name="library" />}
                    onClick={() => setIsLibraryBrowserOpen(true)}
                />
            </HelperPane.Footer>
            {isLibraryBrowserOpen && (
                <LibraryBrowser
                    isLoading={isLoading}
                    libraryBrowserInfo={libraryBrowserInfo as HelperPaneFunctionInfo}
                    setFilterText={handleFunctionSearch}
                    onBack={() => setIsLibraryBrowserOpen(false)}
                    onClose={onClose}
                    onChange={onChange}
                    onFunctionItemSelect={onFunctionItemSelect}
                />
            )}
        </>
    );
};
