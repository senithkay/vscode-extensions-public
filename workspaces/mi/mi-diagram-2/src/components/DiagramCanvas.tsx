/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from "react";
import styled from "@emotion/styled";
import { css, Global } from "@emotion/react";
import { Colors } from "../resources/constants";

export interface DiagramCanvasProps {
    color?: string;
    background?: string;
    children?: React.ReactNode;
    width?: number;
    height?: number;
}

namespace S {
    export const Container = styled.div<{ color: string; background: string; width: number; height: number; }>`
        background-size: 50px 50px;
        display: flex;
        min-height: ${(props: any) => props.height || 0}px;
        min-width: ${(props: any) => props.width || 0}px;

        > * {
            height: 100vh;
            min-height: 100%;
            width: 100%;
        }
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
    const { color, background, children, width, height } = props;
    return (
        <>
            <Global styles={S.Expand} />
            <S.Container
                background={background || Colors.SURFACE_BRIGHT} color={color || Colors.ON_SURFACE}
                width={width}
                height={height}
            >
                {children}
            </S.Container>
        </>
    );
}
