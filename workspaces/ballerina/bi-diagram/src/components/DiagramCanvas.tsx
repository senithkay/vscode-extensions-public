/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from "react";
import { css, Global } from "@emotion/react";
import styled from "@emotion/styled";
import { Colors } from "../resources/constants";
import '../resources/assets/font/fonts.css';
import { useDiagramContext } from "./DiagramContext";

export interface DiagramCanvasProps {
    color?: string;
    background?: string;
    children?: React.ReactNode;
}

export namespace DiagramStyles {
    export const Container = styled.div<{ color: string; background: string; locked: boolean }>`
        height: 100%;
        background-size: 50px 50px;
        display: flex;
        pointer-events: ${props => props.locked ? 'none' : 'auto'};

        > * {
            height: 100%;
            min-height: 100%;
            width: 100%;
        }

        background-image: radial-gradient(${Colors.SURFACE_CONTAINER} 10%, transparent 0px);
        background-size: 16px 16px;
        background-color: ${Colors.SURFACE_BRIGHT};
        font-family: "GilmerRegular";
    `;

    export const Expand = css`
        html,
        body,
        #root {
            height: 100%;
        }
    `;
}

export function DiagramCanvas(props: DiagramCanvasProps) {
    const { color, background, children } = props;
    const { lockCanvas } = useDiagramContext();
    
    return (
        <>
            <Global styles={DiagramStyles.Expand} />
            <DiagramStyles.Container 
                id="bi-diagram-canvas" 
                background={background || Colors.SURFACE_BRIGHT} 
                color={color || Colors.ON_SURFACE}
                locked={lockCanvas}
            >
                {children}
            </DiagramStyles.Container>
        </>
    );
}
