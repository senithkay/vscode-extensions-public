/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com) All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React from "react";
import styled from "@emotion/styled";
import { css, Global } from "@emotion/react";
import "../resources/assets/font/fonts.css";
import { ThemeColors } from "@wso2-enterprise/ui-toolkit";
export interface DiagramCanvasProps {
    color?: string;
    background?: string;
    children?: React.ReactNode;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
}

const Container = styled.div<{ color: string; background: string }>`
    height: 100%;
    background-size: 50px 50px;
    display: flex;

    > * {
        height: 100%;
        min-height: 100%;
        width: 100%;
    }

    background-image: radial-gradient(var(--vscode-editor-inactiveSelectionBackground) 10%, transparent 0px);
    background-size: 16px 16px;
    font-family: "GilmerRegular";

    & svg:first-child {
        z-index: 1;
    }
`;

const Expand = css`
    html,
    body,
    #root {
        height: 100%;
    }
`;

export function DiagramCanvas(props: DiagramCanvasProps) {
    const { color, background, children, onMouseEnter, onMouseLeave } = props;
    return (
        <>
            <Global styles={Expand} />
            <Container
                background={background || ThemeColors.SURFACE_BRIGHT}
                color={color || ThemeColors.ON_SURFACE}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
            >
                {children}
            </Container>
        </>
    );
}
