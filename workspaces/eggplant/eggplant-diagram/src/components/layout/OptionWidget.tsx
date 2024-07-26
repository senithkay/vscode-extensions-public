/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from "react";
import { DiagramEngine } from "@projectstorm/react-diagrams-core";
import { DefaultNodeModel } from "../default";
import { Flow } from "../../types";
import { HttpRequestNodeForm } from "../forms/HttpRequestNodeForm";
import { NodePosition } from "@wso2-enterprise/syntax-tree";
import { CodeBlockNodeForm } from "../forms/CodeBlockNodeForm";
import { NewPayloadNodeForm } from "../forms/NewPayloadNodeForm";
import { SwitchNodeForm } from "../forms/SwitchNodeForm";
import { TransformNodeForm } from "../forms/TransformNodeForm";

export interface OptionWidgetProps {
    engine: DiagramEngine;
    flowModel: Flow;
    selectedNode: DefaultNodeModel;
    children?: React.ReactNode;
    setSelectedNode?: (node: DefaultNodeModel) => void;
    openDataMapper: (position: NodePosition) => void;
    updateFlowModel?: () => void;
}

export function OptionWidget(props: OptionWidgetProps) {
    switch (props.selectedNode.getKind()) {
        case "HttpRequestNode":
            return <HttpRequestNodeForm {...props} />;
        case "CodeBlockNode":
            return <CodeBlockNodeForm {...props} />;
        case "NewPayloadNode":
            return <NewPayloadNodeForm {...props} />;
        case "SwitchNode":
            return <SwitchNodeForm {...props} />;
        case "TransformNode":
            return <TransformNodeForm {...props} />;
        default:
            return null;
    }
}
