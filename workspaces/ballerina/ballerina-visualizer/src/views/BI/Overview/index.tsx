/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect } from "react";
import {
    DIRECTORY_MAP,
    EVENT_TYPE,
    MACHINE_VIEW,
    ProjectStructureArtifactResponse,
    ProjectStructureResponse,
} from "@wso2-enterprise/ballerina-core";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import {
    Button,
    Codicon,
    TextField,
    Typography,
    View,
    ViewContent,
} from "@wso2-enterprise/ui-toolkit";
import styled from "@emotion/styled";
import { BIHeader } from "../BIHeader";
import { EmptyCard } from "../../../components/EmptyCard";
import { ButtonCard } from "../../../components/ButtonCard";
import { useVisualizerContext } from "../../../Context";

interface OverviewProps {
    stateUpdated: boolean;
}

const CardContainer = styled.div`
    display: flex;
    justify-content: space-between;
    padding: 10px;
`;

const SectionTitle = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const GridContainer = styled.div`
    display: grid;
    grid-template-columns: 1fr;

    & > *:not(:last-child) {
        border-right: unset;
        border-bottom: 1px solid var(--vscode-editorIndentGuide-background);
    }

    @media (min-width: 1024px) {
        grid-template-columns: 3fr 1fr;
        & > *:not(:last-child) {
            border-right: 1px solid var(--vscode-editorIndentGuide-background);
            border-bottom: unset;
        }
    }
`;

const InnerGridContainer = styled.div`
    display: grid;
    grid-template-columns: 1fr;

    & > *:not(:last-child) {
        border-right: unset;
    }

    @media (min-width: 768px) {
        grid-template-columns: repeat(2, 1fr);
        & > *:not(:last-child) {
            border-right: 1px solid var(--vscode-editorIndentGuide-background);
        }
    }
`;

const SectionContainer = styled.div`
    padding: 8px 20px 20px;
`;

const LeftColumn = styled.div`
    display: grid;
    grid-template-columns: 1fr;

    & > *:not(:last-child) {
        border-bottom: 1px solid var(--vscode-editorIndentGuide-background);
    }
`;

const SchemaItem = styled.div`
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
    cursor: pointer;
    &:hover {
        background-color: var(--vscode-editorIndentGuide-background);
    }
    padding: 8px;
`;

const Row = styled.div`
    display: flex;
`;

const CardGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 20px;
    width: 100%;
`;

export function Overview(props: OverviewProps) {
    const { rpcClient } = useRpcContext();
    const { setPopupMessage, setSidePanel } = useVisualizerContext();
    const [projectName, setProjectName] = React.useState<string>("");
    const [projectStructure, setProjectStructure] = React.useState<ProjectStructureResponse>(undefined);

    rpcClient?.onProjectContentUpdated((state: boolean) => {
        if (state) {
            fetchContext();
        }
    });

    const fetchContext = () => {
        rpcClient
            .getBIDiagramRpcClient()
            .getProjectStructure()
            .then((res) => {
                setProjectStructure(res);
            });
        rpcClient
            .getBIDiagramRpcClient()
            .getWorkspaces()
            .then((res) => {
                setProjectName(res.workspaces[0].name);
            });
    }

    useEffect(() => {
        fetchContext();
    }, []);

    const goToView = async (res: ProjectStructureArtifactResponse) => {
        rpcClient
            .getVisualizerRpcClient()
            .openView({ type: EVENT_TYPE.OPEN_VIEW, location: { documentUri: res.path, position: res.position } });
    };

    const handleAddArtifact = () => {
        rpcClient.getVisualizerRpcClient().openView({
            type: EVENT_TYPE.OPEN_VIEW,
            location: {
                view: MACHINE_VIEW.BIComponentView,
            },
        });
    };

    const handleAddConnection = () => {
        rpcClient.getVisualizerRpcClient().openView({
            type: EVENT_TYPE.OPEN_VIEW,
            location: {
                view: MACHINE_VIEW.AddConnectionWizard,
            },
            isPopup: false
        });
    };

    const handleAddShema = () => {
        setSidePanel("RECORD_EDITOR");
    };

    return (
        <View>
            <ViewContent padding>
                <BIHeader showAI={projectStructure?.directoryMap[DIRECTORY_MAP.SERVICES].length === 0} />
                {/*  Main Content with Two Columns */}
                <GridContainer>
                    {/*  Left Column */}
                    <LeftColumn>
                        {/* Entry Points Section */}
                        <SectionContainer>
                            <SectionTitle>
                                <Typography variant="h2">Entry Points</Typography>
                                {projectStructure?.directoryMap[DIRECTORY_MAP.SERVICES].length > 0 && (
                                    <Button appearance="icon" onClick={handleAddArtifact} tooltip="Add Artifact">
                                        <Codicon name="add" />
                                    </Button>
                                )}
                            </SectionTitle>
                            <Row>
                                {projectStructure?.directoryMap[DIRECTORY_MAP.SERVICES].length > 0 ? (
                                    <CardGrid>
                                        {projectStructure?.directoryMap[DIRECTORY_MAP.SERVICES].map((res, index) => (
                                            <ButtonCard
                                                key={index}
                                                title={`${res.name} ${res.type === "HTTP" ? "service" : ""}`}
                                                caption={res.type}
                                                description={`Path: ${res.context}`}
                                                icon={<Codicon name="globe" />}
                                                onClick={() => goToView(res)}
                                            />
                                        ))}
                                    </CardGrid>
                                ) : (
                                    <EmptyCard
                                        description="Define how your integration starts, such as services, tasks, or webhook triggers. You can add multiple entry points."
                                        actionText="Add Entry Point"
                                        onClick={handleAddArtifact}
                                    />
                                )}
                            </Row>
                        </SectionContainer>
                        {/* Connections Section*/}
                        <SectionContainer>
                            <SectionTitle>
                                <h2 className="text-base mb-4">Connections</h2>
                                {projectStructure?.directoryMap[DIRECTORY_MAP.CONNECTIONS].length > 0 && (
                                    <Button appearance="icon" onClick={handleAddConnection} tooltip="Add Connection">
                                        <Codicon name="add" />
                                    </Button>
                                )}
                            </SectionTitle>
                            <Row>
                                {projectStructure?.directoryMap[DIRECTORY_MAP.CONNECTIONS].length > 0 ? (
                                    <CardGrid>
                                        {projectStructure?.directoryMap[DIRECTORY_MAP.CONNECTIONS].map((res, index) => (
                                            <ButtonCard
                                                key={index}
                                                title={res.name}
                                                description={`Module: ${(res.st as any).initializer?.typeData?.typeSymbol?.moduleID
                                                    ?.moduleName || res.type
                                                    }`}
                                                icon={<Codicon name="link" />}
                                                onClick={() => goToView(res)}
                                            />
                                        ))}
                                    </CardGrid>
                                ) : (
                                    <EmptyCard
                                        description="Set up connections to external services like databases or third-party APIs. Predefine your connections here."
                                        actionText="Add Connection"
                                        onClick={handleAddConnection}
                                    />
                                )}
                            </Row>
                        </SectionContainer>
                        {/*  Second Content with Two Columns */}
                        <InnerGridContainer>
                            {/* Schemas Section*/}
                            <SectionContainer>
                                <SectionTitle>
                                    <h2 className="text-base">Schemas</h2>
                                    {projectStructure?.directoryMap[DIRECTORY_MAP.SCHEMAS].length > 0 && (
                                        <Button appearance="icon" onClick={handleAddShema} tooltip="Add Artifact">
                                            <Codicon name="add" />
                                        </Button>
                                    )}
                                </SectionTitle>
                                <div className="p-4max-h-64 overflow-y-auto">
                                    {projectStructure?.directoryMap[DIRECTORY_MAP.SCHEMAS].length > 0 ? (
                                        <>
                                            <CardContainer>
                                                <span>Name</span>
                                                <span>Action</span>
                                            </CardContainer>
                                            {projectStructure?.directoryMap[DIRECTORY_MAP.SCHEMAS].map((res, index) => (
                                                <SchemaItem key={index} onClick={() => goToView(res)}>
                                                    <span>{res.name}</span>
                                                    <span>...</span>
                                                </SchemaItem>
                                            ))}
                                        </>
                                    ) : (
                                        <EmptyCard
                                            description="Create and manage data types using JSON schema. Generate reusable types for your integration."
                                            actionText="Add Schema"
                                            onClick={handleAddShema}
                                        />
                                    )}
                                </div>
                            </SectionContainer>

                            {/* Function Section*/}
                            <SectionContainer>
                                <SectionTitle>
                                    <h2 className="text-base">Functions</h2>
                                    {projectStructure?.directoryMap[DIRECTORY_MAP.TASKS].length > 0 && (
                                        <Button appearance="icon" onClick={() => setPopupMessage(true)} tooltip="Add Function">
                                            <Codicon name="add" />
                                        </Button>
                                    )}
                                </SectionTitle>
                                {projectStructure?.directoryMap[DIRECTORY_MAP.TASKS].length > 0 && (
                                    <TextField onTextChange={null} value={null} placeholder="Search function" />
                                )}
                                <div className="p-2">
                                    {projectStructure?.directoryMap[DIRECTORY_MAP.TASKS].length > 0 ? (
                                        <>
                                            <CardContainer>
                                                <span>Name</span>
                                                <span>Type</span>
                                            </CardContainer>
                                            {projectStructure?.directoryMap[DIRECTORY_MAP.TASKS].map((res, index) => (
                                                <SchemaItem key={index} onClick={() => goToView(res)}>
                                                    <span>{res.name}</span>
                                                    <span>Data Mapper</span>
                                                </SchemaItem>
                                            ))}
                                        </>
                                    ) : (
                                        <EmptyCard
                                            description="Add reusable functions to be used within your entry points. Enhance your integration with custom logic"
                                            actionText="Add Function"
                                            onClick={() => setPopupMessage(true)}
                                        />
                                    )}
                                </div>
                            </SectionContainer>
                        </InnerGridContainer>
                    </LeftColumn>

                    {/* Configurations Section*/}
                    <SectionContainer>
                        <SectionTitle>
                            <h2 className="text-base">Configurations</h2>
                        </SectionTitle>
                        <EmptyCard
                            description="Manage environment variables and secrets. Share them across different entry points and functions in your project."
                            actionText="Add Configuration"
                            onClick={() => setPopupMessage(true)}
                        />
                    </SectionContainer>
                </GridContainer>
            </ViewContent>
        </View >
    );
}
