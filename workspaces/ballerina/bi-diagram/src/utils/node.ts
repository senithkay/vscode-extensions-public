/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Branch, FlowNode } from "./types";

export function getNodeIdFromModel(node: FlowNode, prefix?: string) {
    if (!node) {
        return null;
    }
    if (prefix) {
        return `${prefix}-${node.id}`;
    }
    return node.id;
}

export function getBranchLabel(branch: Branch): string {
    return branch.properties?.condition?.value?.toString().trim() || branch.label;
}

export function getBranchId(nodeId: string, branchLabel: string, branchIndex: number) {
    return `${nodeId}-${branchLabel}-branch-${branchIndex}`;
}

export function getBranchInLinkId(nodeId: string, branchLabel: string, branchIndex: number) {
    return `${nodeId}-${branchLabel}-branch-${branchIndex}-in-link`;
}

export function nodeHasError(node: FlowNode) {
    if (!node) {
        return false;
    }

    // Check branch properties
    if (node.branches) {
        return node.branches.some((branch) => {
            if (!branch.properties) {
                return false;
            }
            return Object.values(branch.properties).some((property) =>
                property?.diagnostics?.diagnostics?.some((diagnostic) => diagnostic.severity === "ERROR")
            );
        });
    }

    // Check properties
    if (node.properties) {
        const hasPropertyError = Object.values(node.properties).some((property) =>
            property?.diagnostics?.diagnostics?.some((diagnostic) => diagnostic.severity === "ERROR")
        );
        if (hasPropertyError) {
            return true;
        }
    }

    return false;
}
