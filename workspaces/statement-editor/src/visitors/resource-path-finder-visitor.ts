/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import {
    ResourceAccessorDefinition,
    Visitor
} from "@wso2-enterprise/syntax-tree";



export class ResourcePathFinderVisitor implements Visitor {

    isValidResourcePath: boolean = true;
    method: string;
    resourcePath: string;

    constructor(method: string, resourcePath: string) {
        this.method = method;
        this.resourcePath = resourcePath;
        this.isValidResourcePath = true;
    }

    public beginVisitResourceAccessorDefinition(node: ResourceAccessorDefinition) {
        if (node.functionName.value.toLowerCase() === this.method.toLowerCase()
            && node.relativeResourcePath.length > 0
            && node.relativeResourcePath[0].value === this.resourcePath) {
            this.isValidResourcePath = false;
        }
    }

    getResourcePathValidity(): boolean {
        return this.isValidResourcePath;
    }
}
