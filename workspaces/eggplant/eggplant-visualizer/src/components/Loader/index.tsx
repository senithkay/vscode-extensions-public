/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from 'react';
import styled from "@emotion/styled";
import { VSCodeProgressRing } from "@vscode/webview-ui-toolkit/react"

const LoaderContainer = styled.div({
    width: "100%",
    overflow: "hidden",
    height: "100vh",
    display: "grid"
});

const LoaderContent = styled.div({
    margin: "auto"
});

export const Loader: React.FC = () => {
    return (
        <LoaderContainer>
            <LoaderContent>
                <VSCodeProgressRing style={{ height: 24 }} />
            </LoaderContent>
        </LoaderContainer>
    )
}