/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React from "react";
import { DiagramEngine } from "@projectstorm/react-diagrams";
import styled from "@emotion/styled";

import { OverlayLayerModel } from "./OverlayLayerModel";
import { ProgressRing } from "@wso2-enterprise/ui-toolkit";
import { Colors } from "../../resources/constants";

export interface NodeLayerWidgetProps {
}

const Container = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 100%;
    position: fixed;
    top: 0;
    left: 0;
    backdrop-filter: blur(5px);
    background-color: rgba(0, 0, 0, 0.1);
    pointer-events: auto;
    z-index: 1000;
`;

export class OverlayLayerWidget extends React.Component<NodeLayerWidgetProps> {
    render() {
        return (
            <div data-testid={"loading-overlay"}>
                <Container>
                    <ProgressRing />
                </Container>
            </div>
        );
    }
}
