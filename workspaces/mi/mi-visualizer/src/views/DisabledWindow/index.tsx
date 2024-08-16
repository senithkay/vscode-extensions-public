/*
 *  Copyright (c) 2024, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
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
import styled from "@emotion/styled";
import { Button, Codicon } from "@wso2-enterprise/ui-toolkit";
import { AI_EVENT_TYPE } from '@wso2-enterprise/mi-core';
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';

import { AlertBox } from "../AlertBox/AlertBox";

const Container = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 10px;
    gap: 8px;
`;

const HeaderButtons = styled.div({
    display: 'flex',
    justifyContent: 'flex-end',
    marginRight: '10px',
});

const IssueTrackerLink = styled.div({
    display: 'flex',
    justifyContent: 'flex-start',
    marginLeft: '10px',
});

export const DisabledMessage = (props: { showProjectHeader?: boolean }) => {
    const { rpcClient } = useVisualizerContext();
    const issueUrl = "https://github.com/wso2/ballerina-plugin-vscode/issues";
    const Retry = () => {
        rpcClient.sendAIStateEvent(AI_EVENT_TYPE.RETRY);
    };

    async function handleLogout() {
        await rpcClient.getMiDiagramRpcClient().logoutFromMIAccount();
    }

    return (
        <Container>
            <HeaderButtons>
                <Button
                    appearance="icon"
                    onClick={() => handleLogout()}
                    tooltip="Logout"
                >
                    <Codicon name="sign-out" />&nbsp;&nbsp;Logout
                </Button>
            </HeaderButtons>
            <AlertBox
                buttonTitle="Retry"
                onClick={Retry}
                subTitle={
                    "An error occurred while trying to establish a connection with the MI Copilot server. Please click retry to try again. If the issue persists, try logging out and logging in again."
                }
                title={"Error in establishing Connection"}
            />
            <IssueTrackerLink>
                Please raise an issue in our&nbsp; <a href="your-link-url">issue tracker</a> .
            </IssueTrackerLink>
        </Container>
    );
};
