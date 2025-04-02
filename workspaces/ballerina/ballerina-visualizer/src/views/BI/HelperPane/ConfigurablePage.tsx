/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button, Codicon, COMPLETION_ITEM_KIND, Dropdown, getIcon, HelperPane, OptionProps, TextField, Typography } from "@wso2-enterprise/ui-toolkit";
import styled from "@emotion/styled";
import { HelperPaneVariableInfo } from "@wso2-enterprise/ballerina-side-panel";
import { LineRange, ConfigVariable } from "@wso2-enterprise/ballerina-core";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import { convertToHelperPaneConfigurableVariable, filterHelperPaneVariables } from "../../../utils/bi";
import { URI, Utils } from "vscode-uri";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { debounce } from "lodash";

type ConfigurablePageProps = {
    fileName: string;
    targetLineRange: LineRange;
    onChange: (value: string) => void;
};

namespace S {
    export const Form = styled.div`
        display: flex;
        flex-direction: column;
        gap: 8px;
    `
    
    export const FormBody = styled.div`
        display: flex;
        flex-direction: column;
        gap: 12px;
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
    const [confTypes, setConfTypes] = useState<OptionProps[]>([]);

    const scehma = yup.object({
        confName: yup
            .string()
            .required('Name is required')
            .test('existance', 'The name already exists', (value) => {
                return !configurableInfo?.category.some((category) =>
                    category.items.some((item) => item.label === value)
                );
            }),
        confType: yup.string().required('Type is required'),
        confValue: yup.string().optional()
    });

    type ConfigData = yup.InferType<typeof scehma>;

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isValid }
    } = useForm<ConfigData>({
        mode: "onChange",
        resolver: yupResolver(scehma)
    });

    const getConfigurableVariableInfo = useCallback(() => {
        setIsLoading(true);
        setTimeout(() => {
            rpcClient
                .getBIDiagramRpcClient()
                .getVisibleVariableTypes({
                    filePath: fileName,
                    position: {
                        line: targetLineRange.startLine.line,
                        offset: targetLineRange.startLine.offset
                    }
                })
                .then((response) => {
                    if (response.categories?.length) {
                        const convertedConfigurableInfo = convertToHelperPaneConfigurableVariable(response.categories);
                        setConfigurableInfo(convertedConfigurableInfo);
                        setFilteredConfigurableInfo(convertedConfigurableInfo);
                    }
                })
                .then(() => setIsLoading(false));
        }, 150);
    }, [rpcClient, fileName, targetLineRange]);

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

    const debounceFilterConfigurables = useCallback(
        debounce((searchText: string) => {
            setFilteredConfigurableInfo(filterHelperPaneVariables(configurableInfo, searchText));
            setIsLoading(false);
        }, 150),
        [configurableInfo, setFilteredConfigurableInfo, setIsLoading, filterHelperPaneVariables]
    );

    const handleSearch = (searchText: string) => {
        setSearchValue(searchText);
        setIsLoading(true);
        debounceFilterConfigurables(searchText);
    };

    const clearForm = () => {
        setIsFormVisible(false);
        reset();
    };

    const handleSave = (values: ConfigData) => {
        handleSaveConfigurables(values)
            .then(() => {
                setIsFormVisible(false);
                reset();
            })
            .catch((error) => {
                console.error("Failed to save variable:", error);
            });
    };

    useEffect(() => {
        if (isFormVisible) {
            rpcClient
                .getBIDiagramRpcClient()
                .getVisibleTypes({
                    filePath: fileName,
                    position: {
                        line: targetLineRange.startLine.line,
                        offset: targetLineRange.startLine.offset
                    },
                    typeConstraint: "anydata"
                })
                .then((types) => {
                    setConfTypes(
                        types.map((type) => ({
                            id: type.label,
                            content: type.label,
                            value: type.insertText
                        }))
                    );
                });
        }
    }, [isFormVisible]);

    return (
        <>
            <HelperPane.Header
                searchValue={searchValue}
                onSearch={handleSearch}
                titleSx={{ fontFamily: 'GilmerRegular' }}
            />
            <HelperPane.Body loading={isLoading}>
                {!isFormVisible ? (
                    filteredConfigurableInfo?.category.map((category) => {
                        if (!category.items || category.items.length === 0) {
                            return null;
                        }

                        return (
                            <HelperPane.Section
                                key={category.label}
                                title={category.label}
                                titleSx={{ fontFamily: 'GilmerMedium' }}
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
                        );
                    })
                ) : (
                    <S.Form>
                        <Typography variant="body2" sx={{ fontFamily: 'GilmerMedium' }}>
                            Create New Configurable Variable
                        </Typography>
                        <S.FormBody>
                            <TextField
                                id="confName"
                                label="Name"
                                placeholder="Enter a name for the variable"
                                required
                                {...register("confName")}
                                errorMsg={errors.confName?.message}
                            />
                            <Dropdown
                                id="confType"
                                label="Type"
                                items={confTypes}
                                {...register("confType")}
                                errorMsg={errors.confType?.message}
                            />
                            <TextField
                                id="confValue"
                                label="Value"
                                placeholder="Enter a value for the variable"
                                {...register("confValue")}
                            />
                        </S.FormBody>
                        <S.ButtonPanel>
                            <Button appearance="secondary" onClick={clearForm}>
                                Cancel
                            </Button>
                            <Button appearance="primary" onClick={handleSubmit(handleSave)} disabled={!isValid}>
                                Save
                            </Button>
                        </S.ButtonPanel>
                    </S.Form>
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
