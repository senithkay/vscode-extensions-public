/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect } from "react";
import { DIRECTORY_MAP, EVENT_TYPE, MACHINE_VIEW, ProjectStructureArtifactResponse, ProjectStructureResponse } from "@wso2-enterprise/ballerina-core";
import { useVisualizerContext } from "@wso2-enterprise/ballerina-rpc-client";
import { View, ViewContent } from "../../../components/View";
import { Button, Codicon, ComponentCard, Divider, TextField, Typography } from "@wso2-enterprise/ui-toolkit";
import styled from "@emotion/styled";
import { EggplantHeader } from "../EggplantHeader";

interface OverviewProps {
    stateUpdated: boolean;
}

const TitleContainer = styled.div`
    display: flex;
    gap: 0.5rem;
`;

const ProjectTitle = styled.h1`
    font-weight: bold;
    font-size: 1.5rem;
    text-transform: capitalize;

    @media (min-width: 768px) {
        font-size: 1.875rem;
    }
`;

const ProjectSubtitle = styled.h2`
    display: none;
    font-weight: 200;
    font-size: 1.5rem;
    opacity: 0.3;

    @media (min-width: 640px) {
        display: block;
    }

    @media (min-width: 768px) {
        font-size: 1.875rem;
    }
`;

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
    gap: 2rem;

    @media (min-width: 1024px) {
        grid-template-columns: 3fr 1fr;
    }
`;

const InnerGridContainer = styled.div`
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;

    @media (min-width: 768px) {
        grid-template-columns: repeat(2, 1fr);
    }
`;

const SectionContainer = styled.div`
    margin-bottom: 2rem;
    padding: 0.5rem;
`;

const LeftColumn = styled.div`
    border-right: 1px solid var(--vscode-editorIndentGuide-background);
    padding: 0.5rem;
`;

const SchemasSection = styled.div`
    margin-bottom: 2rem;
    border-right: 1px solid var(--vscode-editorIndentGuide-background);
    padding: 0.5rem;
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

const ConnectionItem = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 8rem;
    height: 8rem;
    border-radius: 50%;
    border: 1px solid var(--vscode-editor-foreground);
    cursor: pointer;
    &:hover {
        background-color: var(--vscode-editor-hoverHighlightBackground);
    }
`;

const FlexContainer = styled.div`
    display: flex;
    gap: 1rem;
`;

const SectionEmpty = styled.div`
    margin: auto;
    width: fit-content;
    text-align: -webkit-center;
`;

export function Overview(props: OverviewProps) {
    const { rpcClient } = useVisualizerContext();
    const [projectName, setProjectName] = React.useState<string>("");
    const [projectStructure, setProjectStructure] = React.useState<ProjectStructureResponse>(undefined);

    useEffect(() => {
        rpcClient.getEggplantDiagramRpcClient().getProjectStructure().then(res => {
            setProjectStructure(res);
        })
        rpcClient.getEggplantDiagramRpcClient().getWorkspaces().then(res => {
            setProjectName(res.workspaces[0].name);
        })
    }, []);

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
            <ViewContent padding>
                <EggplantHeader />
                {/*  Main Content with Two Columns */}
                <GridContainer>
                    {/*  Left Column */}
                    <LeftColumn>
                        {/* Entry Points Section */}
                        <SectionContainer>
                            <SectionTitle>
                                <Typography variant="h2">Entry Points</Typography>
                                {projectStructure?.directoryMap[DIRECTORY_MAP.SERVICES].length > 0 &&
                                    <Button
                                        appearance="icon"
                                        onClick={handleAddArtifact}
                                        tooltip="Add Artifact"
                                    >
                                        <Codicon name="add" />
                                    </Button>
                                }
                            </SectionTitle>
                            <FlexContainer>
                                {projectStructure?.directoryMap[DIRECTORY_MAP.SERVICES].length > 0 ? (
                                    projectStructure?.directoryMap[DIRECTORY_MAP.SERVICES].map((res, index) => (
                                        <ComponentCard
                                            id={index.toString()}
                                            onClick={() => goToView(res)}
                                            sx={{
                                                '&:hover, &.active': {
                                                    '.icon svg g': {
                                                        fill: 'var(--vscode-editor-foreground)'
                                                    },
                                                    backgroundColor: 'var(--vscode-editor-hoverHighlightBackground)',
                                                },
                                                border: '1px solid var(--vscode-editor-foreground)',
                                                borderRadius: 1,
                                                cursor: 'pointer',
                                                display: 'block',
                                                marginBottom: 16,
                                                marginRight: 16,
                                                padding: 30,
                                                width: 300
                                            }}
                                        >

                                            <CardContainer>
                                                <Typography variant="h3">
                                                    {res.name}
                                                </Typography>
                                                <Typography variant="h3">
                                                    {res.type}
                                                </Typography>
                                            </CardContainer>
                                            <Typography variant="h4">
                                                API Context: {res.context}
                                            </Typography>
                                        </ComponentCard>
                                    ))
                                ) : (
                                    <SectionEmpty>
                                        <ComponentCard
                                            id={"config"}
                                            onClick={handleAddArtifact}
                                            sx={{
                                                '&:hover, &.active': {
                                                    '.icon svg g': {
                                                        fill: 'var(--vscode-editor-foreground)'
                                                    },
                                                    backgroundColor: 'var(--vscode-editor-hoverHighlightBackground)',
                                                },
                                                border: '1px solid var(--vscode-editor-foreground)',
                                                borderRadius: 1,
                                                cursor: 'pointer',
                                                display: 'block',
                                                marginBottom: 16,
                                                padding: 20,
                                                width: 200,
                                                textAlign: '-webkit-center'
                                            }}
                                        >
                                            <Codicon name="add" />
                                            <Typography variant="h4">
                                                Add entry point
                                            </Typography>
                                        </ComponentCard>
                                    </SectionEmpty>
                                )}
                            </FlexContainer>
                        </SectionContainer>
                        <Divider />
                        {/* Connections Section*/}
                        <SectionContainer>
                            <SectionTitle>
                                <h2 className="text-base mb-4">Connections</h2>
                                {projectStructure?.directoryMap[DIRECTORY_MAP.CONNECTIONS].length > 0 &&
                                    <Button
                                        appearance="icon"
                                        onClick={handleAddArtifact}
                                        tooltip="Add Artifact"
                                    >
                                        <Codicon name="add" />
                                    </Button>
                                }
                            </SectionTitle>
                            <FlexContainer>
                                {projectStructure?.directoryMap[DIRECTORY_MAP.CONNECTIONS].length > 0 ? (
                                    projectStructure?.directoryMap[DIRECTORY_MAP.CONNECTIONS].map((res, index) => (
                                        <ConnectionItem key={index} onClick={() => goToView(res)}>
                                            <span>{res.name}</span>
                                        </ConnectionItem>
                                    ))
                                ) : (
                                    <SectionEmpty>
                                        <ConnectionItem onClick={() => { }}>
                                            <SectionEmpty>
                                                <Codicon name="add" />
                                                <Typography variant="h4">
                                                    Add connection
                                                </Typography>
                                            </SectionEmpty>
                                        </ConnectionItem>
                                    </SectionEmpty>
                                )}
                            </FlexContainer>
                        </SectionContainer>
                        <Divider />
                        {/*  Second Content with Two Columns */}
                        <InnerGridContainer>

                            {/* Schemas Section*/}
                            <SchemasSection>
                                <SectionTitle>
                                    <h2 className="text-base">Schemas</h2>
                                    {projectStructure?.directoryMap[DIRECTORY_MAP.SCHEMAS].length > 0 &&
                                        <Button
                                            appearance="icon"
                                            onClick={handleAddArtifact}
                                            tooltip="Add Artifact"
                                        >
                                            <Codicon name="add" />
                                        </Button>
                                    }
                                </SectionTitle>
                                <div className="p-4max-h-64 overflow-y-auto">
                                    <CardContainer>
                                        <span>Name</span>
                                        <span>Action</span>
                                    </CardContainer>
                                    {projectStructure?.directoryMap[DIRECTORY_MAP.SCHEMAS].length > 0 ? (
                                        projectStructure?.directoryMap[DIRECTORY_MAP.SCHEMAS].map((res, index) => (
                                            <SchemaItem key={index} onClick={() => goToView(res)}>
                                                <span>{res.name}</span>
                                                <span>...</span>
                                            </SchemaItem>
                                        ))
                                    ) : (
                                        <SectionEmpty>
                                            <ComponentCard
                                                id={"config"}
                                                onClick={null}
                                                sx={{
                                                    '&:hover, &.active': {
                                                        '.icon svg g': {
                                                            fill: 'var(--vscode-editor-foreground)'
                                                        },
                                                        backgroundColor: 'var(--vscode-editor-hoverHighlightBackground)',
                                                    },
                                                    border: '1px solid var(--vscode-editor-foreground)',
                                                    borderRadius: 1,
                                                    cursor: 'pointer',
                                                    display: 'block',
                                                    marginBottom: 16,
                                                    padding: 20,
                                                    width: 200,
                                                    textAlign: '-webkit-center'
                                                }}
                                            >
                                                <Codicon name="add" />
                                                <Typography variant="h4">
                                                    Add schema
                                                </Typography>
                                            </ComponentCard>
                                        </SectionEmpty>
                                    )}
                                </div>
                            </SchemasSection>

                            {/* Function Section*/}
                            <SectionContainer>
                                <SectionTitle>
                                    <h2 className="text-base">Functions</h2>
                                    {projectStructure?.directoryMap[DIRECTORY_MAP.TASKS].length > 0 &&
                                        <Button
                                            appearance="icon"
                                            onClick={handleAddArtifact}
                                            tooltip="Add Artifact"
                                        >
                                            <Codicon name="add" />
                                        </Button>
                                    }
                                </SectionTitle>
                                <TextField
                                    onTextChange={null}
                                    value={null}
                                    placeholder="Search function"
                                />
                                <div className="p-2">
                                    <CardContainer>
                                        <span>Name</span>
                                        <span>Type</span>
                                    </CardContainer>
                                    {projectStructure?.directoryMap[DIRECTORY_MAP.TASKS].length > 0 ? (
                                        projectStructure?.directoryMap[DIRECTORY_MAP.TASKS].map((res, index) => (
                                            <SchemaItem key={index} onClick={() => goToView(res)}>
                                                <span>{res.name}</span>
                                                <span>Data Mapper</span>
                                            </SchemaItem>
                                        ))
                                    ) : (
                                        <SectionEmpty>
                                            <ComponentCard
                                                id={"config"}
                                                onClick={null}
                                                sx={{
                                                    '&:hover, &.active': {
                                                        '.icon svg g': {
                                                            fill: 'var(--vscode-editor-foreground)'
                                                        },
                                                        backgroundColor: 'var(--vscode-editor-hoverHighlightBackground)',
                                                    },
                                                    border: '1px solid var(--vscode-editor-foreground)',
                                                    borderRadius: 1,
                                                    cursor: 'pointer',
                                                    display: 'block',
                                                    marginBottom: 16,
                                                    padding: 20,
                                                    width: 200,
                                                    textAlign: '-webkit-center'
                                                }}
                                            >
                                                <Codicon name="add" />
                                                <Typography variant="h4">
                                                    Add function
                                                </Typography>
                                            </ComponentCard>
                                        </SectionEmpty>
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
                        <SectionEmpty>
                            <ComponentCard
                                id={"config"}
                                onClick={null}
                                sx={{
                                    '&:hover, &.active': {
                                        '.icon svg g': {
                                            fill: 'var(--vscode-editor-foreground)'
                                        },
                                        backgroundColor: 'var(--vscode-editor-hoverHighlightBackground)',
                                    },
                                    border: '1px solid var(--vscode-editor-foreground)',
                                    borderRadius: 1,
                                    cursor: 'pointer',
                                    display: 'block',
                                    marginBottom: 16,
                                    padding: 20,
                                    width: 200,
                                    textAlign: '-webkit-center'
                                }}
                            >
                                <Codicon name="add" />
                                <Typography variant="h4">
                                    Add configuration
                                </Typography>
                                {/* <Typography variant="caption">
                                    A configuration value defines how the integration application interacts with other systems and operates during runtime.
                                </Typography> */}
                            </ComponentCard>
                        </SectionEmpty>
                    </SectionContainer>
                </GridContainer>

            </ViewContent>
        </View>
    );
}
