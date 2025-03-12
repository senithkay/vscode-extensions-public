/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { useEffect, useRef, useState } from "react";
import { FunctionNode, LineRange, NodeProperties } from "@wso2-enterprise/ballerina-core";
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

    const fileName = filePath.split(/[\\/]/).pop();
    const formType = useRef(
        isAutomation ? "Automation" : 
        isDataMapper ? "Data Mapper" : 
        isNpFunction ? "Natural Function" : 
        "Function"
    );

    useEffect(() => {
        if (functionName) {
            getExistingFunctionNode();
        } else {
            getFunctionNode();
        }
    }, [filePath, functionName, isDataMapper, isAutomation]);

    useEffect(() => {
        let fields = functionNode ? convertConfig(functionNode.properties) : [];
        
        if (isAutomation || functionName === "main") {
            formType.current = "Automation";
            const automationFields = fields.filter(field => field.key !== "functionName" && field.key !== "type");
            fields = automationFields;
        }
        
        if (isDataMapper && fields.length > 0) {
            fields.forEach((field) => {
                field.optional = false;
            });
        }

        setFunctionFields(fields);
    }, [functionNode, isAutomation, isDataMapper]);

    const getFunctionNode = async () => {
        const res = await rpcClient
            .getBIDiagramRpcClient()
            .getNodeTemplate({
                position: { line: 0, offset: 0 },
                filePath: Utils.joinPath(URI.file(projectPath), fileName).fsPath,
                id: { 
                    node: isAutomation ? 'AUTOMATION' :
                          isDataMapper ? 'DATA_MAPPER_DEFINITION' : 
                          isNpFunction ? 'NP_FUNCTION_DEFINITION' : 
                          'FUNCTION_DEFINITION' 
                },
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
        console.log("Function Form Data: ", data);
    
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

    const getTitleSubtitle = () => {
        if (isAutomation || functionName === "main") {
            return "Periodic invocation should be scheduled in an external system such as cronjob, k8s, or Devant";
        } 
        let keyword = isDataMapper ? "data mappers" : isNpFunction ? "natural functions" : "functions";
        return `Manage ${keyword} in your integration`;  
    };

    const getFormSubtitle = () => {
        if (isAutomation || functionName === "main") {
            return 'Create an automation that can be invoked periodically or manually';
        }
        // TOOD: Define the subtitle for data mappers and natural functions
        return '';
    };

    return (
        <View>
            <TopNavigationBar />
            <TitleBar 
                title={formType.current} 
                subtitle={getFormSubtitle()} 
            />
            <ViewContent padding>
                <Container>
                    {functionName && (
                        <FormHeader title={`Edit ${formType.current}`} subtitle={getTitleSubtitle()} />
                    )}
                    {!functionName && (
                        <FormHeader title={`Create New ${formType.current}`} subtitle={getFormSubtitle()} />
                    )}
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
