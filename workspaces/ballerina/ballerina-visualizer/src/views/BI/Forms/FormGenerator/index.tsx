/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { useEffect, useState } from "react";
import { EVENT_TYPE, FlowNode, LineRange, NodePosition, SubPanel, VisualizerLocation, FormDiagnostics, HelperPaneData } from "@wso2-enterprise/ballerina-core";
import { FormField, FormValues, Form, ExpressionFormField } from "@wso2-enterprise/ballerina-side-panel";
import {
    convertNodePropertiesToFormFields,
    enrichFormPropertiesWithValueConstraint,
    getFormProperties,
    updateNodeProperties,
} from "../../../../utils/bi";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import { RecordEditor } from "../../../RecordEditor/RecordEditor";
import { RemoveEmptyNodesVisitor, traverseNode } from "@wso2-enterprise/bi-diagram";
import IfForm from "../IfForm";
import { CompletionItem } from "@wso2-enterprise/ui-toolkit";

interface FormProps {
    fileName: string;
    node: FlowNode;
    nodeFormTemplate?: FlowNode; // used in edit forms
    connections?: FlowNode[];
    clientName?: string;
    targetLineRange: LineRange;
    projectPath?: string;
    editForm?: boolean;
    onSubmit: (node?: FlowNode, isDataMapper?: boolean) => void;
    isActiveSubPanel?: boolean;
    openSubPanel?: (subPanel: SubPanel) => void;
    expressionEditor?: {
        variableInfo: HelperPaneData;
        functionInfo: HelperPaneData;
        libraryBrowserInfo: HelperPaneData;
        completions: CompletionItem[];
        triggerCharacters: readonly string[];
        retrieveCompletions: (
            value: string,
            offset: number,
            triggerCharacter?: string,
            onlyVariables?: boolean
        ) => Promise<void>;
        retrieveVisibleTypes: (value: string, cursorPosition: number) => Promise<void>;
        extractArgsFromFunction: (value: string, cursorPosition: number) => Promise<{
            label: string;
            args: string[];
            currentArgIndex: number;
        }>;
        getExpressionDiagnostics?: (
            showDiagnostics: boolean,
            expression: string,
            key: string,
            setDiagnosticsInfo: (diagnostics: FormDiagnostics) => void,
            shouldUpdateNode?: boolean,
            variableType?: string
        ) => Promise<void>;
        getHelperPaneData?: (type: string, filterText: string) => Promise<void>;
        onCompletionSelect: (value: string) => Promise<void>;
        onCancel: () => void;
        onBlur: () => void;
    };
    updatedExpressionField?: ExpressionFormField;
    resetUpdatedExpressionField?: () => void;
}

export function FormGenerator(props: FormProps) {
    const {
        fileName,
        node,
        nodeFormTemplate,
        connections,
        clientName,
        targetLineRange,
        projectPath,
        editForm,
        onSubmit,
        openSubPanel,
        isActiveSubPanel,
        expressionEditor,
        updatedExpressionField,
        resetUpdatedExpressionField,
    } = props;

    const { rpcClient } = useRpcContext();

    const [fields, setFields] = useState<FormField[]>([]);
    const [showRecordEditor, setShowRecordEditor] = useState(false);

    useEffect(() => {
        if (node.codedata.node === "IF") {
            return;
        }
        initForm();
    }, [node]);

    const initForm = () => {
        const formProperties = getFormProperties(node);
        let enrichedNodeProperties;
        if (nodeFormTemplate) {
            const formTemplateProperties = getFormProperties(nodeFormTemplate);
            enrichedNodeProperties = enrichFormPropertiesWithValueConstraint(formProperties, formTemplateProperties);
            console.log(">>> Form properties", { formProperties, formTemplateProperties, enrichedNodeProperties });
        }
        if (Object.keys(formProperties).length === 0) {
            // update node position
            node.codedata.lineRange = {
                ...targetLineRange,
                fileName: fileName,
            };
            // add node to source code
            onSubmit();
            return;
        }

        // hide connection property if node is a REMOTE_ACTION_CALL or RESOURCE_ACTION_CALL node
        if (node.codedata.node === "REMOTE_ACTION_CALL" || node.codedata.node === "RESOURCE_ACTION_CALL") {
            if (enrichedNodeProperties) {
                enrichedNodeProperties.connection.optional = true;
            } else {
                formProperties.connection.optional = true;
            }
        }

        // get node properties
        setFields(convertNodePropertiesToFormFields(enrichedNodeProperties || formProperties, connections, clientName));
    };

    const handleOnSubmit = (data: FormValues) => {
        console.log(">>> on form generator submit", data);
        if (node && targetLineRange) {
            let updatedNode: FlowNode = {
                ...node,
                codedata: {
                    ...node.codedata,
                    lineRange: {
                        ...node.codedata.lineRange,
                        startLine: targetLineRange.startLine,
                        endLine: targetLineRange.endLine,
                    },
                },
            };

            // assign to a existing variable
            if ("update-variable" in data) {
                data["variable"] = data["update-variable"];
                data["type"] = "";
            }

            if (node.branches?.at(0)?.properties) {
                // branch properties
                // TODO: Handle multiple branches
                const updatedNodeProperties = updateNodeProperties(data, node.branches.at(0).properties);
                updatedNode.branches.at(0).properties = updatedNodeProperties;
            } else if (node.properties) {
                // node properties
                const updatedNodeProperties = updateNodeProperties(data, node.properties);
                updatedNode.properties = updatedNodeProperties;
            } else {
                console.error(">>> Error updating source code. No properties found");
            }
            console.log(">>> Updated node", updatedNode);

            // check all nodes and remove empty nodes
            const removeEmptyNodeVisitor = new RemoveEmptyNodesVisitor(updatedNode);
            traverseNode(updatedNode, removeEmptyNodeVisitor);
            const updatedNodeWithoutEmptyNodes = removeEmptyNodeVisitor.getNode();

            const isDataMapperFormUpdate = data["isDataMapperFormUpdate"];

            onSubmit(updatedNodeWithoutEmptyNodes, isDataMapperFormUpdate);
        }
    };

    const handleOpenView = async (filePath: string, position: NodePosition) => {
        console.log(">>> open view: ", { filePath, position });
        const context: VisualizerLocation = {
            documentUri: filePath,
            position: position,
        };
        await rpcClient.getVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: context });
    };

    const handleOpenRecordEditor = (isOpen: boolean, f: FormValues) => {
        // Get f.value and assign that value to field value
        const updatedFields = fields.map((field) => {
            const updatedField = { ...field };
            if (f[field.key]) {
                updatedField.value = f[field.key];
            }
            return updatedField;
        });
        setFields(updatedFields);
        setShowRecordEditor(isOpen);
    };

    // handle if node form
    if (node.codedata.node === "IF") {
        return <IfForm
            fileName={fileName}
            node={node}
            targetLineRange={targetLineRange}
            onSubmit={onSubmit}
            openSubPanel={openSubPanel}
            updatedExpressionField={updatedExpressionField}
            isActiveSubPanel={isActiveSubPanel}
            resetUpdatedExpressionField={resetUpdatedExpressionField}
        />;
    }

    // default form
    return (
        <>
            {fields && fields.length > 0 && (
                <Form
                    formFields={fields}
                    projectPath={projectPath}
                    selectedNode={node.codedata.node}
                    openRecordEditor={handleOpenRecordEditor}
                    onSubmit={handleOnSubmit}
                    openView={handleOpenView}
                    openSubPanel={openSubPanel}
                    isActiveSubPanel={isActiveSubPanel}
                    expressionEditor={expressionEditor}
                    targetLineRange={targetLineRange}
                    fileName={fileName}
                    updatedExpressionField={updatedExpressionField}
                    resetUpdatedExpressionField={resetUpdatedExpressionField}
                />
            )}
            {showRecordEditor && (
                <RecordEditor
                    fields={fields}
                    isRecordEditorOpen={showRecordEditor}
                    onClose={() => setShowRecordEditor(false)}
                    updateFields={(updatedFields) => setFields(updatedFields)}
                    rpcClient={rpcClient}
                />
            )}
        </>
    );
}

export default FormGenerator;
