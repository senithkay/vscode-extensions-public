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
import { useContext } from "react";
import { ChoreoWebViewContext } from "../../context/choreo-web-view-ctx";
import { ViewTitle } from "../Components/ViewTitle";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { Codicon } from "../../Codicon/Codicon";
import { ViewHeader } from "../Components/ViewHeader";

const Container = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    gap: 10px;
    width: 100%;
`;

const Body = styled.div`
    display: flex;
    flex-direction: row;
    gap: 10px;
`;

export const SelectedOrganization = () => {

    const { selectedOrg } = useContext(ChoreoWebViewContext);

    const changeOrg = () => {
    };

    return <Container>
        <ViewHeader>
            <ViewTitle>
                Organization
            </ViewTitle>
            <VSCodeButton
                    appearance="icon"
                    onClick={changeOrg}
                    title={"Change Choreo Organization"}
                    id="change-org-btn"
                    style={{ marginLeft: "auto" }}
                    disabled={selectedOrg === undefined}
                >
                <Codicon name={"arrow-swap"} />
            </VSCodeButton>
        </ViewHeader>
        <Body>
            {!selectedOrg && <div>fetching organization info...</div>}
            <div>{selectedOrg?.name}</div>
            <div style={{ color: "var(--vscode-descriptionForeground)"}}>{selectedOrg?.handle}</div>
        </Body>
    </Container>;
};
