/*
 * Copyright (c) 2023, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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

import { DotToken, FunctionDefinition, IdentifierToken, NodePosition, ResourceAccessorDefinition, ResourcePathRestParam, ResourcePathSegmentParam, ServiceDeclaration, SlashToken, STKindChecker, STNode, Visitor } from "@wso2-enterprise/syntax-tree";

import { generateResourcePathString, isPositionEqual } from "./util";

export const MODULE_DELIMETER = '#';
export const SUB_DELIMETER = '%%';

export enum ELEMENT_KEYWORDS {
    SERVICE = 'service',
    FUNCTION = 'function',
    RESOURCE = 'resource'
}

export class UIDGenerationVisitor implements Visitor {
    private position: NodePosition;
    private uid: string;
    private stack: string[];
    private moduleServiceIndex: number;
    private moduleFunctionIndex: number;


    constructor(position: NodePosition) {
        this.stack = [];
        this.position = position;
        this.moduleServiceIndex = 0;
        this.moduleFunctionIndex = 0;
    }

    beginVisitServiceDeclaration(node: ServiceDeclaration): void {
        this.moduleServiceIndex++;
        this.stack.push(`${ELEMENT_KEYWORDS.SERVICE}${SUB_DELIMETER}${this.moduleServiceIndex}`);

        if (isPositionEqual(node.position, this.position)) {
            this.setUId();
        }
    }

    endVisitServiceDeclaration(node: ServiceDeclaration, parent?: STNode): void {
        this.stack.pop();
    }


    beginVisitFunctionDefinition(node: FunctionDefinition, parent?: STNode): void {
        if (parent && STKindChecker.isModulePart(parent)) {
            this.moduleFunctionIndex++;
            this.stack.push(`${ELEMENT_KEYWORDS.FUNCTION}${SUB_DELIMETER}${this.moduleFunctionIndex}`);
        } else {
            this.stack.push(`${ELEMENT_KEYWORDS.FUNCTION}${SUB_DELIMETER}${node.functionName.value}`);
        }

        if (isPositionEqual(node.position, this.position)) {
            this.setUId();
        }
    }

    endVisitFunctionDefinition(node: FunctionDefinition, parent?: STNode): void {
        this.stack.pop();
    }

    beginVisitResourceAccessorDefinition(node: ResourceAccessorDefinition, parent?: STNode): void {
        const id: string = `${ELEMENT_KEYWORDS.RESOURCE}${SUB_DELIMETER}${node.functionName.value}`;

        if (node.relativeResourcePath.length > 0) {
            id.concat(`${SUB_DELIMETER}${generateResourcePathString(node.relativeResourcePath)}`);
        }

        if (isPositionEqual(node.position, this.position)) {
            this.setUId();
        }
    }

    endVisitResourceAccessorDefinition(node: ResourceAccessorDefinition, parent?: STNode): void {
        this.stack.pop();
    }

    private setUId(): void {
        this.uid = this.stack.reduce((prev, current) =>
            prev.length === 0 ? current : `${prev}${MODULE_DELIMETER}${current}`, '');
    }


    public getUId(): string {
        return this.uid;
    }

}

