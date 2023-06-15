/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content."
 */

// tslint:disable: jsx-no-multiline-js
import React from "react";

import { DiagramEngine } from "@projectstorm/react-diagrams";

import { NodeContainer } from "../../resources/styles/styles";

import { UnionField } from "./UnionField/UnionField";
import { UnionNodeHeadWidget } from "./UnionNodeHead/UnionNodeHead";
import { UnionNodeModel } from "./UnionNodeModel";

interface UnionNodeWidgetProps {
    node: UnionNodeModel;
    engine: DiagramEngine;
}

export function UnionNodeWidget(props: UnionNodeWidgetProps) {
    const { node, engine } = props;

    return (
        <NodeContainer>
            <UnionNodeHeadWidget node={node} engine={engine}/>
            {node.unionObject.possibleTypes.map((field, index) => {
                return (
                    <UnionField key={index} node={node} engine={engine} unionField={field}/>
                );
            })}
        </NodeContainer>
    );
}
