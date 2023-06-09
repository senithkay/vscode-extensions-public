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
