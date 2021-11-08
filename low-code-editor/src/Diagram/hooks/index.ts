import React, { useCallback, useContext, useState } from "react";

import { STKindChecker, STNode } from "@ballerina/syntax-tree";

import { Context } from "../../Contexts/Diagram";
import { SelectedPosition } from "../../types";

/**
 * A custom hook for diagram components which returns a boolean indicating if a given
 * STNode is the one which is selected for viewing in diagram navigator (eg: tree view
 * in vscode or breadcrumbs).
 * Additonaly, it knows how to scroll into the diagram for the given node, if a ref
 * object for the container is provided.
 *
 * @param node STNode to check against.
 * @param containerRef Container ref to scroll to, if the passed node is selected.
 * @returns Returns true if the passed node is the currently selected node for viewing
 */
export function useSelectedStatus(node: STNode, containerRef?: React.MutableRefObject<any>): boolean {
    const {
        props: { selectedPosition }
    } = useContext(Context)
    const [isSelected, setSelected] = React.useState(isNodeSelected(selectedPosition, node));

    React.useEffect(() => {
        const selected = isNodeSelected(selectedPosition, node);
        setSelected(selected);
        if (selected && containerRef) {
            containerRef.current.scrollIntoView();
        }
    }, [selectedPosition, node])
    return isSelected;
}

export function isNodeSelected(selectedPosition: SelectedPosition, node: STNode): boolean {
    if (STKindChecker.isFunctionDefinition(node) || STKindChecker.isResourceAccessorDefinition(node)) {
        return selectedPosition.startLine === node.functionName.position?.startLine
        && selectedPosition.startColumn === node.functionName.position?.startColumn;
    } else if (STKindChecker.isServiceDeclaration(node)) {
        // check if the selected node is a member of the service
        const selectedMembers = node.members.filter((memberNode) => isNodeSelected(selectedPosition, memberNode));
        return selectedMembers && selectedMembers.length > 0;
    } else {
        return selectedPosition.startLine === node.position?.startLine
        && selectedPosition.startColumn === node.position?.startColumn;
    }
}

export function useOverlayRef(): [
    HTMLDivElement,
    (node: HTMLDivElement) => void] {
    const [overlayDiv, setOverlayDiv] = useState<HTMLDivElement>(undefined);
    const ref = useCallback(node => {
        if (node !== null) {
            setOverlayDiv(node);
        }
    }, []);
    return [overlayDiv, ref];
}
