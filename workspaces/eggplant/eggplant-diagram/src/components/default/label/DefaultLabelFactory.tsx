/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import * as React from "react";
import { DefaultLabelModel } from "./DefaultLabelModel";
import { DefaultLabelWidget } from "./DefaultLabelWidget";
import { AbstractReactFactory } from "@projectstorm/react-canvas-core";
import { DiagramEngine } from "@projectstorm/react-diagrams-core";

export class DefaultLabelFactory extends AbstractReactFactory<DefaultLabelModel, DiagramEngine> {
    constructor() {
        super("default");
    }

    generateReactWidget(event: { model: DefaultLabelModel; }): JSX.Element {
        return <DefaultLabelWidget model={event.model} />;
    }

    generateModel(): DefaultLabelModel {
        return new DefaultLabelModel();
    }
}
