/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from "react";
import { GenerateModelEvent, GenerateWidgetEvent} from "@projectstorm/react-canvas-core";
import { DataMapperNodeModel } from "./DataMapperNodeModel";
import { NodeTypes } from "../../../resources/constants";
import { MediatorNodeFactory } from "../MediatorNode/MediatorNodeFactory";
import { DataMapperNodeWidget } from "./DataMapperNodeWidget";

export class DataMapperNodeFactory extends MediatorNodeFactory {
    constructor() {
        super(NodeTypes.DATAMAPPER_NODE);
    }

    generateModel(event: GenerateModelEvent): DataMapperNodeModel {
        return new DataMapperNodeModel(event.initialConfig.stNode, event.initialConfig.mediatorName, event.initialConfig.documentUri);
    }

    generateReactWidget(event: GenerateWidgetEvent<DataMapperNodeModel>) {
        return <DataMapperNodeWidget
            engine={this.engine}
            node={event.model}
        />;
    }
}
