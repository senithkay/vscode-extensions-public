/*
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import styled from "@emotion/styled";
import { VSCodeButton, VSCodeProgressRing } from "@vscode/webview-ui-toolkit/react";
import React from "react";
import { useChoreoWebViewContext } from "../context/choreo-web-view-ctx";
import { ChoreoWebViewAPI } from "../utilities/WebViewRpc";

const Container = styled.div`
    width: 100%;
    display  : flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 20px;
`;

export function SignIn() {
    const { loginStatus, loginStatusPending } = useChoreoWebViewContext();

    const onSignIn = () => {
        ChoreoWebViewAPI.getInstance().triggerCmd("wso2.choreo.sign.in");
    };
    return (
        <Container>
            {(loginStatusPending || loginStatus === "LoggingIn" || loginStatus === "Initializing") && (
                <>
                    <label>{'Waiting for Choreo sign-in...'}</label>
                    <VSCodeProgressRing />
                </>
            )}
            {!loginStatusPending && loginStatus === "LoggedOut" && (
                <>
                    <label>{'Sign in to Choreo...'}</label>
                    <VSCodeButton onClick={onSignIn}>Sign in</VSCodeButton>
                </>
            )}
        </Container>
    );
}
