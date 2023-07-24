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
import { VSCodeLink } from "@vscode/webview-ui-toolkit/react";
import { ChoreoWebViewAPI } from "../../utilities/WebViewRpc";
import { useChoreoWebViewContext } from "./../../context/choreo-web-view-ctx";

const Container = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 10px;
    gap: 8px;
`;

export const SignInToChoreoMessage = (props: { showProjectHeader?: boolean }) => {
    const { isChoreoProject } = useChoreoWebViewContext();
    const { showProjectHeader } = props;

    const signInToChoreo = () => {
        ChoreoWebViewAPI.getInstance().triggerCmd("wso2.choreo.sign.in");
    };

    return (
        <Container>
            {showProjectHeader ? (
                <>
                    {isChoreoProject ? (
                        <>
                            <div>Choreo project detected in your current workspace.</div>
                            <div>
                                Please&nbsp;<VSCodeLink onClick={signInToChoreo}>sign in</VSCodeLink>&nbsp;to unlock
                                Choreo features for your project.
                            </div>
                        </>
                    ) : (
                        <>
                            <div>No Choreo project found in your current workspace.</div>
                            <div>
                                Please &nbsp;<VSCodeLink onClick={signInToChoreo}>sign in</VSCodeLink>&nbsp; to create
                                and manage your Choreo project.
                            </div>
                        </>
                    )}
                </>
            ) : (
                <div>
                    Please&nbsp;<VSCodeLink onClick={signInToChoreo}>sign in</VSCodeLink>&nbsp;to enable Choreo
                    features.
                </div>
            )}
        </Container>
    );
};
