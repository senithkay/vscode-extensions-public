/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import * as React from "react";
import * as _ from "lodash";
import { DiagramEngine } from "@projectstorm/react-diagrams-core";
import { DefaultNodeModel } from "./DefaultNodeModel";
import { DefaultPortLabel } from "../port/DefaultPortLabelWidget";
import styled from "@emotion/styled";
import { Colors, NODE_MIN_HEIGHT, NODE_MIN_WIDTH } from "../../../resources";
import { DefaultPortModel } from "../port/DefaultPortModel";
import { ReturnIcon } from "../../../resources/assets/icons/ReturnIcon";

namespace S {
    type NodeStyleProp = {
        background?: string;
        selected: boolean;
    };

    export const Node = styled.div<NodeStyleProp>`
        background-color: ${(p: NodeStyleProp) => (p.selected ? Colors.SECONDARY_CONTAINER : Colors.SURFACE)};
        border-radius: 5px;
        font-family: sans-serif;
        border: solid 2px black;
        overflow: visible;
        font-size: 14px;
        border: solid 2px ${(p: NodeStyleProp) => (p.selected ? Colors.SECONDARY : Colors.OUTLINE_VARIANT)};
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        min-height: ${NODE_MIN_HEIGHT}px;
        min-width: ${NODE_MIN_WIDTH}px;
    `;

    export const Title = styled.div`
        color: ${Colors.ON_SURFACE};
        display: flex;
        white-space: nowrap;
        justify-items: center;
        padding: 0 8px;
    `;

    export const TitleName = styled.div`
        flex-grow: 1;
        padding: 5px 5px;
        margin-right: 14px;
    `;

    export const Ports = styled.div`
        display: flex;
    `;

    export const InPorts = styled(Ports)`
        margin-left: -9px;
    `;

    export const PortsContainer = styled.div`
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin: 8px 0;
    `;

    export const StartPortContainer = styled.div`
        display: flex;
        justify-content: center;
        align-items: center;
        width: 20px;
        height: 20px;
        border: 2px solid ${Colors.PRIMARY};
        border-radius: 50%;
        background: ${Colors.PRIMARY_CONTAINER};
    `;

    export const IconContainer = styled.div`
        padding: 0 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        & svg {
            height: 20px;
            width: 20px;
            fill: ${Colors.ON_SURFACE};
            stroke: ${Colors.ON_SURFACE};
        }
    `;
}

export interface ReturnNodeProps {
    node: DefaultNodeModel;
    engine: DiagramEngine;
}

export class ReturnNodeWidget extends React.Component<ReturnNodeProps> {
    generatePort = (port: DefaultPortModel) => {
        return <DefaultPortLabel engine={this.props.engine} port={port} key={port.getID()} />;
    };

    render() {
        return (
            <S.Node
                data-default-node-name={this.props.node.getOptions().name}
                selected={this.props.node.isSelected()}
                background={this.props.node.getOptions().color}
            >
                <S.InPorts>
                    <S.PortsContainer>{_.map(this.props.node.getInPorts(), this.generatePort)}</S.PortsContainer>
                </S.InPorts>
                <S.IconContainer>
                    <ReturnIcon />
                </S.IconContainer>
                <S.Title>
                    <S.TitleName>
                        {this.props.node.getOptions().node?.name === "HttpResponseNode"
                            ? "Return"
                            : this.props.node.getOptions().node?.name || this.props.node.getOptions().name}
                    </S.TitleName>
                </S.Title>
            </S.Node>
        );
    }
}
