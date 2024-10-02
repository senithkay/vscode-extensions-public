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
import { BaseNodeModel } from "./BaseNodeModel";
import { BaseNodeWidget } from "./BaseNodeWidget";
import { NodeTypes } from "../../../resources/constants";
import { NodeKind } from "../../../utils/types";

export class BaseNodeFactory extends AbstractReactFactory<BaseNodeModel, DiagramEngine> {
    constructor() {
        super(NodeTypes.BASE_NODE);
    }

    generateModel(event: GenerateModelEvent): BaseNodeModel {
        return new BaseNodeModel(event.initialConfig);
    }

    generateReactWidget(event: GenerateWidgetEvent<BaseNodeModel>) {
        switch (event.model.node.codedata.node as NodeKind) {
            default:
                return (
                    <BaseNodeWidget engine={this.engine} model={event.model} />
                );
        }
    }
}
