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
import React, { useCallback } from "react";
import styled from "@emotion/styled";
import { Component, OPEN_SOURCE_CONTROL_VIEW_EVENT } from "@wso2-enterprise/choreo-core";
import { VSCodeLink } from "@vscode/webview-ui-toolkit/react";
import { ChoreoWebViewAPI } from "../../utilities/WebViewRpc";

const Container = styled.div`
    display: flex;
    flex-direction: row;
`;

export const RepositoryDetails: React.FC<{ enrichedComponent: Component }> = (props) => {
    const { enrichedComponent: { hasDirtyLocalRepo, hasUnPushedLocalCommits } } = props;
    const dirtyRepo = hasDirtyLocalRepo || hasUnPushedLocalCommits;
    
    const openSourceControl = useCallback(() => {
        ChoreoWebViewAPI.getInstance().sendProjectTelemetryEvent({
            eventName: OPEN_SOURCE_CONTROL_VIEW_EVENT
        });
        ChoreoWebViewAPI.getInstance().triggerCmd("workbench.scm.focus");
    }, []);
    
    return (
        <Container>
            <div>Repo:&nbsp;</div>
            {!dirtyRepo && (<div>In sync</div>)}
            {dirtyRepo && (
                <VSCodeLink
                    onClick={openSourceControl}
                    title="Open source control view & sync changes"
                >
                    Commit & Push
                </VSCodeLink>
            )}
        </Container>
    );
};
