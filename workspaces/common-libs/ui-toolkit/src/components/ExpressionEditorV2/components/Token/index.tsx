/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useRef } from "react";
import styled from "@emotion/styled";
import { StyleBase } from "../Common/types";
import { ResizeHandle } from "./ResizeHandle";

/* Styles */
namespace S {
    export const Container = styled.div`
        position: relative;
    `;

    export const Editor = styled.div<StyleBase>`
        box-sizing: border-box;
        position: relative;
        color: var(--input-foreground);
        background: var(--input-background);
        border-radius: calc(var(--corner-radius) * 1px);
        border: calc(var(--border-width) * 1px) solid var(--dropdown-border);
        font-style: inherit;
        font-variant: inherit;
        font-weight: inherit;
        font-stretch: inherit;
        font-family: monospace;
        font-optical-sizing: inherit;
        font-size-adjust: inherit;
        font-kerning: inherit;
        font-feature-settings: inherit;
        font-variation-settings: inherit;
        font-size: 12px;
        line-height: var(--type-ramp-base-line-height);
        padding: 5px 8px;
        width: 100%;
        min-height: 26px;
        min-width: var(--input-min-width);
        outline: none;
        resize: vertical;

        &:focus {
            border-color: var(--focus-border);
        }

        ${(props: StyleBase) => props.sx};
    `;
}

export const TokenEditor = () => {
    const editorRef = useRef<HTMLDivElement>(null);

    return (
        <S.Container>
            <S.Editor ref={editorRef} contentEditable suppressContentEditableWarning />
            <ResizeHandle editorRef={editorRef} />
        </S.Container>
    );
};
