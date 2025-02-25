/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { debounce } from "lodash";
import { useCallback, useEffect, useRef, useState } from "react";
import { LineRange } from "@wso2-enterprise/ballerina-core";
import { HelperPaneVariableInfo } from "@wso2-enterprise/ballerina-side-panel";
import { COMPLETION_ITEM_KIND, getIcon, HelperPane } from "@wso2-enterprise/ui-toolkit";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import { convertToHelperPaneVariable, filterHelperPaneVariables } from "../../../utils/bi";

type SuggestionsPageProps = {
    fileName: string;
    targetLineRange: LineRange;
    onChange: (value: string) => void;
};

export const SuggestionsPage = ({ fileName, targetLineRange, onChange }: SuggestionsPageProps) => {
    const { rpcClient } = useRpcContext();
    const firstRender = useRef<boolean>(true);
    const [searchValue, setSearchValue] = useState<string>("");
    const [variableInfo, setVariableInfo] = useState<HelperPaneVariableInfo | undefined>(undefined);
    const [filteredVariableInfo, setFilteredVariableInfo] = useState<HelperPaneVariableInfo | undefined>(undefined);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const getVariableInfo = useCallback(() => {
        setIsLoading(true);
        setTimeout(() => {
            rpcClient
                .getBIDiagramRpcClient()
                .getVisibleVariableTypes({
                    filePath: fileName,
                    position: {
                        line: targetLineRange.startLine.line,
                        offset: targetLineRange.startLine.offset,
                    },
                })
                .then((response) => {
                    if (response.categories?.length) {
                        const convertedHelperPaneVariable = convertToHelperPaneVariable(response.categories);
                        setVariableInfo(convertedHelperPaneVariable);
                        setFilteredVariableInfo(convertedHelperPaneVariable);
                    }
                })
                .then(() => setIsLoading(false));
        }, 1100)
    }, [rpcClient, fileName, targetLineRange]);

    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            getVariableInfo();
        }
    }, []);

    const debounceFilterVariables = useCallback(
        debounce((searchText: string) => {
            setFilteredVariableInfo(filterHelperPaneVariables(variableInfo, searchText));
            setIsLoading(false);
        }, 1100),
        [variableInfo, setFilteredVariableInfo, setIsLoading, filterHelperPaneVariables]
    );

    const handleSearch = (searchText: string) => {
        setSearchValue(searchText);
        setIsLoading(true);
        debounceFilterVariables(searchText);
    };

    return (
        <>
            <HelperPane.Header
                searchValue={searchValue}
                onSearch={handleSearch}
                titleSx={{ fontFamily: "GilmerRegular" }}
            />
            <HelperPane.Body loading={isLoading}>
                {filteredVariableInfo?.category.map((category) => (
                    <HelperPane.Section
                        title={category.label}
                        titleSx={{ fontFamily: "GilmerMedium" }}
                    >
                        {category.items.map((item) => (
                            <HelperPane.CompletionItem
                                key={`${category.label}-${item.label}`}
                                label={item.label}
                                type={item.type}
                                onClick={() => onChange(item.label)}
                                getIcon={() => getIcon(COMPLETION_ITEM_KIND.Variable)}
                            />
                        ))}
                    </HelperPane.Section>
                ))}
            </HelperPane.Body>
        </>
    );
};
