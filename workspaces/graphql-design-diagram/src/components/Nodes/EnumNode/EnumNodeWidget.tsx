// tslint:disable: jsx-no-multiline-js
import React from "react";

import { DiagramEngine } from "@projectstorm/react-diagrams";

import { EnumFieldCard } from "./EnumFieldCard/EnumFieldCard";
import { EnumHeadWidget } from "./EnumHead/EnumHead";
import { EnumNodeModel } from "./EnumNodeModel";
import { EnumNode } from "./styles";

interface EnumNodeWidgetProps {
    node: EnumNodeModel;
    engine: DiagramEngine;
}

export function EnumNodeWidget(props: EnumNodeWidgetProps) {
    const { node, engine } = props;
    return (
        <EnumNode>
            <EnumHeadWidget
                engine={engine}
                node={node}
            />
            {node.enumObject.enumFields.map((enumField, index) => {
                return (
                    <EnumFieldCard key={index} engine={engine} node={node} enumField={enumField}/>
                );
            })
            }
        </EnumNode>
    );
}
