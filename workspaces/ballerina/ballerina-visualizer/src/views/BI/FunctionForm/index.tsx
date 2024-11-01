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
import { ParamManager, ParamConfig, FormField } from "@wso2-enterprise/ballerina-side-panel";
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
    const [name, setName] = useState("");
    const [returnType, setReturnType] = useState("void");
    const [filteredTypes, setFilteredTypes] = useState<CompletionItem[]>([]);
    const [types, setTypes] = useState<CompletionItem[]>([]);

    const currentFields: FormField[] = [
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
            type: 'type',
            optional: false,
            editable: true,
            documentation: '',
            value: ''
        },
        {
            key: `defaultable`,
            label: 'Default Value',
            type: 'string',
            optional: true,
            editable: true,
            documentation: '',
            value: ''
        }
    ];


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

    const parameterConfig: ParamConfig = {
        paramValues: [],
        formConfig: {
            formFields: currentFields,
            onSubmit: null,
            fileName: null,
            targetLineRange: {
                startLine: null,
                endLine: null
            },
            expressionEditor: {
                completions: filteredTypes,
                retrieveVisibleTypes: handleGetVisibleTypes,
                onCompletionSelect: handleCompletionSelect,
                onCancel: handleExpressionEditorCancel,
                onBlur: handleExpressionEditorBlur,
            }
        }
    }

    const [params, setParams] = useState(parameterConfig);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleFunctionCreate = async () => {
        setIsLoading(true);
        const paramList = getFunctionParametersList(null);
        const res = await rpcClient.getBIDiagramRpcClient().createComponent({ type: DIRECTORY_MAP.FUNCTIONS, functionType: { name, returnType, parameters: paramList } });
        setIsLoading(res.response);
        setError(res.error);
    };

    const validate = () => {
        return !name || isLoading;
    }

    const handleParamChange = (params: ParamConfig) => {
        const modifiedParamValues = params.paramValues.map((param) => {
            const name = `${param.formValues['variable']}`;
            const type = `${param.formValues['type']}`;
            const defaultValue = `${param.formValues['defaultable']}`;
            let value = `${type} ${name}`;
            if (defaultValue) {
                value += ` = ${defaultValue}`;
            }
            return {
                ...param,
                key: name,
                value: value
            }
        });
        const modifiedParams = {
            ...params,
            paramValues: modifiedParamValues
        }
        setParams(modifiedParams);
    };

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
                        <TextField
                            onTextChange={setName}
                            value={name}
                            label="Function Name"
                            placeholder="Enter function name"
                        />
                        <FormGroup title="Parameters" isCollapsed={true}>
                            <ParamManager paramConfigs={params} readonly={false} onChange={handleParamChange} />
                        </FormGroup>
                        <FormGroup title="Return Type" isCollapsed={true}>
                            <Dropdown
                                id="return"
                                label="Return Type"
                                items={[{ value: "string" }, { value: "int" }]} // FIXME: Replace this with type editor
                                onChange={(value) => setReturnType(value.target.value)}
                                value={returnType}
                            />
                        </FormGroup>
                        <ButtonWrapper>
                            <Button
                                disabled={validate()}
                                onClick={handleFunctionCreate}
                                appearance="primary"
                            >
                                Create Function
                            </Button>
                        </ButtonWrapper>
                        {error && <ErrorBanner errorMsg={error} />}
                    </FormContainer>
                </Container>
            </ViewContent>
        </View>
    );
}
