/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import * as React from "react";
import { DefaultNodeModel } from "./DefaultNodeModel";
import { DefaultNodeWidget } from "./DefaultNodeWidget";
import { AbstractReactFactory } from "@projectstorm/react-canvas-core";
import { DiagramEngine } from "@projectstorm/react-diagrams-core";

export class DefaultNodeFactory extends AbstractReactFactory<DefaultNodeModel, DiagramEngine> {
    constructor() {
        super("default");
    }

    generateReactWidget(event: { model: DefaultNodeModel; }): JSX.Element {
        return <DefaultNodeWidget engine={this.engine} node={event.model} />;
    }

    generateModel(): DefaultNodeModel {
        return new DefaultNodeModel();
    }
}
