/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import {
    Category as PanelCategory,
    Node as PanelNode,
    Item as PanelItem,
    FormField,
    FormValues,
} from "@wso2-enterprise/ballerina-side-panel";
import { AddNodeVisitor, RemoveNodeVisitor, NodeIcon, traverseFlow } from "@wso2-enterprise/bi-diagram";
import {
    Category,
    AvailableNode,
    NodeProperties,
    NodePropertyKey,
    FlowNode,
    Property,
    Flow,
    Branch,
    LineRange,
    ExpressionCompletionItem,
    TriggerModel,
    FunctionField
    SignatureHelpResponse
} from "@wso2-enterprise/ballerina-core";
import { SidePanelView } from "../views/BI/FlowDiagram";
import React from "react";
import { cloneDeep } from "lodash";
import { COMPLETION_ITEM_KIND, CompletionItem, CompletionItemKind } from "@wso2-enterprise/ui-toolkit";

function convertAvailableNodeToPanelNode(node: AvailableNode): PanelNode {
    return {
        id: node.codedata.node,
        label: node.metadata.label,
        description: node.metadata.description,
        enabled: node.enabled,
        metadata: node,
        icon: <NodeIcon type={node.codedata.node} />,
    };
}

function convertDiagramCategoryToSidePanelCategory(category: Category): PanelCategory {
    const items: PanelItem[] = category.items?.map((item) => {
        if ("codedata" in item) {
            return convertAvailableNodeToPanelNode(item as AvailableNode);
        } else {
            return convertDiagramCategoryToSidePanelCategory(item as Category);
        }
    });

    // HACK: use the icon of the first item in the category
    const icon = category.items.at(0)?.metadata.icon;

    return {
        title: category.metadata.label,
        description: category.metadata.description,
        icon: icon ? <img src={icon} alt={category.metadata.label} style={{ width: "20px" }} /> : undefined,
        items: items,
    };
}

export function convertBICategoriesToSidePanelCategories(categories: Category[]): PanelCategory[] {
    const panelCategories = categories.map(convertDiagramCategoryToSidePanelCategory);
    const connectorCategory = panelCategories.find((category) => category.title === "Connections");
    if (connectorCategory && !connectorCategory.items.length) {
        connectorCategory.description = "No connections available. Click below to add a new connector.";
    }
    return panelCategories;
}

export function convertFunctionCategoriesToSidePanelCategories(categories: Category[]): PanelCategory[] {
    const panelCategories = categories.map(convertDiagramCategoryToSidePanelCategory);
    const functionCategory = panelCategories.find((category) => category.title === "Project")
    if (functionCategory && !functionCategory.items.length) {
        functionCategory.description = "No functions defined. Click below to create a new function.";
    }
    return panelCategories;
}

export function convertNodePropertiesToFormFields(
    nodeProperties: NodeProperties,
    connections?: FlowNode[],
    clientName?: string
): FormField[] {
    const formFields: FormField[] = [];

    for (const key in nodeProperties) {
        if (nodeProperties.hasOwnProperty(key)) {
            const expression = nodeProperties[key as NodePropertyKey];
            if (expression) {
                const formField: FormField = convertNodePropertyToFormField(key, expression, connections, clientName);
                formFields.push(formField);
            }
        }
    }

    return formFields;
}

export function convertNodePropertyToFormField(
    key: string,
    property: Property,
    connections?: FlowNode[],
    clientName?: string
): FormField {
    const formField: FormField = {
        key,
        label: property.metadata?.label || "",
        type: property.valueType,
        optional: property.optional,
        editable: isFieldEditable(property, connections, clientName),
        documentation: property.metadata?.description || "",
        value: getFormFieldValue(property, clientName),
        items: getFormFieldItems(property, connections),
    };
    return formField;
}

function isFieldEditable(expression: Property, connections?: FlowNode[], clientName?: string) {
    if (
        connections &&
        clientName &&
        expression.valueType === "Identifier" &&
        expression.metadata.label === "Connection"
    ) {
        return false;
    }
    return expression.editable;
}

function getFormFieldValue(expression: Property, clientName?: string) {
    if (clientName && expression.valueType === "Identifier" && expression.metadata.label === "Connection") {
        console.log(">>> client name as set field value", clientName);
        return clientName;
    }
    return expression.value;
}

function getFormFieldItems(expression: Property, connections: FlowNode[]) {
    if (expression.valueType === "Identifier" && expression.metadata.label === "Connection") {
        return connections.map((connection) => connection.properties?.variable?.value);
    } else if (expression.valueType === "MULTIPLE_SELECT" || expression.valueType === "SINGLE_SELECT") {
        return expression.valueTypeConstraint;
    }
    return undefined;
}

export function getFormProperties(flowNode: FlowNode): NodeProperties {
    if (flowNode.properties) {
        return flowNode.properties;
    }

    if (flowNode.branches?.at(0)?.properties) {
        // TODO: Handle multiple branches
        return flowNode.branches.at(0).properties;
    }

    return {};
}

export function updateNodeProperties(values: FormValues, nodeProperties: NodeProperties): NodeProperties {
    const updatedNodeProperties: NodeProperties = { ...nodeProperties };

    for (const key in values) {
        if (values.hasOwnProperty(key) && updatedNodeProperties.hasOwnProperty(key)) {
            const expression = updatedNodeProperties[key as NodePropertyKey];
            if (expression) {
                expression.value = expression.valueType === "MULTIPLE_SELECT" ? [values[key]] : values[key];
            }
        }
    }

    return updatedNodeProperties;
}

export function getContainerTitle(view: SidePanelView, activeNode: FlowNode, clientName?: string): string {
    switch (view) {
        case SidePanelView.NODE_LIST:
            return ""; // Show switch instead of title
        case SidePanelView.FORM:
            if (activeNode.codedata?.node === "ACTION_CALL") {
                return `${clientName || activeNode.properties.connection.value} → ${activeNode.metadata.label}`;
            }
            return `${activeNode.codedata?.module ? activeNode.codedata?.module + " :" : ""} ${activeNode.metadata.label
                }`;
        default:
            return "";
    }
}

export function addDraftNodeToDiagram(flowModel: Flow, parent: FlowNode | Branch, target: LineRange) {
    const newFlowModel = cloneDeep(flowModel);
    console.log(">>> addDraftNodeToDiagram", { newFlowModel, parent, target });

    const draftNode: FlowNode = {
        id: "draft",
        metadata: {
            label: "Draft",
            description: "Draft Node",
        },
        codedata: {
            node: "DRAFT",
            lineRange: {
                fileName: newFlowModel.fileName,
                ...target,
            },
        },
        branches: [],
        returning: false,
    };

    const addNodeVisitor = new AddNodeVisitor(newFlowModel, parent as FlowNode, draftNode);
    traverseFlow(newFlowModel, addNodeVisitor);
    const newFlow = addNodeVisitor.getUpdatedFlow();
    console.log(">>> new model with draft node", { newFlow });
    return newFlow;
}

export function removeDraftNodeFromDiagram(flowModel: Flow) {
    const newFlowModel = cloneDeep(flowModel);
    const draftNodeId = "draft";
    console.log(">>> removeDraftNodeFromDiagram", newFlowModel, draftNodeId);
    const removeNodeVisitor = new RemoveNodeVisitor(newFlowModel, draftNodeId);
    traverseFlow(newFlowModel, removeNodeVisitor);
    const newFlow = removeNodeVisitor.getUpdatedFlow();
    return newFlow;
}

export function enrichFormPropertiesWithValueConstraint(
    formProperties: NodeProperties,
    formTemplateProperties: NodeProperties
) {
    const enrichedFormProperties = cloneDeep(formProperties);

    for (const key in formTemplateProperties) {
        if (formTemplateProperties.hasOwnProperty(key)) {
            const expression = formTemplateProperties[key as NodePropertyKey];
            if (expression) {
                const valConstraint = formTemplateProperties[key as NodePropertyKey]?.valueTypeConstraint;
                if (valConstraint && enrichedFormProperties[key as NodePropertyKey]) {
                    enrichedFormProperties[key as NodePropertyKey].valueTypeConstraint = valConstraint;
                }
            }
        }
    }

    return enrichedFormProperties;
}

export function convertBalCompletion(completion: ExpressionCompletionItem): CompletionItem {
    const labelArray = completion.label.split("/");
    const tag = labelArray.length > 1 ? labelArray.slice(0, -1).join("/") : undefined;
    const label = labelArray[labelArray.length - 1];
    const kind = completion.detail.split(/(?=[A-Z])/).map(word => word.toLowerCase()).join('-') as CompletionItemKind;
    const value = completion.filterText ?? completion.insertText;
    const description = completion.detail;
    const sortText = completion.sortText;

    return {
        tag,
        label,
        value,
        description,
        kind,
        sortText
    }
}

// TRIGGERS RELATED HELPERS
export function convertTriggerListenerConfig(trigger: TriggerModel): FormField[] {
    const formFields: FormField[] = [];

    for (const key in trigger.listener) {
        if (trigger.listener.hasOwnProperty(key)) {
            const expression = trigger.listener[key];
            const formField: FormField = {
                key: key,
                label: key.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, str => str.toUpperCase()),
                documentation: expression.description,
                optional: !expression.required,
                type: expression.type,
                editable: true,
                value: expression.value
            }
            formFields.push(formField);
        }
    }

    return formFields;
}

export function convertTriggerServiceConfig(trigger: TriggerModel): FormField[] {
    const formFields: FormField[] = [];
    const formField: FormField = {
        key: "basePath",
        label: "Base Path",
        documentation: trigger.service.basePath.description,
        optional: false,
        type: "string",
        editable: true,
        value: trigger.service.basePath.value
    }
    if (trigger.service.basePath.required) {
        formFields.push(formField);
    }
    return formFields;
}

export function convertTriggerFunctionsConfig(trigger: TriggerModel): Record<string, FunctionField> {
    const response: Record<string, FunctionField> = {};
    for (const key in trigger.service.functions) {
        const triggerFunction = trigger.service.functions[key];
        const formFields: FormField[] = [];
        if (trigger.service.functions.hasOwnProperty(key)) {
            for (const param in triggerFunction.params) {
                const expression = triggerFunction.params[param];
                const formField: FormField = {
                    key: param,
                    label: param.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, str => str.toUpperCase()),
                    documentation: expression?.description,
                    optional: !expression?.required,
                    type: expression?.type,
                    editable: true,
                    value: expression.value
                }
                formFields.push(formField);
            }
        }
        response[key] = { checked: triggerFunction.required, required: triggerFunction.required, fields: formFields };
    }
    console.log("xxx", response);
    return response;
}
export function convertToFnSignature(signatureHelp: SignatureHelpResponse) {
    const fnText = signatureHelp.signatures[0].label;
    const fnRegex = /^(?<label>[a-zA-Z0-9_']+)\((?<args>.*)\)$/;
    const fnMatch = fnText.match(fnRegex);

    if (!fnMatch) {
        return undefined;
    }
    const label = fnMatch.groups?.label;
    const args = fnMatch.groups?.args.split(",").map((arg) => arg.trim());

    return {
        label,
        args,
        currentArgIndex: signatureHelp.activeParameter
    }
}

export function convertToVisibleTypes(visibleTypes: string[]): CompletionItem[] {
    return visibleTypes.map((type) => ({
        label: type,
        description: `Type: ${type}`,
        value: type,
        kind: COMPLETION_ITEM_KIND.TypeParameter
    }));
}
