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

    return(
        <NodeContainer>
            <UnionNodeHeadWidget node={node} engine={engine}/>
            {node.unionObject.possibleTypes.map((field, index) => {
                return(
                    <UnionField  key={index} node={node} engine={engine} unionField={field}/>
                );
            })}
        </NodeContainer>
    );
}
