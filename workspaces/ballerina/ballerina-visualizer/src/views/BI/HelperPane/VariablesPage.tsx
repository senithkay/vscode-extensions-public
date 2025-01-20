/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { LineRange } from "@wso2-enterprise/ballerina-core";
import { HelperPaneVariableInfo } from "@wso2-enterprise/ballerina-side-panel";
import { COMPLETION_ITEM_KIND, getIcon, HelperPane } from "@wso2-enterprise/ui-toolkit";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import { convertToHelperPaneVariable, filterHelperPaneVariables } from "../../../utils/bi";
import { HELPER_PANE_PAGE, HelperPanePageType } from ".";

type VariablesPageProps = {
    fileName: string;
    targetLineRange: LineRange;
    setCurrentPage: (page: HelperPanePageType) => void;
    onClose: () => void;
    onChange: (value: string) => void;
};

export const VariablesPage = ({ fileName, targetLineRange, setCurrentPage, onClose, onChange }: VariablesPageProps) => {
    const { rpcClient } = useRpcContext();
    const firstRender = useRef<boolean>(true);
    const [searchValue, setSearchValue] = useState<string>("");
    const [variableInfo, setVariableInfo] = useState<HelperPaneVariableInfo | undefined>(undefined);
    const [filteredVariableInfo, setFilteredVariableInfo] = useState<HelperPaneVariableInfo | undefined>(undefined);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const getVariableInfo = useCallback(() => {
        setIsLoading(true);
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
    }, [rpcClient, fileName, targetLineRange]);

    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            getVariableInfo();
        }
    }, []);

    const handleSearch = (searchText: string) => {
        setSearchValue(searchText);
        setFilteredVariableInfo(filterHelperPaneVariables(variableInfo, searchText));
    };

    return (
        <>
            <HelperPane.Header
                title="Variables"
                onBack={() => setCurrentPage(HELPER_PANE_PAGE.CATEGORY)}
                onClose={onClose}
                searchValue={searchValue}
                onSearch={handleSearch}
            />
            <HelperPane.Body isLoading={isLoading}>
                {filteredVariableInfo?.category.map((category, index) => (
                    <HelperPane.Section title={category.label} key={index}>
                        {category.items.map((item, index) => (
                            <HelperPane.CompletionItem
                                key={index}
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
