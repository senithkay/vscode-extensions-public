/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import styled from "@emotion/styled";

export const SectionWrapper: any = styled.div`
    // Flex Props
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    position: relative;
    gap: 10px;
    // End Flex Props
    // Sizing Props
    padding: 20px;
    // End Sizing Props
    // Border Props
    border-radius: 10px;
    border-style: solid;
    border-width: 1px;
    border-color: transparent;
    background-color: var(--vscode-welcomePage-tileBackground);
    &.active {
        border-color: var(--vscode-focusBorder);
    }
`;
