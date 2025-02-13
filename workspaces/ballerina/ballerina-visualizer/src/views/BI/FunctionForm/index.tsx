/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { useEffect, useState } from "react";
import { FunctionNode, NodeProperties } from "@wso2-enterprise/ballerina-core";
import { Typography, View, ViewContent } from "@wso2-enterprise/ui-toolkit";
import styled from "@emotion/styled";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import { BIHeader } from "../BIHeader";
import { BodyText } from "../../styles";
import { FormField, FormValues, Parameter } from "@wso2-enterprise/ballerina-side-panel";
import { URI, Utils } from "vscode-uri";
import FormGeneratorNew from "../Forms/FormGeneratorNew";
import { TitleBar } from "../../../components/TitleBar";
import { TopNavigationBar } from "../../../components/TopNavigationBar";
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

interface FunctionFormProps {
    fileName: string;
    projectPath: string;
    functionName: string;
}

export function FunctionForm(props: FunctionFormProps) {
    const { rpcClient } = useRpcContext();
    const { projectPath, fileName, functionName } = props;

    const [functionFields, setFunctionFields] = useState<FormField[]>([]);
    const [filePath, setFilePath] = useState<string>('');
    const [functionNode, setFunctionNode] = useState<FunctionNode>(undefined);

    useEffect(() => {
        setFilePath(Utils.joinPath(URI.file(projectPath), fileName).fsPath)
        if (functionName) {
            getExistingFunctionNode();
        } else {
            getFunctionNode();
        }
    }, []);

    useEffect(() => {
        functionNode && setFunctionFields(convertConfig(functionNode));
    }, [functionNode]);

    const getFunctionNode = async () => {
        const res = await rpcClient
            .getBIDiagramRpcClient()
            .getNodeTemplate({
                position: { line: 0, offset: 0 },
                filePath: Utils.joinPath(URI.file(projectPath), fileName).fsPath,
                id: { node: 'FUNCTION_DEFINITION' },
            });
        const flowNode = res.flowNode;
        setFunctionNode(flowNode);
        console.log("Function Node: ", flowNode);
    }

    const getExistingFunctionNode = async () => {
        const res = await rpcClient
            .getBIDiagramRpcClient()
            .getFunctionNode({
                functionName,
                fileName,
                projectPath
            });
        const flowNode = res.functionDefinition;
        setFunctionNode(flowNode);
        console.log("Existing Function Node: ", flowNode);
    }

    const handleSubmit = async (data: FormValues) => {
        console.log("Function Form Data: ", data)
        const functionNodeCopy = { ...functionNode };
        for (const [dataKey, dataValue] of Object.entries(data)) {
            const properties = functionNodeCopy.properties as NodeProperties;
            for (const [key, property] of Object.entries(properties)) {
                if (dataKey === key) {
                    if (property.valueType === "REPEATABLE_PROPERTY") {
                        const baseConstraint = property.valueTypeConstraint;
                        property.value = {};
                        // Go through the parameters array
                        for (const [repeatKey, repeatValue] of Object.entries(dataValue)) {
                            // Create a deep copy for each iteration
                            const valueConstraint = JSON.parse(JSON.stringify(baseConstraint));
                            // Fill the values of the parameter constraint
                            for (const [paramKey, param] of Object.entries((valueConstraint as any).value as NodeProperties)) {
                                param.value = (repeatValue as any).formValues[paramKey];
                            }
                            (property.value as any)[(repeatValue as any).key] = valueConstraint;
                        }
                    } else {
                        property.value = dataValue;
                    }
                }
            }
        }
        console.log("Updated function node: ", functionNodeCopy);
        const res = await rpcClient.getBIDiagramRpcClient().getSourceCode({ filePath, flowNode: functionNodeCopy, isFunctionNodeUpdate: true });
    };

    return (
        <View>
            <TopNavigationBar />
            <TitleBar title="Function" subtitle="Manage functions in your integration" />
            <ViewContent padding>
                <Container>
                    {functionName && (
                        <FormHeader title={`Edit Function`} subtitle={`Edit the function that can be used within the integration.`} />
                    )}
                    {!functionName && (
                        <FormHeader title={`Create New Function`} subtitle={`Define a function that can be used within the integration.`} />
                    )}
                    <FormContainer>
                        {filePath && functionFields.length > 0 &&
                            <FormGeneratorNew
                                fileName={filePath}
                                targetLineRange={{ startLine: { line: 0, offset: 0 }, endLine: { line: 0, offset: 0 } }}
                                fields={functionFields}
                                onSubmit={handleSubmit}
                                submitText={functionName ? "Save" : "Create"}
                            />
                        }
                    </FormContainer>
                </Container>
            </ViewContent>
        </View>
    );
}

function convertConfig(functionNode: FunctionNode): FormField[] {
    const formFields: FormField[] = [];
    const properties = functionNode.properties as NodeProperties;
    const keys = Object.keys(properties).sort(); // Sort keys alphabetically
    for (const key of keys) {
        const property = properties[key as keyof NodeProperties];
        const formField: FormField = {
            key: key,
            label: property?.metadata.label,
            type: property.valueType,
            documentation: property?.metadata.description || "",
            valueType: property.valueType,
            editable: property.editable,
            optional: property.optional,
            value: property.value as any,
            advanced: property.advanced,
            diagnostics: [],
            valueTypeConstraint: ""
        }

        if (property.valueType === "REPEATABLE_PROPERTY") {
            const paramFiels: FormField[] = [];
            for (const [paramKey, param] of Object.entries((property.valueTypeConstraint as any).value as NodeProperties)) {
                const paramField: FormField = {
                    key: paramKey,
                    label: param?.metadata.label,
                    type: param.valueType,
                    documentation: param?.metadata.description || "",
                    valueType: param.valueType,
                    editable: param.editable,
                    optional: param.optional,
                    value: param.value as any,
                    advanced: param.advanced,
                    diagnostics: [],
                    valueTypeConstraint: ""
                }
                paramFiels.push(paramField);
            }
            formField.valueType = "PARAM_MANAGER";
            formField.type = "PARAM_MANAGER";

            const paramValuesExisting: Parameter[] = []
            for (const [index, [paramValueKey, paramValue]] of Object.entries((property as any).value as NodeProperties).entries()) {
                const name = (paramValue.value as any)['variable'].value;
                const type = (paramValue.value as any)['type'].value;
                let value = `${type} ${name} `;
                paramValuesExisting.push({
                    id: index,
                    icon: "",
                    key: paramValueKey,
                    value: value,
                    formValues: {
                        variable: name,
                        type: type
                    }
                })
            }

            formField.paramManagerProps = {
                paramValues: paramValuesExisting,
                formFields: paramFiels,
                handleParameter: handleParamChange
            }
            formField.value = paramValuesExisting;
        }

        formFields.push(formField);
    }
    return formFields;
}

// Helper function to modify and set the visual information
const handleParamChange = (param: Parameter) => {
    const name = `${param.formValues['variable']}`;
    const type = `${param.formValues['type']} `;
    const defaultValue = Object.keys(param.formValues).indexOf('defaultable') > -1 && `${param.formValues['defaultable']} `;
    let value = `${type} ${name} `;
    if (defaultValue) {
        value += ` = ${defaultValue} `;
    }
    return {
        ...param,
        key: name,
        value: value
    }
};
