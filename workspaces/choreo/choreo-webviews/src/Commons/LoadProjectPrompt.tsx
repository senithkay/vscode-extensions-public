/*
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { css, cx } from "@emotion/css";
import styled from "@emotion/styled";
import React from "react";

const codiconStyles = css`
    color: var(--vscode-editorWarning-foreground);
    zoom: 2.5;
`;

const Container = styled.div`
    align-items: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    text-align: center;
`;

export function LoadChoreoProjectPrompt() {
    return (
        <Container>
            <i className={`codicon codicon-warning ${cx(codiconStyles)}`} />
            <p>Current workspace does not contain a Choreo project. Please create/open a Choreo project first.</p>
        </Container>
    );
}
