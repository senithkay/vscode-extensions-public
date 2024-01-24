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
import { VSCodeDropdown, VSCodeOption } from "@vscode/webview-ui-toolkit/react";
import styled from "@emotion/styled";


const DropDownContainer = styled.div`
    margin-top: 20px;
    display: flex;
    flex-direction: column;
    width: 50%;
    display: none;
`;

export function Overview() {
    const { rpcClient } = useVisualizerContext();
    const [workspaces, setWorkspaces] = React.useState<WorkspaceFolder[]>([]);
    const [selected, setSelected] = React.useState<string>("");
    const [projectStructure, setProjectStructure] = React.useState<ProjectStructureResponse>(undefined);

    const [state, setState] = React.useState<MachineStateValue>('initialize');

    // Listening to state value change
    rpcClient?.onStateChanged((newState: MachineStateValue) => {
        setState(newState);
    });

    useEffect(() => {
        if (rpcClient) {
            rpcClient.getMiVisualizerRpcClient().getWorkspaces().then((response) => {
                setWorkspaces(response.workspaces);
            });
        }
    }, [state]);

    useEffect(() => {
        if (selected) {
            rpcClient.getMiVisualizerRpcClient().getProjectStructure({ documentUri: selected }).then((response) => {
                setProjectStructure(response);
            });
        }
    }, [selected]);

    const changeWorkspace = (fsPath: string) => {
        setSelected(fsPath);
    }

    return (
        <>
            <DropDownContainer>
                <label htmlFor="workspaces">MI Workspaces</label>
                <VSCodeDropdown id="workspaces" onChange={(e: React.ChangeEvent<HTMLSelectElement>) => changeWorkspace(e.target.value)}>
                    {workspaces.map((option) => (
                        <VSCodeOption key={option.index} value={option.fsPath} selected={option.fsPath === selected}>
                            {option.name}
                        </VSCodeOption>
                    ))}
                </VSCodeDropdown>
            </DropDownContainer>
            <h1>Hello Overview </h1>
            
        </>
    );
}
