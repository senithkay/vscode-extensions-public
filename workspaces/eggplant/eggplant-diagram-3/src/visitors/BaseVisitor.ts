/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Branch, Node } from "../utils/types";

export interface BaseVisitor {
    skipChildren(): boolean;

    beginVisitNode?(node: Node, parent?: Node): void;
    endVisitNode?(node: Node, parent?: Node): void;

    beginVisitEventHttpApi?(node: Node, parent?: Node): void;
    endVisitEventHttpApi?(node: Node, parent?: Node): void;

    beginVisitIf?(node: Node, parent?: Node): void;
    endVisitIf?(node: Node, parent?: Node): void;
    
    beginVisitBlock?(node: Branch, parent?: Node): void;
    endVisitBlock?(node: Branch, parent?: Node): void;

    beginVisitReturn?(node: Node, parent?: Node): void;
    endVisitReturn?(node: Node, parent?: Node): void;
}
