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
import React, { useContext } from "react";
import styled from "@emotion/styled";
import { UserInfo } from "./UserInfo";
import { VSCodeDivider } from "@vscode/webview-ui-toolkit/react";
import { SelectedOrganization } from "./SelectedOrg";
import { ChoreoWebViewContext } from "../../context/choreo-web-view-ctx";
import { ProgressIndicator } from "../Components/ProgressIndicator";
import { SelectedProject } from "./SelectedProject";

const Container = styled.div`
    display: flex;
    flex-direction: column;
    margin-top: 20px;
    align-items: flex-start;
    gap: 10px;
    width: 100%;
`;

// seperator with a margin of 10px on top and bottom
const Seperator = styled(VSCodeDivider)`
    margin: 10px 0;
`;

export const UserDetails = () => {
    const { fetchingOrgInfo, loginStatusPending } = useContext(ChoreoWebViewContext);

    return <Container>
        {(fetchingOrgInfo || loginStatusPending) && <ProgressIndicator />}
        <UserInfo />
        <Seperator />
        <SelectedOrganization />
        <Seperator />
        <SelectedProject />
    </Container>;
};
