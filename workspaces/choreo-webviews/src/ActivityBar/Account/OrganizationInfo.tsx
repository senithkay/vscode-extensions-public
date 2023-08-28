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
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { ChoreoWebViewAPI } from "../../utilities/WebViewRpc";
import { Codicon } from "../../Codicon/Codicon";

const OrgContainer = styled.div`
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
`;

const OrgLabel = styled.span`
    color: var(--vscode-descriptionForeground);
`;

export const OrganizationInfo = () => {
    const { selectedOrg } = useChoreoWebViewContext();

    const changeOrg = () => {
        ChoreoWebViewAPI.getInstance().triggerCmd("wso2.choreo.org.change");
    };

    return (
        <OrgContainer>
            <div>
                <OrgLabel>Organization:</OrgLabel> {selectedOrg?.name}
            </div>
            <VSCodeButton appearance="icon" title="Change Organization" onClick={changeOrg}>
                <Codicon name="list-selection" />
            </VSCodeButton>
        </OrgContainer>
    );
};
