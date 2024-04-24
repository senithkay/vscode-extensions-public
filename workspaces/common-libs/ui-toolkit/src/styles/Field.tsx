/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import styled from "@emotion/styled";
import { ContainerProps } from "../components/Popover/Popover";

export const Label = styled.label`
    font-size: var(--type-ramp-base-font-size);
    color: var(--vscode-editor-foreground);
`;

export const FlexLabelContainer = styled.div<ContainerProps>`
    display: flex;
    flex-direction: row;
    margin-bottom: 4px;
`;

export const Link = styled.a`
    cursor: pointer;
    font-size: 12px;
    margin-left: auto;
    margin-right: 15px;
    margin-bottom: -5px;
    color: var(--vscode-editor-foreground);
`;
