/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { FC, ReactNode, useEffect } from "react";
import { EVENT_TYPE, MACHINE_VIEW, ProjectStructureResponse } from "@wso2-enterprise/ballerina-core";
import { useVisualizerContext } from "@wso2-enterprise/ballerina-rpc-client";
import ProjectStructureView from "./ProjectStructureView";
import { View, ViewContent, ViewHeader } from "../../../components/View";
import { SkeletonText } from "../../../components/Skeletons";
import { Button, Codicon } from "@wso2-enterprise/ui-toolkit";
import { VSCodeLink } from "@vscode/webview-ui-toolkit/react";
import styled from "@emotion/styled";

import classNames from "classnames";

interface OverviewProps {
    stateUpdated: boolean;
}

export function Overview(props: OverviewProps) {
    const { rpcClient } = useVisualizerContext();
    const [projectName, setProjectName] = React.useState<string>("");
    // const [activeWorkspaces, setActiveWorkspaces] = React.useState<WorkspaceFolder>(undefined);
    const [selected, setSelected] = React.useState<string>("");
    const [projectStructure, setProjectStructure] = React.useState<ProjectStructureResponse>(undefined);

    useEffect(() => {
        rpcClient.getEggplantDiagramRpcClient().getProjectStructure().then(res => {
            setProjectStructure(res);
        })
        rpcClient.getEggplantDiagramRpcClient().getWorkspaces().then(res => {
            setProjectName(res.workspaces[0].name);
        })
    }, []);

    // useEffect(() => {
    //     if (workspaces && selected) {
    //     //     rpcClient.getMiVisualizerRpcClient().getProjectStructure({ documentUri: selected }).then((response) => {
    //     //             console.log(response);
    //     //             setProjectStructure(response);
    //     //         });
    //     // }
    // }, [selected, props]);

    const changeWorkspace = (fsPath: string) => {
        setSelected(fsPath);
    }

    const handleBuild = async () => {
        // await rpcClient.getMiDiagramRpcClient().buildProject();
    }

    const handleExport = async () => {
        // await rpcClient.getMiDiagramRpcClient().exportProject({
        //     projectPath: activeWorkspaces.fsPath,
        // });
    }


    const handleAddArtifact = () => {
        rpcClient.getVisualizerRpcClient().openView({
            type: EVENT_TYPE.OPEN_VIEW,
            location: {
                view: MACHINE_VIEW.EggplantComponentView
            },
        })
    }

    return (
        <View>
            <ViewHeader
                title={`Project: ${projectName}`}
                icon="project"
                iconSx={{ fontSize: "15px" }}
            >
                <Button
                    appearance="primary"
                    onClick={handleAddArtifact}
                    tooltip="Add Artifact"
                >
                    <Codicon name="add" sx={{ marginRight: "4px" }} />
                    Add Component
                </Button>
                {/* <Button
                    appearance="icon"
                    onClick={handleBuild}
                    tooltip="Build"
                >
                    <Codicon name="combine" sx={{ marginRight: "4px" }} />
                    Build
                </Button>
                <Button
                    appearance="icon"
                    onClick={handleExport}
                    tooltip="Export"
                >
                    <Codicon name="export" sx={{ marginRight: "4px" }} />
                    Export
                </Button> */}
            </ViewHeader>
            <ViewContent padding>
                {/* {projectStructure && <ProjectStructureView projectStructure={projectStructure} />} */}



                <div className={classNames("flex w-full flex-col gap-[10px] px-6 py-2")}>
                    <SkeletonText className="w-20" />
                    <Button className="w-full max-w-80 self-center sm:self-start">
                        Sign In
                    </Button>
                </div>

            </ViewContent>
        </View>
    );
}
