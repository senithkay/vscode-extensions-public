/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { BaseNodeModel } from "../components/nodes/BaseNode";
import { EmptyNodeModel } from "../components/nodes/EmptyNode";
import { IfNodeModel } from "../components/nodes/IfNode/IfNodeModel";
import { StartNodeModel } from "../components/nodes/StartNode/StartNodeModel";

export type NodeModel = BaseNodeModel | EmptyNodeModel | IfNodeModel | StartNodeModel;

export type {
    Flow,
    Client,
    ClientKind,
    ClientScope,
    Node,
    NodeKind,
    Branch,
    LineRange,
    Expression,
    TypeKind,
    NodeProperties,
    NodePropertyKey,
    ViewState,
    TargetMetadata,
} from "@wso2-enterprise/eggplant-core";
