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
import { Button, HorizontalIcons, Icon, Codicon } from "@wso2-enterprise/ui-toolkit";
import { VSCodeTextArea, VSCodeDivider } from "@vscode/webview-ui-toolkit/react";
import styled from "@emotion/styled";
import { View, ViewContent, ViewHeader } from "../../components/View";


const AddPanel = styled.div({
    backgroundColor: 'var(--vscode-sideBar-background);',
    padding: 20
});

const ProjectActions = styled.div({
    display: 'flex',
    alignItems: 'center',
    gap: '5px'

});

const HorizontalCardContainer = styled.div({
    marginTop: 10,
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '20px',
});

const Card = styled.div({
    backgroundColor: 'var(--vscode-dropdown-background)',
    padding: '10px', // Add padding inside the card if needed
    textAlign: 'center', // Center the text inside the card
});

const StyledTextArea = styled(VSCodeTextArea)({
    width: '100%', // Set the width of the TextArea to 100%
    fontSize: '1.17em', // Set the font size to match <h3> elements
});

const AIButton = styled.div({
    padding: 20,
    with: 200,
    fontSize: '1.17em',
    backgroundColor: 'var(--vscode-button-background)',
    color: 'var(--vscode-button-foreground)',
    borderRadius: 5,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5
});


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
    console.log(projectStructure);
    return (
        <View>
            <ViewHeader title={"Project Name"} codicon="project">
                <ProjectActions>
                    <Button
                        appearance="icon"
                        onClick={() => { }}
                        tooltip="Icon Button"
                    >

                        <Codicon
                            name="play"
                        />
                        &nbsp;Run
                    </Button>
                    <Button
                        appearance="icon"
                        onClick={() => { }}
                        tooltip="Icon Button"
                    >
                        <Codicon
                            name="combine"
                        />
                        &nbsp;&nbsp;Build

                    </Button>
                    <Button tooltip="Deploy your integration on the Cloud with Choreo">
                        <Icon
                            name="choreo"
                            sx={{ marginTop: '2px' }}
                        />
                        &nbsp;Deploy in Choreo
                    </Button>
                </ProjectActions>
            </ViewHeader>
            <ViewContent>
                <AddPanel>
                    <h3>What do you want to create ?</h3>
                    <StyledTextArea label="" value=""></StyledTextArea>
                    <AIButton>
                        <Codicon name="wand" />
                        &nbsp;Generate with AI
                    </AIButton>
                    <VSCodeDivider />
                    <HorizontalCardContainer>
                        <Card>
                            <h3>Add API</h3>
                            <p>Add an HTTP Service</p>
                        </Card>
                        <Card>
                            <h3>Add Proxy</h3>
                        </Card>
                        <Card>
                            <h3>Add Task</h3>
                        </Card>
                        <Card>
                            <h3>Add Inbound Endpoint</h3>
                        </Card>
                    </HorizontalCardContainer>
                </AddPanel>

                {projectStructure && <ProjectStructureView projectStructure={projectStructure} workspaceDir={selected} />}
            </ViewContent>
        </View>
    );
}
