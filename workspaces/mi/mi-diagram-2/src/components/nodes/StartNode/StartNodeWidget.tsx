/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from "react";
import styled from "@emotion/styled";
import { DiagramEngine, PortWidget } from "@projectstorm/react-diagrams-core";
import { StartNodeModel } from "./StartNodeModel";
import { Colors } from "../../../resources/constants";

namespace S {
    export const Node = styled.div<{}>`
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        /* min-width: 100px;
        height: 50px;
        padding: 0 8px;
        border: 2px solid ${Colors.OUTLINE_VARIANT};
        border-radius: 10px;
        background-color: ${Colors.SURFACE_BRIGHT};
        color: ${Colors.ON_SURFACE}; */
    `;
}

interface CallNodeWidgetProps {
    node: StartNodeModel;
    engine: DiagramEngine;
}

export function StartNodeWidget(props: CallNodeWidgetProps) {
    const { node, engine } = props;
    return (
        <S.Node>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 1536 1536">
                <path
                    fill={Colors.PRIMARY}
                    d="M1024 768q0 106-75 181t-181 75t-181-75t-75-181t75-181t181-75t181 75t75 181M768 224q-148 0-273 73T297 495t-73 273t73 273t198 198t273 73t273-73t198-198t73-273t-73-273t-198-198t-273-73m768 544q0 209-103 385.5T1153.5 1433T768 1536t-385.5-103T103 1153.5T0 768t103-385.5T382.5 103T768 0t385.5 103T1433 382.5T1536 768"
                />
            </svg>
            <PortWidget port={node.getPort("out")!} engine={engine} />
        </S.Node>
    );
}
