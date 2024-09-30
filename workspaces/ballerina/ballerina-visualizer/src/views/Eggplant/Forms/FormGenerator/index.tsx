/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { useEffect, useState } from "react";
import { EVENT_TYPE, FlowNode, LineRange, NodePosition, VisualizerLocation } from "@wso2-enterprise/ballerina-core";
import { FormField, FormValues, Form } from "@wso2-enterprise/ballerina-side-panel";
import {
    convertNodePropertiesToFormFields,
    enrichFormPropertiesWithValueConstraint,
    getFormProperties,
    updateNodeProperties,
} from "../../../../utils/eggplant";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import { RecordEditor } from "../../../RecordEditor/RecordEditor";

interface FormProps {
    node: FlowNode;
    nodeFormTemplate?: FlowNode; // used in edit forms
    connections?: FlowNode[];
    clientName?: string;
    targetLineRange: LineRange;
    projectPath?: string;
    onSubmit: (node?: FlowNode) => void;
}

export function FormGenerator(props: FormProps) {
    const { node, nodeFormTemplate, connections, clientName, targetLineRange, projectPath, onSubmit } = props;

    const { rpcClient } = useRpcContext();

    const [fields, setFields] = useState<FormField[]>([]);
    const [showRecordEditor, setShowRecordEditor] = useState(false);

    useEffect(() => {
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
            // add node to source code
            onSubmit();
            return;
        }
        // get node properties
        setFields(convertNodePropertiesToFormFields(enrichedNodeProperties || formProperties, connections, clientName));
    };

    const handleOnSubmit = (data: FormValues) => {
        console.log(">>> on form submit", data);
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
            onSubmit(updatedNode);
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
