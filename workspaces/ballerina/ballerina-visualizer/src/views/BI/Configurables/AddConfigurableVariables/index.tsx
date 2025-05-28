/* eslint-disable react-hooks/exhaustive-deps */
/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { useEffect, useState } from "react";
import { FlowNode } from '@wso2-enterprise/ballerina-core';
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import { PanelContainer } from '@wso2-enterprise/ballerina-side-panel';
import FormGenerator from '../../Forms/FormGenerator';

export interface ConfigFormProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    filename: string;
    packageName: string;
    moduleName: string;
}

export function AddForm(props: ConfigFormProps) {
    const { isOpen, onClose, title, filename } = props;
    const { rpcClient } = useRpcContext();
    const [configVarNode, setCofigVarNode] = useState<FlowNode>();

    useEffect(() => {
        const fetchNode = async () => {
            const node = await rpcClient.getBIDiagramRpcClient().getConfigVariableNodeTemplate({
                position: { line: 0, offset: 0 },
                filePath: filename,
                id: {
                    "node": "CONFIG_VARIABLE",
                    "isNew": true,
                    "lineRange": {
                        "fileName": "config.bal",
                        "startLine": {
                            "line": 0,
                            "offset": 0
                        },
                        "endLine": {
                            "line": 0,
                            "offset": 0
                        }
                    }
                }
            });
            setCofigVarNode(node.flowNode);
        };

        fetchNode();
    }, []);

    const handleSave = async (node: FlowNode) => {

        await rpcClient.getBIDiagramRpcClient().updateConfigVariablesV2({
            configFilePath: props.filename,
            configVariable: node,
            packageName: props.packageName,
            moduleName: props.moduleName,
        }).then((response: any) => {
            console.log(">>> Config variables------", response);
        }).finally(() => {
            if (onClose) {
                onClose();
            }
        });
    
    };

    return (
        <>
            <PanelContainer
                title={title}
                show={isOpen}
                onClose={onClose}
            >
                {configVarNode && (
                    <FormGenerator
                        fileName={filename}
                        node={configVarNode}
                        targetLineRange={{
                            startLine: configVarNode.codedata?.lineRange?.startLine ?? { line: 0, offset: 0 },
                            endLine: configVarNode.codedata?.lineRange?.endLine ?? { line: 0, offset: 0 }
                        }}
                        onSubmit={handleSave}
                    />
                )}
            </PanelContainer>
        </>
    );
}

export default AddForm;
