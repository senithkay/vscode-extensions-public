// tslint:disable: jsx-no-multiline-js
import React from "react";

import { DiagramEngine } from "@projectstorm/react-diagrams";

import { ServiceNode } from "../GraphqlServiceNode/styles/styles";

import { ServiceClassHeadWidget } from "./ClassHead/ClassHead";
import { ServiceField } from "./FunctionCard/ServiceField";
import { ServiceClassNodeModel } from "./ServiceClassNodeModel";

interface ServiceClassNodeWidgetProps {
    node: ServiceClassNodeModel;
    engine: DiagramEngine;
}

export function ServiceClassNodeWidget(props: ServiceClassNodeWidgetProps) {
    const { node, engine } = props;

    return(
        <ServiceNode>
            <ServiceClassHeadWidget node={node} engine={engine}/>
            {node.classObject.functions.map((classFunction, index) => {
                return(
                    <ServiceField key={index} node={node} engine={engine} functionElement={classFunction}/>
                );
            })}

        </ServiceNode>
    );
}
