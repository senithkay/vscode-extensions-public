/*
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
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
