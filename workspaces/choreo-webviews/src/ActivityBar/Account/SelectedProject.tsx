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
import { ViewHeader } from "../Components/ViewHeader";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { Codicon } from "../../Codicon/Codicon";

const Container = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    gap: 10px;
    width: 100%;
`;

const Body = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
`;

export const SelectedProject = () => {

    const { choreoProject } = useContext(ChoreoWebViewContext);

    const changeProject = () => {
    };

    return <Container>
        <ViewHeader>
            <ViewTitle>
                Project
            </ViewTitle>
            <VSCodeButton
                    appearance="icon"
                    onClick={changeProject}
                    title={"Change Choreo Project"}
                    id="change-project-btn"
                    style={{ marginLeft: "auto" }}
                >
                Change
                <Codicon name={"arrow-swap"} />
            </VSCodeButton>
        </ViewHeader>
        <Body>
            {!choreoProject && <div>fetching project info...</div>}
            <div>Name: {choreoProject?.name}</div>
            <div>Description: {choreoProject?.description.trim() || "N/A"}</div>
            <div>Region: {choreoProject?.region || "N/A"}</div>
            <div>Created: {choreoProject?.createdData || "N/A"}</div>
        </Body>
    </Container>;
};
