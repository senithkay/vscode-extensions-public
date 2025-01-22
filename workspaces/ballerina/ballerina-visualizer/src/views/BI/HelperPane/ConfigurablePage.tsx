/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useRef, useState } from "react";
import { Button, Codicon, COMPLETION_ITEM_KIND, getIcon, HelperPane, TextField } from "@wso2-enterprise/ui-toolkit";
import styled from "@emotion/styled";
import { HelperPaneVariableInfo } from "@wso2-enterprise/ballerina-side-panel";
import { LineRange, ConfigVariable } from "@wso2-enterprise/ballerina-core";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import { convertToHelperPaneConfigurableVariable, filterHelperPaneVariables } from "../../../utils/bi";
import { URI, Utils } from "vscode-uri";
import { HELPER_PANE_PAGE, HelperPanePageType } from ".";

type ConfigurablePageProps = {
    fileName: string;
    targetLineRange: LineRange;
    setCurrentPage: (page: HelperPanePageType) => void;
    onClose: () => void;
    onChange: (value: string) => void;
};

type ConfigData = {
    confName: string;
    confType: string;
    confValue: string;
};

namespace S {
    export const FormSection = styled.div`
        display: flex;
        flex-direction: column;
        gap: 8px;
    `;

    export const ButtonPanel = styled.div`
        display: flex;
        margin-top: 20px;
        margin-left: auto;
        gap: 16px;
    `;
}

export const ConfigurablePage = ({
    fileName,
    targetLineRange,
    setCurrentPage,
    onClose,
    onChange,
}: ConfigurablePageProps) => {
    const { rpcClient } = useRpcContext();
    const firstRender = useRef<boolean>(true);
    const [searchValue, setSearchValue] = useState<string>("");
    const [isFormVisible, setIsFormVisible] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [configurableInfo, setConfigurableInfo] = useState<HelperPaneVariableInfo | undefined>(undefined);
    const [filteredConfigurableInfo, setFilteredConfigurableInfo] = useState<HelperPaneVariableInfo | undefined>(
        undefined
    );
    const [confName, setConfName] = useState<string>("");
    const [confType, setConfType] = useState<string>("");
    const [confValue, setConfValue] = useState<string>("");

    const getConfigurableVariableInfo = () => {
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
                        const convertedConfigurableInfo = convertToHelperPaneConfigurableVariable(response.categories);
                        setConfigurableInfo(convertedConfigurableInfo);
                        setFilteredConfigurableInfo(convertedConfigurableInfo);
                    }
                })
                .then(() => setIsLoading(false));
        }, 1100);
    };

    const handleSaveConfigurables = async (values: ConfigData) => {
        const variable: ConfigVariable = {
            id: "",
            metadata: {
                label: "Config",
                description: "Create a configurable variable",
            },
            codedata: {
                node: "CONFIG_VARIABLE",
                lineRange: {
                    fileName: "config.bal",
                    startLine: {
                        line: 0,
                        offset: 0,
                    },
                    endLine: {
                        line: 0,
                        offset: 0,
                    },
                },
            },
            returning: false,
            properties: {
                type: {
                    metadata: {
                        label: "Type",
                        description: "Type of the variable",
                    },
                    valueType: "TYPE",
                    value: "",
                    optional: false,
                    advanced: false,
                    editable: true,
                },
                variable: {
                    metadata: {
                        label: "Variable",
                        description: "Name of the variable",
                    },
                    valueType: "IDENTIFIER",
                    value: "",
                    optional: false,
                    advanced: false,
                    editable: true,
                },
                defaultable: {
                    metadata: {
                        label: "Default value",
                        description: "Default value for the config, if empty your need to provide a value at runtime",
                    },
                    valueType: "EXPRESSION",
                    value: "",
                    optional: true,
                    advanced: true,
                    editable: true,
                },
            },
            branches: [],
        };

        variable.properties.variable.value = values.confName;
        variable.properties.defaultable.value =
            values.confValue === "" || values.confValue === null ? "?" : '"' + values.confValue + '"';
        variable.properties.defaultable.optional = true;
        variable.properties.type.value = values.confType;

        rpcClient.getVisualizerLocation().then((location) => {
            rpcClient
                .getBIDiagramRpcClient()
                .updateConfigVariables({
                    configVariable: variable,
                    configFilePath: Utils.joinPath(URI.file(location.projectUri), "config.bal").fsPath,
                })
                .then((response: any) => {
                    console.log(">>> Config variables------", response);
                    getConfigurableVariableInfo();
                });
        });
    };

    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            getConfigurableVariableInfo();
        }
    }, []);

    const handleSearch = (searchText: string) => {
        setSearchValue(searchText);
        setFilteredConfigurableInfo(filterHelperPaneVariables(configurableInfo, searchText));
    };

    const clearForm = () => {
        setIsFormVisible(false);
        setConfName("");
        setConfType("");
        setConfValue("");
    };

    const handleSave = () => {
        const confData = {
            confName: confName,
            confType: confType,
            confValue: confValue,
        };

        handleSaveConfigurables(confData as any)
            .then(() => {
                setIsFormVisible(false);
                setCurrentPage(HELPER_PANE_PAGE.CONFIGURABLE);
            })
            .catch((error) => {
                console.error("Failed to save variable:", error);
            });
    };

    const isConfigDataValid = () => {
        return confName.length > 0 && confType.length > 0 && confValue.length > 0;
    };

    return (
        <>
            <HelperPane.Header
                title="Configurables"
                onBack={() => setCurrentPage(HELPER_PANE_PAGE.CATEGORY)}
                onClose={onClose}
                searchValue={searchValue}
                onSearch={handleSearch}
                titleSx={{ fontFamily: "GilmerRegular" }}
            />
            <HelperPane.Body loading={isLoading}>
                {!isFormVisible ? (
                    <>
                        {filteredConfigurableInfo?.category.map((category) => (
                            <React.Fragment key={category.label}>
                                {category.items.map((item, index) => (
                                    <HelperPane.CompletionItem
                                        key={index}
                                        label={item.label}
                                        type={item.type}
                                        onClick={() => onChange(item.label)}
                                        getIcon={() => getIcon(COMPLETION_ITEM_KIND.Variable)}
                                    />
                                ))}
                            </React.Fragment>
                        ))}
                    </>
                ) : (
                    <HelperPane.Section title="Create New Configurable Variable" titleSx={{ fontFamily: "GilmerMedium" }}>
                        <S.FormSection>
                            <TextField
                                label="Name"
                                placeholder="Enter a name for the variable"
                                value={confName}
                                onChange={(e) => setConfName(e.target.value)}
                            />
                            {/* TODO: Update the component to a TypeSelector when the API is provided */}
                            <TextField
                                label="Type"
                                placeholder="Enter a type for the variable"
                                value={confType}
                                onChange={(e) => setConfType(e.target.value)}
                            />
                            <TextField
                                label="Value"
                                placeholder="Enter a value for the variable"
                                value={confValue}
                                onChange={(e) => setConfValue(e.target.value)}
                            />
                        </S.FormSection>
                        <S.ButtonPanel>
                            <Button appearance="secondary" onClick={clearForm}>
                                Cancel
                            </Button>
                            <Button appearance="primary" onClick={handleSave} disabled={!isConfigDataValid()}>
                                Save
                            </Button>
                        </S.ButtonPanel>
                    </HelperPane.Section>
                )}
            </HelperPane.Body>
            {!isFormVisible && (
                <HelperPane.Footer>
                    <HelperPane.IconButton
                        title="Create New Configurable Variable"
                        getIcon={() => <Codicon name="add" />}
                        onClick={() => setIsFormVisible(true)}
                    />
                </HelperPane.Footer>
            )}
        </>
    );
};
