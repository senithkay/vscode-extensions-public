/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect } from "react";
import { MachineStateValue, ProjectStructureResponse, WorkspaceFolder } from "@wso2-enterprise/mi-core";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import ProjectStructureView from "./ProjectStructureView";
import { Typography } from "@wso2-enterprise/ui-toolkit";
import styled from "@emotion/styled";

// TODO: Can remove below if we don't need the workspaces list
// import { VSCodeDropdown, VSCodeOption } from "@vscode/webview-ui-toolkit/react";
// import styled from "@emotion/styled";
// const DropDownContainer = styled.div`
//     margin-top: 20px;
//     display: flex;
//     flex-direction: column;
//     width: 50%;
//     display: none;
// `;

const TitleWrapper = styled.div`
    padding: 5px 0 0;
    margin-bottom: 10px;
    border: none;
    font-weight: 400;
    font-size: 2.7em;
    white-space: nowrap;
`;

const OverviewContainer = styled.div`
    height:calc(100vh - 60px);
    overflow: auto;
    margin: 20px;
`;

export function Overview() {
    const { rpcClient } = useVisualizerContext();
    const [workspaces, setWorkspaces] = React.useState<WorkspaceFolder[]>([]);
    const [selected, setSelected] = React.useState<string>("");
    const [projectStructure, setProjectStructure] = React.useState<ProjectStructureResponse>(undefined);

    useEffect(() => {
        rpcClient.getMiVisualizerRpcClient().getWorkspaces().then((response) => {
            setWorkspaces(response.workspaces);
            changeWorkspace(response.workspaces[0].fsPath);
        });
    }, []);

    useEffect(() => {
        if (workspaces && selected) {
            rpcClient.getMiVisualizerRpcClient().getProjectStructure({ documentUri: selected }).then((response) => {
                setProjectStructure(response);
            });
        }
    }, [selected]);

    const changeWorkspace = (fsPath: string) => {
        setSelected(fsPath);
    }

    return (
        <OverviewContainer>
            {/* TODO: Below code is to show the list of workspaces */}
            {/* <DropDownContainer>
                <label htmlFor="workspaces">MI Workspaces</label>
                <VSCodeDropdown id="workspaces" onChange={(e: React.ChangeEvent<HTMLSelectElement>) => changeWorkspace(e.target.value)}>
                    {workspaces.map((option) => (
                        <VSCodeOption key={option.index} value={option.fsPath} selected={option.fsPath === selected}>
                            {option.name}
                        </VSCodeOption>
                    ))}
                </VSCodeDropdown>
            </DropDownContainer> */}
            <TitleWrapper>Project Overview</TitleWrapper>
            {projectStructure && <ProjectStructureView projectStructure={projectStructure} />}

        </OverviewContainer>
    );
}
