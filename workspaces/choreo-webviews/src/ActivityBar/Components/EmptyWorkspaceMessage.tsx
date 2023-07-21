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
import { Separator } from './Separator'

const Container = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 10px;
    gap: 10px;
`;

const WideVSCodeButton = styled(VSCodeButton)`
    width: 100%;
    max-width: 300px;
    margin: 10px 0;
`;


export const EmptyWorkspaceMessage = (props: { projectUnavailable?: boolean }) => {
    
    const openChoreoProject = () => {
        ChoreoWebViewAPI.getInstance().triggerCmd("wso2.choreo.project.open");
    }

    const createChoreoProject = () => {
        ChoreoWebViewAPI.getInstance().triggerCmd("wso2.choreo.project.create");
    }

    return (
        <Container>
            {props.projectUnavailable ? (
                <>
                    <div>This project is not available in Choreo.</div>
                    <div>Please create a new project or open a different project</div>
                </>
            ) : (
                <div>You do not have a Choreo project in the current the workspace.</div>
            )}

            <WideVSCodeButton
                appearance="primary"
                onClick={openChoreoProject}
            >
                Open Project
            </WideVSCodeButton>
            <Separator text="OR"/>
            <WideVSCodeButton
                appearance="primary"
                onClick={createChoreoProject}
            >
                Create Project
            </WideVSCodeButton>
        </Container>
    );
};
