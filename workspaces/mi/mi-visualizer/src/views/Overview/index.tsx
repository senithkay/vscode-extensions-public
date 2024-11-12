/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect } from "react";
import { EVENT_TYPE, MACHINE_VIEW, ProjectOverviewResponse, ProjectStructureResponse, WorkspaceFolder } from "@wso2-enterprise/mi-core";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import ProjectStructureView from "./ProjectStructureView";
import { ViewHeader } from "../../components/View";
import { Button, Codicon, colors, Icon, PanelContent, ProgressIndicator, ProgressRing, Typography } from "@wso2-enterprise/ui-toolkit";
import ComponentDiagram from "./ComponentDiagram";
import styled from "@emotion/styled";
import ReactMarkdown from "react-markdown";
import { VSCodeLink, VSCodePanels, VSCodePanelTab } from "@vscode/webview-ui-toolkit/react";
import { Panels } from "@vscode/webview-ui-toolkit";

const Body = styled.div`
    padding: 0 32px;
    background: ${colors.vscodeEditorBackground};
    min-height: calc(100vh - 60px);
`;

const Columns = styled.div`
    display: flex;
    flex-direction: row;
    gap: 24px;

    @media (max-width: 600px) {
        flex-direction: column;
    }
`;

const Column = styled.div<{ width?: string }>`
    display: block;
    width: ${({ width }: { width?: string }) => width || 'auto'};
    background: ${colors.vscodeTextCodeBlockBackground};
    border-radius: 12px;
    box-shadow: 0 4px 12px ${({ isDarkMode }: any) => isDarkMode ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.05)'}; // Increased shadow for better visibility
    padding: 24px;
`;

const ProjectInfoColumn = styled(Column)`
    width: 300px;
    @media (max-width: 600px) {
        width: auto;
    }
`;


const TabContainer = styled.div`
    display: flex;
    margin-bottom: 24px;
    padding: 8px;
    border-radius: 8px;
`;

const TabContent = styled.div`
    width: 100%;
    animation: fadeIn 0.2s ease-in;
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
`;

const Readme = styled.div`
    border-radius: 12px;
    padding: 16px;
    min-height: 200px;
    overflow: auto;
`;

interface OverviewProps {
}

function Overview(props: OverviewProps) {
    const { rpcClient } = useVisualizerContext();
    const [workspaces, setWorkspaces] = React.useState<WorkspaceFolder[]>([]);
    const [activeWorkspaces, setActiveWorkspaces] = React.useState<WorkspaceFolder>(undefined);
    const [selected, setSelected] = React.useState<string>("");
    const [projectStructure, setProjectStructure] = React.useState<ProjectStructureResponse>(undefined);
    const [projectOverview, setProjectOverview] = React.useState<ProjectOverviewResponse>(undefined);
    const [activeTab, setActiveTab] = React.useState<'diagram' | 'structure'>('diagram');
    const [readmeContent, setReadmeContent] = React.useState<string>("");
    const [isLoading, setIsLoading] = React.useState<boolean>(true);

    useEffect(() => {
        const fetchWorkspaces = async () => {
            const response = await rpcClient.getMiVisualizerRpcClient().getWorkspaces();
            setWorkspaces(response.workspaces);
            setActiveWorkspaces(response.workspaces[0]);
            changeWorkspace(response.workspaces[0].fsPath);

            rpcClient.onDocumentSave(async (data: any) => {
                if (data.uri.endsWith("README.md")) {
                    const readme = await rpcClient.getMiVisualizerRpcClient().getReadmeContent();
                    setReadmeContent(readme.content);
                }
            });
            const readme = await rpcClient.getMiVisualizerRpcClient().getReadmeContent();
            setReadmeContent(readme.content);
            setIsLoading(false);
        };
        fetchWorkspaces();
    }, []);

    useEffect(() => {
        if (workspaces && selected) {
            rpcClient.getMiVisualizerRpcClient().getProjectStructure({ documentUri: selected }).then((response) => {
                setProjectStructure(response);
            });

            rpcClient.getMiVisualizerRpcClient().getProjectOverview({ documentUri: selected }).then((response) => {
                setProjectOverview(response);
            });
        }
    }, [selected, props]);

    const changeWorkspace = (fsPath: string) => {
        setSelected(fsPath);
    }

    const handleBuild = async () => {
        await rpcClient.getMiDiagramRpcClient().buildProject();
    }

    const handleExport = async () => {
        await rpcClient.getMiDiagramRpcClient().exportProject({
            projectPath: activeWorkspaces.fsPath,
        });
    }

    const handleAddArtifact = () => {
        rpcClient.getMiVisualizerRpcClient().openView({
            type: EVENT_TYPE.OPEN_VIEW,
            location: {
                view: MACHINE_VIEW.ADD_ARTIFACT
            },
        })
    }

    const handleEditReadme = () => {
        rpcClient.getMiVisualizerRpcClient().openReadme();
    }

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <ProgressRing />
            </div>
        );
    }

    return (
        <div style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 30px)', padding: '10px 0' }}>
            <div style={{ padding: '0 16px' }}>
                <ViewHeader
                    title={"Project: " + activeWorkspaces?.name}
                    icon="project"
                    iconSx={{ fontSize: "18px", color: "#0066cc" }}
                >
                    <Button
                        appearance="primary"
                        onClick={handleAddArtifact}
                        tooltip="Add Artifact"
                        sx={{
                            background: "#0066cc",
                            '&:hover': {
                                background: "#0052a3"
                            }
                        }}
                    >
                        <Codicon name="add" sx={{ marginRight: "8px" }} />
                        Add Artifact
                    </Button>
                    <Button
                        appearance="icon"
                        onClick={handleBuild}
                        tooltip="Build"
                        sx={{ margin: "0 8px" }}
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
                    </Button>
                </ViewHeader>
            </div>
            <Body>
                <Columns>
                    <Column style={{ flex: '1' }}>
                        <VSCodePanels>
                            <VSCodePanelTab id="component-diagram">Component Diagram</VSCodePanelTab>
                            <VSCodePanelTab id="project-structure">Project Structure</VSCodePanelTab>


                            <PanelContent id={"component-diagram"} >
                                <TabContent style={{ height: '400px', overflow: 'hidden', borderRadius: '8px' }}>
                                    <ComponentDiagram
                                        projectStructure={projectOverview}
                                        projectName={activeWorkspaces?.name}
                                    />
                                </TabContent>
                            </PanelContent>

                            <PanelContent id={"project-structure"} >
                                <TabContent>
                                    {projectStructure && (
                                        <ProjectStructureView
                                            projectStructure={projectStructure}
                                            workspaceDir={selected}
                                        />
                                    )}
                                </TabContent>
                            </PanelContent>
                        </VSCodePanels>
                    </Column>
                    <ProjectInfoColumn>
                        <Typography variant="h3" sx={{ margin: '0 0 16px 0' }}>Project Information</Typography>
                    </ProjectInfoColumn>
                </Columns>
                <Column style={{ marginTop: '16px' }}>
                    <Typography variant="h3" sx={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center' }}>
                        Project Readme
                        {readmeContent && <Icon name="edit" isCodicon onClick={handleEditReadme} sx={{ marginLeft: '8px', paddingTop: '5px', cursor: 'pointer' }} />}
                    </Typography>
                    <Readme>
                        {readmeContent ? (
                            <ReactMarkdown>{readmeContent}</ReactMarkdown>
                        ) : (
                            <div style={{ display: 'flex', marginTop: '20px', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                <Typography variant="h3" sx={{ marginBottom: '16px' }}>
                                    Add a README
                                </Typography>
                                <Typography variant="body1" sx={{ marginBottom: '24px', color: 'var(--vscode-descriptionForeground)' }}>
                                    Describe your integration and generate your constructs with AI
                                </Typography>
                                <VSCodeLink onClick={handleEditReadme}>
                                    Add a README
                                </VSCodeLink>
                            </div>
                        )}
                    </Readme>
                </Column>
            </Body>
        </div>
    );
}
export default React.memo(Overview);
