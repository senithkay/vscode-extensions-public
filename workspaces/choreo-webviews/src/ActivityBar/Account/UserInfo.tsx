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
import styled from "@emotion/styled";
import React from "react";
import { useChoreoWebViewContext } from "../../context/choreo-web-view-ctx";
import { VSCodeButton, VSCodeLink } from "@vscode/webview-ui-toolkit/react";
import { ChoreoWebViewAPI } from "../../utilities/WebViewRpc";
import { useAccountSubscriptionStatus } from '../../hooks/use-account-subscription-status';

const Container = styled.div`
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    gap: 10px;
    justify-content: space-between;
`;

const MiddleContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    margin-left: 10px;  
    gap: 5px;
`;

// email
const Email = styled.div`
    color: var(--vscode-descriptionForeground);
    font-size: 12px;
    font-weight: 400;
    line-height: 1.5;
`;

const SignOutButton = styled(VSCodeButton)`
    margin-left: auto;
`;

// Diplays the avatar, name and email of the currently logged in user.
export const UserInfo = () => {
    const { showUpgradeButton } = useAccountSubscriptionStatus();
    const { userInfo, choreoProject } = useChoreoWebViewContext();
    if (!userInfo) {
        return null;
    }
    const { displayName, userEmail, userProfilePictureUrl } = userInfo;

    const onSignOut = () => {
        ChoreoWebViewAPI.getInstance().triggerCmd("wso2.choreo.sign.out");
    };

    const openBillingPortal = () => {
        ChoreoWebViewAPI.getInstance().openBillingPortal(`${choreoProject.id}`);
    }

    return (
        <Container>
            <img src={userProfilePictureUrl} width="40px" height="40px" />
            <MiddleContainer>
                <div>{displayName}</div>
                <Email>{userEmail}</Email>
                {showUpgradeButton && (
                    <VSCodeLink onClick={openBillingPortal}>Upgrade</VSCodeLink>
                )}
            </MiddleContainer>
            <SignOutButton onClick={onSignOut}>Sign Out</SignOutButton>
        </Container>
    );
};
