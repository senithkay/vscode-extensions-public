/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { FC, ReactNode, useEffect } from "react";
import { DIRECTORY_MAP, EVENT_TYPE, MACHINE_VIEW, ProjectStructureArtifactResponse, ProjectStructureResponse } from "@wso2-enterprise/ballerina-core";
import { useVisualizerContext } from "@wso2-enterprise/ballerina-rpc-client";
import ProjectStructureView from "./ProjectStructureView";
import { View, ViewContent, ViewHeader } from "../../../components/View";
import { SkeletonText } from "../../../components/Skeletons";
import { Button, Codicon, ComponentCard, Divider, TextField, Typography } from "@wso2-enterprise/ui-toolkit";
import { VSCodeLink } from "@vscode/webview-ui-toolkit/react";
import styled from "@emotion/styled";

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

    const goToView = async (res: ProjectStructureArtifactResponse) => {
        rpcClient.getVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { documentUri: res.path, position: res.position } });
    };


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
            {/* <ViewHeader
                title={`Project: ${projectName}`}
                icon="project"
                iconSx={{ fontSize: "15px" }}
            > */}
            {/* <Button
                     appearance="icon"
                    onClick={handleAddArtifact}
                    tooltip="Add Artifact"
                >
                    <Codicon name="add" />
                </Button> */}
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
            {/* </ViewHeader> */}
            <ViewContent padding>

                <div className="flex gap-2 mb-6">
                    <h1 className="font-bold text-2xl md:text-3xl capitalize">{projectName}</h1>
                    <h2 className="hidden font-thin text-2xl opacity-30 sm:block md:text-3xl">Project</h2>
                </div>


                <Divider />
                {/* {projectStructure && <ProjectStructureView projectStructure={projectStructure} />} */}


                {/*  Main Content with Two Columns */}
                <div className="grid grid-cols-1 lg:grid-cols-[3fr,1fr] gap-8">

                    {/*  Left Column */}
                    <div className="border-r border-vscode-editorIndentGuide-background p-2">

                        {/* Entry Points Section */}
                        <div className="mb-8 p-2">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-base mb-4">Entry Points</h2>
                                <Button
                                    appearance="icon"
                                    onClick={handleAddArtifact}
                                    tooltip="Add Artifact"
                                >
                                    <Codicon name="add" />
                                </Button>
                            </div>
                            <div className="flex space-x-4">
                                {projectStructure?.directoryMap[DIRECTORY_MAP.SERVICES].length > 0 ? (
                                    projectStructure?.directoryMap[DIRECTORY_MAP.SERVICES].map((res, index) => (
                                        <div key={index} className="border border-vscode p-6 w-64 h-32 cursor-pointer hover:bg-vscode-editorIndentGuide-background" onClick={() => goToView(res)}>
                                            <div className="flex justify-between">
                                                <span className="text-sm">{res.name}</span>
                                                <span className="text-sm">{res.type}</span>
                                            </div>
                                            <p className="mt-6">API Context: {res.context}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p>No services/automation available.</p>
                                )}
                            </div>
                        </div>

                        <Divider />

                        {/* Connections Section*/}
                        <div className="mb-8 p-2">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-base mb-4">Connections</h2>
                                <Button
                                    appearance="icon"
                                    onClick={handleAddArtifact}
                                    tooltip="Add Artifact"
                                >
                                    <Codicon name="add" />
                                </Button>
                            </div>
                            <div className="flex space-x-4">
                                {projectStructure?.directoryMap[DIRECTORY_MAP.CONNECTIONS].length > 0 ? (
                                    projectStructure?.directoryMap[DIRECTORY_MAP.CONNECTIONS].map((res, index) => (
                                        <div key={index} className="flex items-center justify-center w-32 h-32 rounded-full border border-vscode cursor-pointer hover:bg-vscode-editorIndentGuide-background" onClick={() => goToView(res)}>
                                            <span>{res.name}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p>No global connections available.</p>
                                )}
                            </div>
                        </div>


                        <Divider />
                        {/*  Second Content with Two Columns */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                            {/* Schemas Section*/}
                            <div className="mb-8 border-r border-vscode-editorIndentGuide-background p-2">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-base">Schemas</h2>
                                    <Button
                                        appearance="icon"
                                        onClick={handleAddArtifact}
                                        tooltip="Add Artifact"
                                    >
                                        <Codicon name="add" />
                                    </Button>
                                </div>
                                <div className="p-4max-h-64 overflow-y-auto">
                                    <div className="flex justify-between mb-2">
                                        <span>Name</span>
                                        <span>Action</span>
                                    </div>
                                    {projectStructure?.directoryMap[DIRECTORY_MAP.SCHEMAS].length > 0 ? (
                                        projectStructure?.directoryMap[DIRECTORY_MAP.SCHEMAS].map((res, index) => (
                                            <div key={index} className="flex justify-between mb-2 cursor-pointer hover:bg-vscode-editorIndentGuide-background" onClick={() => goToView(res)}>
                                                <span>{res.name}</span>
                                                <span>...</span>
                                            </div>
                                        ))
                                    ) : (
                                        <p>No schemas available.</p>
                                    )}
                                </div>
                            </div>

                            {/* Function Section*/}
                            <div className="mb-8 p-2">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-base">Functions</h2>
                                    <Button
                                        appearance="icon"
                                        onClick={handleAddArtifact}
                                        tooltip="Add Artifact"
                                    >
                                        <Codicon name="add" />
                                    </Button>
                                </div>
                                <TextField
                                    onTextChange={null}
                                    sx={{ marginTop: 20 }}
                                    value={null}
                                    placeholder="Search function"
                                />
                                <div className="p-2">
                                    <div className="flex justify-between mb-2">
                                        <span>Name</span>
                                        <span>Type</span>
                                    </div>
                                    {projectStructure?.directoryMap[DIRECTORY_MAP.TASKS].length > 0 ? (
                                        projectStructure?.directoryMap[DIRECTORY_MAP.TASKS].map((res, index) => (
                                            <div key={index} className="flex justify-between mb-2 cursor-pointer hover:bg-vscode-editorIndentGuide-background" onClick={() => goToView(res)}>
                                                <span>{res.name}</span>
                                                <span>Data Mapper</span>
                                            </div>
                                        ))
                                    ) : (
                                        <p>No functions available.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Configurations Section*/}
                    <div className="mb-8 p-2">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-base">Configurations</h2>
                            <Button
                                appearance="icon"
                                onClick={handleAddArtifact}
                                tooltip="Add Artifact"
                            >
                                <Codicon name="add" />
                            </Button>
                        </div>
                        <div className="p-2">
                            <span>No Configurations Found.</span>
                            {/* <div className="flex justify-between mb-2 cursor-pointer hover:bg-vscode-editorIndentGuide-background">
                                <span>Google Token</span>
                            </div>
                            <div className="flex justify-between mb-2 cursor-pointer hover:bg-vscode-editorIndentGuide-background">
                                <span>Choreo Token</span>
                            </div> */}
                        </div>
                    </div>
                </div>

            </ViewContent>
        </View>
    );
}
