/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useState } from "react";
import { DIRECTORY_MAP, EVENT_TYPE, ProjectStructureArtifactResponse } from "@wso2-enterprise/ballerina-core";
import { View, ViewContent, CompletionItem, Button } from "@wso2-enterprise/ui-toolkit";
import styled from "@emotion/styled";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import { getFunctionParametersList } from "../../../utils/utils";
import { Form, FormField, FormValues, Parameter } from "@wso2-enterprise/ballerina-side-panel";
import { debounce } from "lodash";
import { TopNavigationBar } from "../../../components/TopNavigationBar";
import { URI, Utils } from "vscode-uri";
import { convertToVisibleTypes } from "../../../utils/bi";
import { TitleBar } from "../../../components/TitleBar";
import { FormHeader } from "../../../components/FormHeader";
import { Banner } from "../../../components/Banner";
import FormGeneratorNew from "../Forms/FormGeneratorNew";

const FormContainer = styled.div`
    display: flex;
    flex-direction: column;
    max-width: 600px;
    gap: 20px;
`;

const Container = styled.div`
    display: "flex";
    flex-direction: "column";
    gap: 10;
`;

const ButtonWrapper = styled.div`
    margin-top: 20px;
    width: 130px;
`;

const Link = styled.a`
    cursor: pointer;
    font-size: 12px;
    margin-left: auto;
    margin-right: 15px;
    margin-bottom: -5px;
    color: var(--button-primary-background);
`;

const CardGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    margin-top: 20px;
    width: 100%;
`;

export function MainForm() {
    const { rpcClient } = useRpcContext();
    // const [name, setName] = useState("");
    // const [cron, setCron] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [automation, setAutomation] = useState<ProjectStructureArtifactResponse>(null);
    // const [error, setError] = useState("");
    // const [params, setParams] = useState(parameterConfig);

    const [filteredTypes, setFilteredTypes] = useState<CompletionItem[]>([]);
    const [types, setTypes] = useState<CompletionItem[]>([]);

    const [filePath, setFilePath] = useState<string>('');

    // <------------- Expression Editor Util functions list start --------------->
    const debouncedGetVisibleTypes = debounce(async (value: string, cursorPosition: number) => {
        let visibleTypes: CompletionItem[] = types;
        if (!types.length) {
            const context = await rpcClient.getVisualizerLocation();
            let functionFilePath = Utils.joinPath(URI.file(context.projectUri), "functions.bal");
            const workspaceFiles = await rpcClient.getCommonRpcClient().getWorkspaceFiles({});
            const isFilePresent = workspaceFiles.files.some((file) => file.path === functionFilePath.fsPath);
            if (!isFilePresent) {
                functionFilePath = Utils.joinPath(URI.file(context.projectUri));
            }
            const response = await rpcClient.getBIDiagramRpcClient().getVisibleTypes({
                filePath: functionFilePath.fsPath,
                position: { line: 0, offset: 0 },
            });

            visibleTypes = convertToVisibleTypes(response.types);
            setTypes(visibleTypes);
        }

        const effectiveText = value.slice(0, cursorPosition);
        const filteredTypes = visibleTypes.filter((type) => {
            const lowerCaseText = effectiveText.toLowerCase();
            const lowerCaseLabel = type.label.toLowerCase();

            return lowerCaseLabel.includes(lowerCaseText);
        });

        setFilteredTypes(filteredTypes);
        return { visibleTypes, filteredTypes };
    }, 250);

    const handleGetVisibleTypes = async (value: string, cursorPosition: number) => {
        return (await debouncedGetVisibleTypes(value, cursorPosition)) as any;
    };

    const handleCompletionSelect = async () => {
        debouncedGetVisibleTypes.cancel();
        handleExpressionEditorCancel();
    };

    const handleExpressionEditorCancel = () => {
        setFilteredTypes([]);
        setTypes([]);
    };

    const handleExpressionEditorBlur = () => {
        handleExpressionEditorCancel();
    };
    // <------------- Expression Editor Util functions list end --------------->

    const handleFunctionCreate = async (data: FormValues) => {
        setIsLoading(true);
        const name = data["functionName"];
        const params = data["params"];
        const paramList = params ? getFunctionParametersList(params) : [];
        const res = await rpcClient
            .getBIDiagramRpcClient()
            .createComponent({ type: DIRECTORY_MAP.AUTOMATION, functionType: { name, parameters: paramList } });
        setIsLoading(res.response);
    };

    const openAutomation = () => {
        rpcClient.getVisualizerRpcClient().openView({
            type: EVENT_TYPE.OPEN_VIEW,
            location: { documentUri: automation.path, position: automation.position },
        });
    };

    useEffect(() => {
        rpcClient
            .getBIDiagramRpcClient()
            .getProjectStructure()
            .then((res) => {
                if (res.directoryMap[DIRECTORY_MAP.AUTOMATION].length > 0) {
                    setAutomation(res.directoryMap[DIRECTORY_MAP.AUTOMATION][0]);
                }
            });
        rpcClient.getVisualizerLocation().then(context => {
            let functionFilePath = Utils.joinPath(URI.file(context.projectUri), "main.bal").fsPath;
            setFilePath(functionFilePath)
        });
    }, []);

    const paramFiels: FormField[] = [
        {
            key: `variable`,
            label: "Name",
            type: "string",
            optional: false,
            editable: true,
            documentation: "",
            value: "",
            valueTypeConstraint: "",
        },
        {
            key: `type`,
            label: "Type",
            type: "Type",
            optional: false,
            editable: true,
            documentation: "",
            value: "",
            valueTypeConstraint: "",
        },
        {
            key: `defaultable`,
            label: "Default Value",
            type: "EXPRESSION",
            optional: true,
            advanced: true,
            editable: true,
            documentation: "",
            value: "",
            valueTypeConstraint: "",
        },
    ];

    // Helper function to modify and set the visual information
    const handleParamChange = (param: Parameter) => {
        const name = `${param.formValues["variable"]}`;
        const type = `${param.formValues["type"]}`;
        const defaultValue =
            Object.keys(param.formValues).indexOf("defaultable") > -1 && `${param.formValues["defaultable"]}`;
        let value = `${type} ${name}`;
        if (defaultValue) {
            value += ` = ${defaultValue}`;
        }
        return {
            ...param,
            key: name,
            value: value,
        };
    };

    const currentFields: FormField[] = [
        {
            key: `functionName`,
            label: "Automation Name",
            type: "string",
            optional: false,
            editable: true,
            documentation: "",
            value: "",
            valueTypeConstraint: "string",
        },
        {
            key: `params`,
            label: "Parameters",
            type: "PARAM_MANAGER",
            optional: true,
            editable: true,
            documentation: "",
            valueTypeConstraint: "",
            value: "",
            paramManagerProps: {
                paramValues: [],
                formFields: paramFiels,
                handleParameter: handleParamChange,
            },
        },
    ];

    return (
        <View>
            <TopNavigationBar />
            <TitleBar title="Automation" subtitle="Create a new automation for your integration" />
            <ViewContent padding>
                <Container>
                    {automation && (
                        <Banner
                            variant="info"
                            message="An integration can only have one automation. You have already created an automation."
                            actions={
                                <>
                                    <Button onClick={openAutomation}>View Automation</Button>
                                </>
                            }
                        />
                    )}
                    {!automation && (
                        <>
                            <FormHeader
                                title="Create an Automation"
                                subtitle="Implement an automation for either scheduled or manual jobs."
                            />
                            <FormContainer>
                                {filePath && currentFields.length > 0 &&
                                    <FormGeneratorNew
                                        fileName={filePath}
                                        targetLineRange={{ startLine: { line: 0, offset: 0 }, endLine: { line: 0, offset: 0 } }}
                                        fields={currentFields}
                                        onSubmit={handleFunctionCreate}
                                        submitText={"Create"}
                                    />
                                }
                            </FormContainer>
                        </>
                    )}
                </Container>
            </ViewContent>
        </View>
    );
}
