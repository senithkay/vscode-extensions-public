/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useState } from "react";
import { DIRECTORY_MAP } from "@wso2-enterprise/ballerina-core";
import { View, ViewContent, CompletionItem, ProgressRing } from "@wso2-enterprise/ui-toolkit";
import styled from "@emotion/styled";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import { getDataMapperParametersList } from "../../../utils/utils";
import { Form, FormValues } from "@wso2-enterprise/ballerina-side-panel";
import { debounce } from "lodash";
import { convertToVisibleTypes } from "../../../utils/bi";
import { URI, Utils } from "vscode-uri";
import { useDataMapperFormFields } from "../../../Hooks";
import { TopNavigationBar } from "../../../components/TopNavigationBar";
import { TitleBar } from "../../../components/TitleBar";
import { FormHeader } from "../../../components/FormHeader";

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

interface DataMapperFormProps {
    filePath: string;
}''

export function DataMapperForm(props: DataMapperFormProps) {
    const { rpcClient } = useRpcContext();

    const [isLoading, setIsLoading] = useState(false);
    const [filteredTypes, setFilteredTypes] = useState<CompletionItem[]>([]);
    const [types, setTypes] = useState<CompletionItem[]>([]);

    const { formFields, isFetchingFormTemplate } = useDataMapperFormFields(props.filePath);

    const handleDataMapperCreate = async (data: FormValues) => {
        console.log("Data Mapper Form Data: ", data)
        setIsLoading(true);
        const name = data['functionName'];
        const returnType = data['output'];
        const params = data['inputs'];
        const paramList = params ? getDataMapperParametersList(params) : [];
        const res = await rpcClient
            .getBIDiagramRpcClient()
            .createComponent(
                {
                    type: DIRECTORY_MAP.FUNCTIONS,
                    functionType: { name, returnType, parameters: paramList, isExpressionBodied: true }
                }
            );
        setIsLoading(res.response);
    };

    if (isFetchingFormTemplate) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                <ProgressRing />
            </div>
        );
    }

    // <------------- Expression Editor Util functions list start --------------->
    const debouncedGetVisibleTypes = debounce(async (value: string, cursorPosition: number) => {
        let visibleTypes: CompletionItem[] = types;
        if (!types.length) {
            const context = await rpcClient.getVisualizerLocation();
            let functionFilePath = Utils.joinPath(URI.file(context.projectUri), 'functions.bal');
            const workspaceFiles = await rpcClient.getCommonRpcClient().getWorkspaceFiles({});
            const isFilePresent = workspaceFiles.files.some(file => file.path === functionFilePath.fsPath);
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
        return await debouncedGetVisibleTypes(value, cursorPosition) as any;
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

    return (
        <View>
            <TopNavigationBar />
            <TitleBar title="Data Mapper" subtitle="Create a new data mapper for your integration" />
            <ViewContent padding>
                <Container>
                    <FormHeader title={`Create New Data Mapper`} subtitle={`Define a data mapper that can be used to transform data.`} />
                    <FormContainer>
                        <Form
                            formFields={formFields}
                            oneTimeForm={true}
                            expressionEditor={
                                {
                                    types: filteredTypes,
                                    retrieveVisibleTypes: handleGetVisibleTypes,
                                    onCompletionItemSelect: handleCompletionSelect,
                                    onCancel: handleExpressionEditorCancel,
                                    onBlur: handleExpressionEditorBlur
                                }
                            }
                            onSubmit={!isLoading && handleDataMapperCreate}
                            isDataMapper={true}
                        />
                    </FormContainer>
                </Container>
            </ViewContent>
        </View>
    );
}
