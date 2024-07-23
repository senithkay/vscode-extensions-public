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
import { Category, AvailableNode, NodeProperties, NodePropertyKey } from "@wso2-enterprise/ballerina-core";
import { SidePanelView } from "./../views/EggplantDiagram";

function convertAvailableNodeToPanelNode(node: AvailableNode): PanelNode {
    return {
        id: node.id.kind,
        label: node.name,
        description: node.description,
        enabled: node.enabled,
        metadata: node,
    };
}

function convertDiagramCategoryToSidePanelCategory(category: Category): PanelCategory {
    const items: PanelItem[] = category.items.map((item) => {
        if ("id" in item) {
            return convertAvailableNodeToPanelNode(item as AvailableNode);
        } else {
            return convertDiagramCategoryToSidePanelCategory(item as Category);
        }
    });

    return {
        title: category.name,
        description: category.description,
        items: items,
    };
}

export function convertEggplantCategoriesToSidePanelCategories(categories: Category[]): PanelCategory[] {
    return categories.map(convertDiagramCategoryToSidePanelCategory);
}

export function convertNodePropertiesToFormFields(nodeProperties: NodeProperties): FormField[] {
    const formFields: FormField[] = [];

    for (const key in nodeProperties) {
        if (nodeProperties.hasOwnProperty(key)) {
            const expression = nodeProperties[key as NodePropertyKey];
            if (expression) {
                const formField: FormField = {
                    key,
                    label: expression.label,
                    type: expression.type,
                    optional: expression.optional,
                    editable: expression.editable,
                    documentation: expression.documentation,
                    value: expression.value,
                };
                formFields.push(formField);
            }
        }
    }

    return formFields;
}

export function updateNodeProperties(values: FormValues, nodeProperties: NodeProperties): NodeProperties {
    const updatedNodeProperties: NodeProperties = { ...nodeProperties };

    for (const key in values) {
        if (values.hasOwnProperty(key) && updatedNodeProperties.hasOwnProperty(key)) {
            const expression = updatedNodeProperties[key as NodePropertyKey];
            if (expression) {
                expression.value = values[key];
            }
        }
    }

    return updatedNodeProperties;
}

export function getContainerTitle(view: SidePanelView): string {
    switch (view) {
        case SidePanelView.NODE_LIST:
            return "Add Node";
        case SidePanelView.FORM:
            return "Node Properties";
        default:
            return "";
    }
}
