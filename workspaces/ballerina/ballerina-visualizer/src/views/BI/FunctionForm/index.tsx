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
import { Button, TextField, Typography, View, ViewContent, ErrorBanner, FormGroup, Parameters, Dropdown, CompletionItem } from "@wso2-enterprise/ui-toolkit";
import styled from "@emotion/styled";
import { css } from "@emotion/css";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import { BIHeader } from "../BIHeader";
import { BodyText } from "../../styles";
import { getFunctionParametersList } from "../../../utils/utils";
import { FormField, Form, FormValues, Parameter } from "@wso2-enterprise/ballerina-side-panel";
import { debounce } from "lodash";
import { convertToVisibleTypes } from "../../../utils/bi";
import { URI, Utils } from "vscode-uri";

const FormContainer = styled.div`
    display: flex;
    flex-direction: column;
    max-width: 600px;
    gap: 20px;
    margin-top: 20px;
`;

const Container = styled.div`
    display: "flex";
    flex-direction: "column";
    gap: 10;
    margin: 20px;
`;

const ButtonWrapper = styled.div`
    margin-top: 20px;
    width: 130px;
`;

const CardGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    margin-top: 20px;
    width: 100%;
`;

const Link = styled.a`
    cursor: pointer;
    font-size: 12px;
    margin-left: auto;
    margin-right: 15px;
    margin-bottom: -5px;
    color: var(--button-primary-background);
`;

export function FunctionForm() {
    const { rpcClient } = useRpcContext();
    const [filteredTypes, setFilteredTypes] = useState<CompletionItem[]>([]);
    const [types, setTypes] = useState<CompletionItem[]>([]);


    // <------------- Expression Editor Util functions list start --------------->
    const debouncedGetVisibleTypes = debounce(async (value: string, cursorPosition: number) => {
        let visibleTypes: CompletionItem[] = types;
        if (!types.length) {
            const context = await rpcClient.getVisualizerLocation();
            const functionFilePath = Utils.joinPath(URI.file(context.projectUri), 'functions.bal');
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
        return await debouncedGetVisibleTypes(value, cursorPosition) as any;
    };

    const handleCompletionSelect = async () => {
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

    const paramFiels: FormField[] = [
        {
            key: `variable`,
            label: 'Name',
            type: 'string',
            optional: false,
            editable: true,
            documentation: '',
            value: '',
        },
        {
            key: `type`,
            label: 'Type',
            type: 'Type',
            optional: false,
            editable: true,
            documentation: '',
            value: '',
        },
        {
            key: `defaultable`,
            label: 'Default Value',
            type: 'string',
            optional: true,
            advanced: true,
            editable: true,
            documentation: '',
            value: ''
        }
    ];

    const [isLoading, setIsLoading] = useState(false);

    const handleFunctionCreate = async (data: FormValues) => {
        console.log("Function Form Data: ", data)
        setIsLoading(true);
        const name = data['functionName'];
        const returnType = data['type'];
        const params = data['params'];
        const paramList = params ? getFunctionParametersList(params) : [];
        const res = await rpcClient.getBIDiagramRpcClient().createComponent({ type: DIRECTORY_MAP.FUNCTIONS, functionType: { name, returnType, parameters: paramList } });
        setIsLoading(res.response);
    };

    // Helper function to modify and set the visual information
    const handleParamChange = (param: Parameter) => {
        const name = `${param.formValues['variable']}`;
        const type = `${param.formValues['type']}`;
        const defaultValue = Object.keys(param.formValues).indexOf('defaultable') > -1 && `${param.formValues['defaultable']}`;
        let value = `${type} ${name}`;
        if (defaultValue) {
            value += ` = ${defaultValue}`;
        }
        return {
            ...param,
            key: name,
            value: value
        }
    };

    const currentFields: FormField[] = [
        {
            key: `functionName`,
            label: 'Function Name',
            type: 'IDENTIFIER',
            optional: false,
            editable: true,
            advanced: false,
            documentation: '',
            value: '',
        },
        {
            key: `params`,
            label: 'Parameters',
            type: 'PARAM_MANAGER',
            optional: false,
            editable: true,
            advanced: false,
            documentation: '',
            value: '',
            paramManagerProps: {
                paramValues: [],
                formFields: paramFiels,
                handleParameter: handleParamChange
            }
        },
        {
            key: `return`,
            label: 'Return Type',
            type: 'Type',
            optional: true,
            advanced: true,
            editable: true,
            documentation: '',
            value: ''
        }
    ];

    return (
        <View>
            <ViewContent padding>
                <BIHeader />
                <Container>
                    <Typography variant="h2">Create New Function</Typography>
                    <BodyText>
                        Define a function that can be used within the integration.
                    </BodyText>
                    <FormContainer>
                        <Form
                            formFields={currentFields}
                            oneTimeForm={true}
                            expressionEditor={
                                {
                                    completions: filteredTypes,
                                    retrieveVisibleTypes: handleGetVisibleTypes,
                                    onCompletionSelect: handleCompletionSelect,
                                    onCancel: handleExpressionEditorCancel,
                                    onBlur: handleExpressionEditorBlur
                                }
                            }
                            onSubmit={!isLoading && handleFunctionCreate}
                        />
                    </FormContainer>
                </Container>
            </ViewContent>
        </View>
    );
}
