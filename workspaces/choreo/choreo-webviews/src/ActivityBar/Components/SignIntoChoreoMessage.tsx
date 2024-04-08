/*
 *  Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
 *
 *  This software is the property of WSO2 LLC. and its suppliers, if any.
 *  Dissemination of any information or reproduction of any material contained
 *  herein is strictly forbidden, unless permitted by WSO2 in accordance with
 *  the WSO2 Commercial License available at http://wso2.com/licenses.
 *  For specific language governing the permissions and limitations under
 *  this license, please see the license as well as any agreement you’ve
 *  entered into with WSO2 governing the purchase of this software and any
 *  associated services.
 */
import React from "react";
import styled from "@emotion/styled";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { ChoreoWebViewAPI } from "../../utilities/WebViewRpc";
import { useChoreoWebViewContext } from "./../../context/choreo-web-view-ctx";
import { AlertBox } from "./AlertBox";
import { CommandIds } from "@wso2-enterprise/choreo-core";

const Container = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 10px;
    gap: 8px;
`;

const WideVSCodeButton = styled(VSCodeButton)`
    width: 100%;
    max-width: 300px;
    margin: 15px 0 15px 0;
    align-self: center;
`;

export const SignInToChoreoMessage = (props: { showProjectHeader?: boolean }) => {
    const { isChoreoProject } = useChoreoWebViewContext();
    const { showProjectHeader } = props;

    const signInToChoreo = () => {
        ChoreoWebViewAPI.getInstance().triggerCmd(CommandIds.SignIn);
    };

    return (
        <Container>
            {showProjectHeader ? (
                <AlertBox
                    buttonTitle="Sign In"
                    onClick={signInToChoreo}
                    subTitle={
                        isChoreoProject
                            ? "Please sign in to unlock Choreo features for the currently opened project workspace."
                            : "Please sign in to create and manage your Choreo project workspaces."
                    }
                    title={isChoreoProject ? "Choreo Project Detected" : "Choreo Project Not Found"}
                />
            ) : (
                <WideVSCodeButton appearance="primary" onClick={signInToChoreo} id="sign-in-btn">
                    Sign In
                </WideVSCodeButton>
            )}
        </Container>
    );
};
