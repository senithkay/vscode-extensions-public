/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */
import {
    BinaryExpression,
    ListConstructor,
    MappingConstructor,
    NodePosition,
    STKindChecker,
    STNode,
    traversNode,
    Visitor,
} from "@wso2-enterprise/syntax-tree";
import { isPositionsEquals } from "../../../utils/st-utils";
const { isSpecificField, isMappingConstructor, isCommaToken, isFieldAccess } = STKindChecker;

export class LinkDeletingVisitor implements Visitor {
    /** NodePosition of the specific field or mapping construct that needs to be removed */
    private fieldPosition: NodePosition;
    /** Node of the root level mapping construct which will be traversed to find the delete position */
    private rootMapConstruct: STNode;
    /** Node position that needs to be removed when deleting a link in a mapping construct */
    private deletePosition: NodePosition;

    /**
     * Visitor to traverse and identify the delete position when deleting a link
     * @param fieldPosition NodePosition of the specific field or mapping construct that needs to be removed
     * @param rootMapConstruct Node of the root level mapping construct
     */
    constructor(fieldPosition: NodePosition, rootMapConstruct: STNode) {
        this.fieldPosition = fieldPosition;
        this.rootMapConstruct = rootMapConstruct;
        this.deletePosition = null;
    }

    public beginVisitMappingConstructor(node: MappingConstructor) {
        this.findDeletePosition(node, false);
    }

    public beginVisitListConstructor(node: ListConstructor): void {
        for (const item of node.expressions) {
            if (isMappingConstructor(item)) {
                this.findDeletePosition(item, true);
            }
        }
    }

    public beginVisitBinaryExpression(node: BinaryExpression): void {
        if (this.deletePosition === null) {
            // LHS could be another binary expression or field access node
            // RHS is always field access node
    
            if(node.lhsExpr && isFieldAccess(node.lhsExpr) && isPositionsEquals(this.fieldPosition, node.lhsExpr.position)){
                // If LHS is a field access node to be deleted
                // Then also delete the operator right to it
                this.deletePosition = {
                    ...node.lhsExpr.position,
                    endLine: node.operator.position?.endLine,
                    endColumn: node.operator.position?.endColumn,
                }
            }else if(node.rhsExpr && isFieldAccess(node.rhsExpr) && isPositionsEquals(this.fieldPosition, node.rhsExpr.position)){
                // If RHS is a field access node to be deleted
                // Then also delete the operator left to it
                this.deletePosition = {
                    ...node.rhsExpr.position,
                    startLine: node.operator.position?.startLine,
                    startColumn: node.operator.position?.startColumn,
                }
            }
        }
    }

    /**
     * Traverse and find the position that needs to be removed
     * @param node Mapping constructor node which will be checked for the item to delete
     * @param isChildOfList Is mapping constructor, a child of a list constructor
     */
    private findDeletePosition(node: MappingConstructor, isChildOfList: boolean) {
        if (this.deletePosition === null) {
            const deleteIndex = node.fields.findIndex((field: STNode) => {
                if (isSpecificField(field) && isMappingConstructor(field.valueExpr)) {
                    // If its a nested map constructor, then compare with the value expression position
                    return isPositionsEquals(this.fieldPosition, field.valueExpr.position);
                } else {
                    // Else if its a normal field access elements
                    return isPositionsEquals(this.fieldPosition, field.position);
                }
            });

            if (deleteIndex !== -1) {
                /** Field to be deleted */
                const selected = node.fields[deleteIndex];
                /** Comma element prior to the link to be deleted */
                const previous = node.fields[deleteIndex - 1];
                /** Comma element after to the link to be deleted */
                const next = node.fields[deleteIndex + 1];
                /** Is field, the last element in the mapping construct */
                const isLastElement = deleteIndex + 1 === node.fields.length;

                let updatedDeletePosition = this.fieldPosition;
                if (isSpecificField(selected) && isMappingConstructor(selected.valueExpr)) {
                    // If its a nested map constructor, then select the delete position as the selected node position
                    updatedDeletePosition = selected.position;
                }

                if (node.fields.length === 1) {
                    // If only one element in the construct (Could be a root level or sub level map construct)
                    if (isPositionsEquals(node.position, this.rootMapConstruct.position) || isChildOfList) {
                        // If only single element in the root level mapping, then only delete that link
                        // Or if the last element is within a mapping construct which is within a list constructor
                        this.deletePosition = updatedDeletePosition;
                    } else {
                        // if there's only a single element in a sub level record mapping
                        // Then, will need to delete record mapping construct element itself
                        // Therefore rerunning the same visitor with the parent record map as the one to delete
                        const linkDeleteVisitor = new LinkDeletingVisitor(node.position, this.rootMapConstruct);
                        traversNode(this.rootMapConstruct, linkDeleteVisitor);
                        this.deletePosition = linkDeleteVisitor.getPositionToDelete();
                    }
                } else if (previous && isCommaToken(previous) && isLastElement) {
                    // if its the last element, need to delete previous comma as well
                    this.deletePosition = {
                        ...updatedDeletePosition,
                        startLine: previous.position?.startLine,
                        startColumn: previous.position?.startColumn,
                    };
                } else if (next && isCommaToken(next)) {
                    // When there are multiple mappings and user tries to delete a link other than the last one
                    // Then, will need to delete the next comma node as well
                    this.deletePosition = {
                        ...updatedDeletePosition,
                        endLine: next.position?.endLine,
                        endColumn: next.position?.endColumn,
                    };
                }
            }
        }
    }

    /** Get the Node position to be removed when deleting a link in a mapping construct */
    getPositionToDelete(): NodePosition {
        return this.deletePosition;
    }
}
