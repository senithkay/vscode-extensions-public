// tslint:disable: jsx-no-multiline-js
// tslint:disable: jsx-no-lambda
// tslint:disable: sx-wrap-multiline
import React from "react";

import { DiagramEngine } from "@projectstorm/react-diagrams";

import { FunctionCard } from "./FunctionCards/FunctionCard";
import { GraphqlServiceNodeModel } from "./GraphqlServiceNodeModel";
import { ServiceHeadWidget } from "./ServiceHead/ServiceHead";
import { ServiceNode } from './styles/styles';

interface ServiceNodeWidgetProps {
    node: GraphqlServiceNodeModel;
    engine: DiagramEngine;
}

export function GraphqlServiceNodeWidget(props: ServiceNodeWidgetProps) {
    const { node, engine } = props;

    return(
        <ServiceNode>
            <ServiceHeadWidget
                engine={engine}
                node={node}
            />
            {
                node.serviceObject.resourceFunctions.map((resource, index) => {
                    return (
                        <FunctionCard
                            key={index}
                            engine={engine}
                            node={node}
                            functionElement={resource}
                            isResourceFunction={true}
                        />
                    )
                })
            }
            {
                node.serviceObject.remoteFunctions && node.serviceObject.remoteFunctions.map((remoteFunc, index) => {
                    return (
                        <FunctionCard
                            key={index}
                            engine={engine}
                            node={node}
                            functionElement={remoteFunc}
                            isResourceFunction={false}
                        />
                    )
                })
            }
        </ServiceNode>
    );

}
