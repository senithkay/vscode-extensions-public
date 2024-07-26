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
import { ViewTitle } from "../Components/ViewTitle";
import { ViewHeader } from "../Components/ViewHeader";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { useChoreoWebViewContext } from "../../context/choreo-web-view-ctx";
import { Codicon } from "../../Codicon/Codicon";
import { ChoreoWebViewAPI } from "../../utilities/WebViewRpc";
import { HorizontalGrid, LeftAllignGridRow, TruncatedGridCell, TruncatedGridTitleCell } from "@wso2-enterprise/ui-toolkit";

const Container = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    gap: 10px;
    width: 100%;
    min-height: 62px;
`;

const ProjectButtonWrap = styled.div`
    margin-top: 15px;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
`;

const IconLabel = styled.div`
    margin-left: 5px;
    @media (max-width: 280px) {
        display: none;
    }
`;

export const ProjectDetails = () => {
    const { choreoProject } = useChoreoWebViewContext();

    const changeProject = () => {
        ChoreoWebViewAPI.getInstance().triggerCmd("wso2.choreo.project.open");
    };

    const addNewProject = () => {
        ChoreoWebViewAPI.getInstance().triggerCmd("wso2.choreo.project.create");
    };

    return (
        <Container id="current-project-section">
            <ViewHeader>
                <ViewTitle>Current Project</ViewTitle>
            </ViewHeader>
            <HorizontalGrid aria-label="project">
                <LeftAllignGridRow>
                    <TruncatedGridTitleCell gridColumn="1">Project</TruncatedGridTitleCell>
                    <TruncatedGridCell gridColumn="2">{choreoProject?.name}</TruncatedGridCell>
                </LeftAllignGridRow>
                {choreoProject?.repository && (
                    <LeftAllignGridRow>
                        <TruncatedGridTitleCell gridColumn="1">Repository</TruncatedGridTitleCell>
                        <TruncatedGridCell gridColumn="2">{choreoProject?.repository}</TruncatedGridCell>
                    </LeftAllignGridRow>
                )}
                {choreoProject?.branch && (
                    <LeftAllignGridRow>
                        <TruncatedGridTitleCell gridColumn="1">Branch</TruncatedGridTitleCell>
                        <TruncatedGridCell gridColumn="2">{choreoProject?.branch}</TruncatedGridCell>
                    </LeftAllignGridRow>
                )}
                <LeftAllignGridRow>
                    <TruncatedGridTitleCell gridColumn="1">Version</TruncatedGridTitleCell>
                    <TruncatedGridCell gridColumn="2">{choreoProject?.version}</TruncatedGridCell>
                </LeftAllignGridRow>
            </HorizontalGrid>
            <ProjectButtonWrap>
                <VSCodeButton appearance="icon" onClick={changeProject} title="Open a different choreo project">
                    <Codicon name="link-external" />
                    <IconLabel>Open Project</IconLabel>
                </VSCodeButton>
                <VSCodeButton appearance="icon" onClick={addNewProject} title="Create new choreo project">
                    <Codicon name="add" />
                    <IconLabel>Create Project</IconLabel>
                </VSCodeButton>
            </ProjectButtonWrap>
        </Container>
    );
};
