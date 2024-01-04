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
import styled from "@emotion/styled";
import { Colors } from "../../../resources";
import { DefaultPortModel } from "../port/DefaultPortModel";
import { StartPortLabel } from "../port/StartPortLabelWidget";

namespace S {
    export const Node = styled.div`
        display: flex;
        justify-content: center;
        align-items: center;
        width: 20px;
        height: 20px;
        border: 2px solid ${Colors.PRIMARY};
        border-radius: 50%;
        background: ${Colors.PRIMARY_CONTAINER};
    `;

    export const StackContainer = styled.div`
        position: relative;
        height: 60%;
        width: 60%;
    `;
}

export interface StartNodeProps {
    node: DefaultNodeModel;
    engine: DiagramEngine;
}

export class StartNodeWidget extends React.Component<StartNodeProps> {
    generatePort = (port: DefaultPortModel) => {
        return <StartPortLabel engine={this.props.engine} port={port} key={port.getID()} />;
    };

    render() {
        return (
            <S.Node>
                <S.StackContainer>{_.map(this.props.node.getUniqueOutPorts(), this.generatePort)}</S.StackContainer>
            </S.Node>
        );
    }
}
