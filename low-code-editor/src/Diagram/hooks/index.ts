import React, { useContext } from "react";

import { STKindChecker, STNode } from "@ballerina/syntax-tree";

import { Context } from "../../Contexts/Diagram";
import { SelectedPosition } from "../../types";

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