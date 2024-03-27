/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import {
    DefaultLinkModel,
    DefaultNodeModel,
} from "@projectstorm/react-diagrams-defaults";
import { Flow, Node, Participant } from "../utils/types";
import { BaseVisitor } from "./BaseVisitor";

export class ElementFactoryVisitor implements BaseVisitor {
    nodes: DefaultNodeModel[] = [];
    links: DefaultLinkModel[] = [];
    private skipChildrenVisit = false;

    constructor() {
        console.log(">> Element factory visitor started");
    }

    skipChildren(): boolean {
        return this.skipChildrenVisit;
    }

    beginVisitParticipant(node: Participant, parent?: Flow): void {
        console.log(">> Begin visit participant", node);
    }
}
