/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from "react";
import { AbstractReactFactory, GenerateModelEvent, GenerateWidgetEvent } from "@projectstorm/react-canvas-core";
import { DiagramEngine } from "@projectstorm/react-diagrams-core";
import { NodeTypes } from "../../../resources/constants";
import { NodeKind } from "../../../utils/types";
import { ForeachNodeModel } from "./ForeachNodeModel";
import { ForeachNodeWidget } from "./ForeachNodeWidget";

export class ForeachNodeFactory extends AbstractReactFactory<ForeachNodeModel, DiagramEngine> {
    constructor() {
        super(NodeTypes.FOREACH_NODE);
    }

    generateModel(event: GenerateModelEvent): ForeachNodeModel {
        return new ForeachNodeModel(event.initialConfig);
    }

    generateReactWidget(event: GenerateWidgetEvent<ForeachNodeModel>) {
        switch (event.model.node.codedata.node as NodeKind) {
            default:
                return (
                    <ForeachNodeWidget engine={this.engine} model={event.model} />
                );
        }
    }
}
