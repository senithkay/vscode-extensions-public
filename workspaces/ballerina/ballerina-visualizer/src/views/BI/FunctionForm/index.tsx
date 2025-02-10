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
import { FormField, FormValues } from "@wso2-enterprise/ballerina-side-panel";
import { URI, Utils } from "vscode-uri";
import FormGeneratorNew from "../Forms/FormGeneratorNew";
import { convertConfig } from "../../../utils/bi";

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

interface FunctionFormProps {
    fileName: string;
    projectPath: string;
    functionName: string;
    isDataMapper?: boolean;
}

export function FunctionForm(props: FunctionFormProps) {
    const { rpcClient } = useRpcContext();
    const { projectPath, fileName, functionName, isDataMapper } = props;

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
        functionNode && setFunctionFields(convertConfig(functionNode.properties));
    }, [functionNode]);

    const getFunctionNode = async () => {
        const res = await rpcClient
            .getBIDiagramRpcClient()
            .getNodeTemplate({
                position: { line: 0, offset: 0 },
                filePath: "",
                id: { node: isDataMapper ? 'DATA_MAPPER_DEFINITION' : 'FUNCTION_DEFINITION' },
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
        if (isDataMapper) {
            functionNodeCopy.codedata.node = "DATA_MAPPER_DEFINITION";
        }
        console.log("Updated function node: ", functionNodeCopy);
        await rpcClient.getBIDiagramRpcClient().getSourceCode({ filePath, flowNode: functionNodeCopy, isFunctionNodeUpdate: true });
    };

    return (
        <View>
            <ViewContent padding>
                <BIHeader />
                <Container>
                    <Typography variant="h2">{functionName ? `Edit Function` : `Create New Function`}</Typography>
                    <BodyText>
                        {functionName ? `Edit the` : `Define a`} function that can be used within the integration.
                    </BodyText>
                    <FormContainer>
                        {filePath &&
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
