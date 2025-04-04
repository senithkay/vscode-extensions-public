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
import { FormField, FormValues } from "@wso2-enterprise/ballerina-side-panel";
import { URI, Utils } from "vscode-uri";
import FormGeneratorNew from "../Forms/FormGeneratorNew";
import { TitleBar } from "../../../components/TitleBar";
import { TopNavigationBar } from "../../../components/TopNavigationBar";
import { FormHeader } from "../../../components/FormHeader";
import { convertConfig } from "../../../utils/bi";

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
        // TODO: Enable Natural Functions https://github.com/wso2-enterprise/vscode-extensions/issues/5314
        // } else if (isNpFunction) {
        //     nodeKind = 'NP_FUNCTION_DEFINITION';
        //     formType.current = 'Natural Function';
        //     setTitleSubtitle('Build a flow using a natural language description');
        //     setFormSubtitle('Describe what you need in a prompt and let AI handle the implementation');
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

        setFunctionFields(fields);
    }, [functionNode]);

    const getFunctionNode = async (kind: NodeKind) => {
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
        console.log("Existing Function Node: ", flowNode);
    }

    const handleSubmit = async (data: FormValues) => {
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
        await rpcClient.getBIDiagramRpcClient().getSourceCode({ filePath, flowNode: functionNodeCopy, isFunctionNodeUpdate: true });
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
                    <FormContainer>
                        {filePath && targetLineRange && functionFields.length > 0 &&
                            <FormGeneratorNew
                                fileName={filePath}
                                targetLineRange={targetLineRange}
                                fields={functionFields}
                                onSubmit={handleSubmit}
                                submitText={functionName ? "Save" : "Create"}
                                selectedNode={functionNode?.codedata?.node}
                            />
                        }
                    </FormContainer>
                </Container>
            </ViewContent>
        </View>
    );
}
