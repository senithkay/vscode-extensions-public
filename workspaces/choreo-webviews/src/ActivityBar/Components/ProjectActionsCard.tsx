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
import { ViewTitle } from "./ViewTitle";
import { ChoreoWebViewAPI } from "../../utilities/WebViewRpc";
import { useOrgOfCurrentProject } from "../../hooks/use-org-of-current-project";
import { useChoreoWebViewContext } from "../../context/choreo-web-view-ctx";
import { ComponentsCard } from "./ComponentsCard";
import { ComponentsPushAction } from './projectActions/ComponentsPushAction';
import { ComponentsSyncAction } from './projectActions/ComponentsSyncAction';
import { ArchiViewButton } from './projectActions/ArchitectureViewButton';
import { ProjectActionLink } from "./ProjectActionLink";
import { CellViewButton } from "./projectActions/CellViewButton";

const Container = styled.div`
    margin-top: 10px;
`;

const Body = styled.div`
    display: flex;
    flex-direction: column;
    gap: 5px;
    margin-top: 15px;
    margin-left: 10px;
`;

export const ProjectActionsCard: React.FC = () => {
    const { currentProjectOrg } = useOrgOfCurrentProject();
    const { choreoUrl, choreoProject } = useChoreoWebViewContext();

    const projectURL = `${choreoUrl}/organizations/${currentProjectOrg?.handle}/projects/${choreoProject?.id}`;

    const openProjectInChoreoConsole = () => {
        ChoreoWebViewAPI.getInstance().openExternal(projectURL);
    }

    return (
        <>
            <Container>
                <ViewTitle>Actions</ViewTitle>
                <Body>
                    <ArchiViewButton />
                    <CellViewButton />
                    <ProjectActionLink onClick={openProjectInChoreoConsole} label="Open in Choreo Console" />
                    <ComponentsPushAction />
                    <ComponentsSyncAction />
                </Body>
            </Container>
            <ComponentsCard />
        </>
    );
};
