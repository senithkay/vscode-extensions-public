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
import { STNode, Visitor } from "@wso2-enterprise/syntax-tree";
import { isPositionsEquals } from "../utils";


class NextNodeSetupVisitor implements Visitor {
    private nextNode: STNode = null;
    private previousNode: STNode = null;
    private currentNode: STNode = null;
    private isCurrentNodeReached: boolean = false

    public beginVisitSTNode(node: STNode, parent?: STNode) {
        if (this.currentNode && isPositionsEquals(this.currentNode.position, node.position)){
            this.isCurrentNodeReached = true;
        }
        if ( !this.isCurrentNodeReached){
            this.previousNode = node;
        }
    }

    public endVisitSTNode(node: STNode, parent?: STNode){
        if (this.isCurrentNodeReached && !isPositionsEquals(this.currentNode.position, node.position) && !this.nextNode ){

            this.nextNode = node;
        }
    }

    setPropetiesDefault(): void {
        this.nextNode = null;
        this.previousNode = null;
        this.currentNode = null;
        this.isCurrentNodeReached = false;
   }

   setCurrentNode(currentNode: STNode){
       this.currentNode = currentNode
   }

   getPreviousNode(): STNode {

       return this.previousNode? this.previousNode : this.currentNode;
   }

   getNextNode(): STNode {

    return this.nextNode? this.nextNode : this.currentNode;
}


}

export const nextNodeSetupVisitor = new NextNodeSetupVisitor();
