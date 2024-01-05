/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import * as React from "react";
import { DiagramEngine, PortWidget } from "@projectstorm/react-diagrams-core";
import { DefaultPortModel } from "./DefaultPortModel";
import styled from "@emotion/styled";
import { Colors } from "../../../resources";

export interface StartPortLabelProps {
    port: DefaultPortModel;
    engine: DiagramEngine;
}

namespace S {
    export const Port = styled.div`
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: ${Colors.PRIMARY};
        &:hover {
            background: ${Colors.SECONDARY};
        }
    `;
}

export class StartPortLabel extends React.Component<StartPortLabelProps> {
    render() {
        return (
            <PortWidget engine={this.props.engine} port={this.props.port}>
                <S.Port />
            </PortWidget>
        );
    }
}
