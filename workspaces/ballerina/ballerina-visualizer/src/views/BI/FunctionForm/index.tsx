/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { useEffect, useRef, useState } from "react";
import { FunctionNode, LineRange, NodeKind, NodeProperties, Property, NodePropertyKey } from "@wso2-enterprise/ballerina-core";
import { View, ViewContent } from "@wso2-enterprise/ui-toolkit";
import styled from "@emotion/styled";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import { FormField, FormImports, FormValues } from "@wso2-enterprise/ballerina-side-panel";
import { URI, Utils } from "vscode-uri";
import FormGeneratorNew from "../Forms/FormGeneratorNew";
import { TitleBar } from "../../../components/TitleBar";
import { TopNavigationBar } from "../../../components/TopNavigationBar";
import { FormHeader } from "../../../components/FormHeader";
import { convertConfig, getImportsForProperty } from "../../../utils/bi";
import { LoadingContainer } from "../../styles";
import { LoadingRing } from "../../../components/Loader";

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

interface FunctionFormProps {
    filePath: string;
    projectPath: string;
    functionName: string;
    isDataMapper?: boolean;
    isNpFunction?: boolean;
    isAutomation?: boolean;
}

export function FunctionForm(props: FunctionFormProps) {
    const { rpcClient } = useRpcContext();
    const { projectPath, functionName, filePath, isDataMapper, isNpFunction, isAutomation } = props;

    const [functionFields, setFunctionFields] = useState<FormField[]>([]);
    const [functionNode, setFunctionNode] = useState<FunctionNode>(undefined);
    const [targetLineRange, setTargetLineRange] = useState<LineRange>();
    const [titleSubtitle, setTitleSubtitle] = useState<string>("");
    const [formSubtitle, setFormSubtitle] = useState<string>("");
    const [saving, setSaving] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const fileName = filePath.split(/[\\/]/).pop();
    const formType = useRef("Function");

    useEffect(() => {
        let nodeKind: NodeKind;
        if (isAutomation || functionName === "main") {
            nodeKind = 'AUTOMATION';
            formType.current = "Automation";
            setTitleSubtitle('An automation that can be invoked periodically or manually');
            setFormSubtitle('Periodic invocation should be scheduled in an external system such as cronjob, k8s, or Devant');
        } else if (isDataMapper) {
            nodeKind = 'DATA_MAPPER_DEFINITION';
            formType.current = 'Data Mapper';
            setTitleSubtitle('Transform data between different data types');
            setFormSubtitle('Create mappings on how to convert the inputs into a single output');
        } else if (isNpFunction) {
            nodeKind = 'NP_FUNCTION_DEFINITION';
            formType.current = 'Natural Function';
            setTitleSubtitle('Build a flow using a natural language description');
            setFormSubtitle('Describe what you need in a prompt and let AI handle the implementation');
        } else {
            nodeKind = 'FUNCTION_DEFINITION';
            formType.current = 'Function';
            setTitleSubtitle('Build reusable custom flows');
            setFormSubtitle('Define a flow that can be used within your integration');
        }

        if (functionName) {
            getExistingFunctionNode();
        } else {
            getFunctionNode(nodeKind);
        }
    }, [isDataMapper, isNpFunction, isAutomation, functionName]);

    useEffect(() => {
        let fields = functionNode ? convertConfig(functionNode.properties) : [];

        // TODO: Remove this once the hidden flag is implemented 
        if (isAutomation || functionName === "main") {
            formType.current = "Automation";
            const automationFields = fields.filter(field => field.key !== "functionName" && field.key !== "type");
            fields = automationFields;
        }

        // update description fields as "TEXTAREA"
        fields.forEach((field) => {
            if (field.key === "functionNameDescription" || field.key === "typeDescription") {
                field.type = "TEXTAREA";
            }
            if (field.key === "parameters") {
                if ((field.valueTypeConstraint as any).value.parameterDescription) {
                    (field.valueTypeConstraint as any).value.parameterDescription.type = "TEXTAREA";
                }
            }
        });

        setFunctionFields(fields);
    }, [functionNode]);

    const getFunctionNode = async (kind: NodeKind) => {
        setIsLoading(true);
        const res = await rpcClient
            .getBIDiagramRpcClient()
            .getNodeTemplate({
                position: { line: 0, offset: 0 },
                filePath: Utils.joinPath(URI.file(projectPath), fileName).fsPath,
                id: { node: kind },
            });
        let flowNode = res.flowNode;
        if (isNpFunction) {
            /* 
            * TODO: Remove this once the LS is updated
            * HACK: Add the advanced fields under parameters.advanceProperties
            */
            // Get all the advanced fields
            let properties = flowNode.properties as NodeProperties;
            const advancedProperties = Object.fromEntries(
                Object.entries(properties).filter(([_, property]) => property.advanced)
            );
            // Remove the advanced fields from properties
            properties = Object.fromEntries(
                Object.entries(properties).filter(([_, property]) => !property.advanced)
            );
            flowNode.properties = properties;

            // Add the all the advanced fields to advanceProperties
            flowNode.properties.parameters = {
                ...flowNode.properties.parameters,
                advanceProperties: advancedProperties
            }
        }

        setFunctionNode(flowNode);
        setIsLoading(false);
        console.log("Function Node: ", flowNode);
    }

    const getExistingFunctionNode = async () => {
        setIsLoading(true);
        const res = await rpcClient
            .getBIDiagramRpcClient()
            .getFunctionNode({
                functionName,
                fileName,
                projectPath
            });
        let flowNode = res.functionDefinition;
        if (isNpFunction) {
            /* 
            * TODO: Remove this once the LS is updated
            * HACK: Add the advanced fields under parameters.advanceProperties
            */
            // Get all the advanced fields
            let properties = flowNode.properties as NodeProperties;
            const advancedProperties = Object.fromEntries(
                Object.entries(properties).filter(([_, property]) => property.advanced)
            );
            // Remove the advanced fields from properties
            properties = Object.fromEntries(
                Object.entries(properties).filter(([_, property]) => !property.advanced)
            );
            flowNode.properties = properties;

            // Add the all the advanced fields to advanceProperties
            flowNode.properties.parameters = {
                ...flowNode.properties.parameters,
                advanceProperties: advancedProperties
            }
        }

        setFunctionNode(flowNode);
        setIsLoading(false);
        console.log("Existing Function Node: ", flowNode);
    }

    const onSubmit = async (data: FormValues, formImports?: FormImports) => {
        console.log("Function Form Data: ", data);
        const functionNodeCopy = { ...functionNode };

        /**
         * TODO: Remove this once the LS is updated
         * HACK: Add the advanced fields under parameters.advanceProperties back to properties
         */
        if (isNpFunction) {
            // Add values back to properties
            const properties = functionNodeCopy.properties;
            functionNodeCopy.properties = {
                ...properties,
                ...properties.parameters.advanceProperties,
            }

            // Remove the advanceProperties from parameters
            delete properties.parameters.advanceProperties;
        }

        if (isNpFunction) {
            // Handle advance properties
            const enrichFlowNodeForAdvanceProperties = (data: FormValues) => {
                for (const value of Object.values(data)) {
                    const nestedData = value.advanceProperties;
                    if (nestedData) {
                        for (const [advanceKey, advanceValue] of Object.entries(nestedData)) {
                            functionNodeCopy.properties[advanceKey as NodePropertyKey].value = advanceValue;
                        }

                        delete value.advanceProperties;
                    }
                }
            }

            enrichFlowNodeForAdvanceProperties(data);
        }

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
                                param.value = (repeatValue as any).formValues[paramKey] || "";
                            }
                            (property.value as any)[(repeatValue as any).key] = valueConstraint;
                        }
                    } else {
                        property.value = dataValue;
                    }
                    const imports = getImportsForProperty(key, formImports);
                    property.imports = imports;
                }
            }
        }
        console.log("Updated function node: ", functionNodeCopy);
        const sourceCode = await rpcClient
            .getBIDiagramRpcClient()
            .getSourceCode({ filePath, flowNode: functionNodeCopy, isFunctionNodeUpdate: true });

        if (!sourceCode.textEdits) {
            setSaving(false);
            showErrorNotification();
        }
    };

    const handleFormSubmit = async (data: FormValues, formImports?: FormImports) => {
        setSaving(true);
        // HACK: Remove new lines from function description fields
        const descriptionFields = ["functionNameDescription", "typeDescription"];
        for (const field of descriptionFields) {
            if (data[field]) {
                data[field] = data[field]?.replace(/\n/g, " ");
            }
        }
        // HACK: Remove new lines from parameter description
        if (data.parameters) {
            for (const parameter of data.parameters) {
                if (parameter && parameter.formValues?.parameterDescription) {
                    parameter.formValues.parameterDescription = parameter.formValues.parameterDescription.replace(/\n/g, " ");
                }
            }
        }

        try {
            await onSubmit(data, formImports);
        } catch (error) {
            console.error("Error submitting form: ", error);
            showErrorNotification();
        }
    };

    const showErrorNotification = async () => {
        const functionType = getFunctionType();
        await rpcClient
            .getCommonRpcClient()
            .showErrorMessage({
                message: `${functionName ? `Failed to update the ${functionType}` : `Failed to create the ${functionType}`}. `
            });
    }

    const getFunctionType = () => {
        if (isDataMapper) {
            return "Data Mapper";
        } else if (isNpFunction) {
            return "Natural Function";
        } else if (isAutomation || functionName === "main") {
            return "Automation";
        }
        return "Function";
    };

    useEffect(() => {
        if (filePath && rpcClient) {
            rpcClient
                .getBIDiagramRpcClient()
                .getEndOfFile({ filePath })
                .then((res) => {
                    setTargetLineRange({
                        startLine: res,
                        endLine: res,
                    });
                });
        }
    }, [filePath, rpcClient]);

    //HACK: Hide is isolated field form function form
    functionFields.forEach((field) => {
        if (field.key === "isIsolated") {
            field.hidden = true;
        }
    });

    return (
        <View>
            <TopNavigationBar />
            <TitleBar
                title={formType.current}
                subtitle={titleSubtitle}
            />
            <ViewContent padding>
                <Container>
                    <FormHeader
                        title={`${functionName ? 'Edit' : 'Create New'} ${formType.current}`}
                        subtitle={formSubtitle}
                    />
                    {isLoading && (
                        <LoadingContainer>
                            <LoadingRing />
                        </LoadingContainer>
                    )}
                    <FormContainer>
                        {filePath && targetLineRange && functionFields.length > 0 &&
                            <FormGeneratorNew
                                fileName={filePath}
                                targetLineRange={targetLineRange}
                                fields={functionFields}
                                isSaving={saving}
                                onSubmit={handleFormSubmit}
                                submitText={saving ? (functionName ? "Saving" : "Creating") : (functionName ? "Save" : "Create")}
                                selectedNode={functionNode?.codedata?.node}
                            />
                        }
                    </FormContainer>
                </Container>
            </ViewContent>
        </View>
    );
}
