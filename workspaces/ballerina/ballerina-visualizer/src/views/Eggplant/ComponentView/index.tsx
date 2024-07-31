/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect } from "react";
import { DIRECTORY_MAP, EVENT_TYPE, MACHINE_VIEW } from "@wso2-enterprise/ballerina-core";
import { useVisualizerContext } from "@wso2-enterprise/ballerina-rpc-client";
import { Button, Codicon, Typography, Divider } from "@wso2-enterprise/ui-toolkit";
import { css } from "@emotion/css";
import styled from "@emotion/styled";
import { View, ViewContent } from "../../../components/View";
import { EggplantHeader } from "../EggplantHeader";
import ButtonCard from "../../../components/ButtonCard";

const Container = styled.div({
    display: "flex",
    flexDirection: "column",
    gap: 10,
});

const AddPanel = styled.div({
    position: "relative", // Add this line to position the close button absolutely
    display: "flex",
    flexDirection: "column",
    gap: 10,
    // backgroundColor: "var(--vscode-sideBar-background);",
    padding: 20,
});

const PanelViewMore = styled.div({
    display: "flex",
    flexDirection: "column",
    gap: 10,
});

const HorizontalCardContainer = styled.div({
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    margin: "0px 155px 0px 155px",
    gridAutoRows: "minmax(80px, auto)",
    gap: "40px",
});

const CardGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
    width: 100%;
`;

const Text = styled.p`
    font-size: 14px;
    color: var(--vscode-sideBarTitle-foreground);
`;

const BodyText = styled(Text)`
    color: var(--vscode-sideBarTitle-foreground);
    margin: 0 0 8px;
    opacity: 0.5;
`;

const Title = styled(Typography)`
    margin: 8px 0;
`;

const PanelFooter = styled.div({
    display: "flex",
    justifyContent: "center",
});

// Add this styled component for the close button
const CloseButton = styled(Button)({
    position: "absolute",
    top: "10px",
    right: "10px",
    background: "none", // Optional: Adjust styling as needed
    border: "none", // Optional: Adjust styling as needed
    cursor: "pointer", // Optional: Adjust styling as needed
});

const AIPanel = styled.div({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "5px",
});

const transitionEffect = {
    enter: css({
        transition: "opacity 75ms ease-out",
    }),
    enterFrom: css({
        opacity: 0,
    }),
    enterTo: css({
        opacity: 1,
    }),
    leave: css({
        transition: "opacity 150ms ease-in",
    }),
    leaveFrom: css({
        opacity: 1,
    }),
    leaveTo: css({
        opacity: 0,
    }),
};

export function AddComponentView() {
    const { rpcClient } = useVisualizerContext();
    const [activeWorkspaces, setActiveWorkspaces] = React.useState<any>(undefined);
    const [inputAiPrompt, setInputAiPrompt] = React.useState<string>("");
    const [viewMore, setViewMore] = React.useState<boolean>(false);

    const handleClick = async (key: DIRECTORY_MAP) => {
        if (key === DIRECTORY_MAP.SERVICES) {
            await rpcClient.getVisualizerRpcClient().openView({
                type: EVENT_TYPE.OPEN_VIEW,
                location: {
                    view: MACHINE_VIEW.EggplantServiceForm,
                },
            });
        } else {
            await rpcClient.getVisualizerRpcClient().openView({
                type: EVENT_TYPE.OPEN_VIEW,
                location: {
                    view: MACHINE_VIEW.EggplantServiceForm,
                },
            });
        }
    };

    useEffect(() => {
        rpcClient
            .getEggplantDiagramRpcClient()
            .getWorkspaces()
            .then((response: any) => {
                setActiveWorkspaces(response.workspaces[0]);
                console.log(response.workspaces[0]);
            });
    }, []);

    const handleGenerateWithAI = async () => {
        // rpcClient.getMiVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { view: MACHINE_VIEW.Overview } })
        // rpcClient.getMiDiagramRpcClient().executeCommand({ commands: ["MI.openAiPanel", inputAiPrompt] });
    };

    const handleAiPromptChange = (value: string) => {
        setInputAiPrompt(value);
    };

    return (
        <View>
            <ViewContent padding>
                <EggplantHeader />
                <Container>
                    <AddPanel>
                        <Title variant="h2">Entry Points</Title>
                        <BodyText>
                            Choose how you want your integration to start. Select one of the entry point types below.
                        </BodyText>
                        <CardGrid>
                            <ButtonCard
                                icon={<Codicon name="globe" />}
                                title="Service"
                                description="Start your integration with a HTTP service."
                                onClick={() => handleClick(DIRECTORY_MAP.SERVICES)}
                            />
                            <ButtonCard
                                icon={<Codicon name="calendar" />}
                                title="Task"
                                description="Trigger your integration with a task. Perfect for scheduled or one-time jobs."
                                onClick={() => handleClick(DIRECTORY_MAP.TASKS)}
                            />
                            <ButtonCard
                                icon={<Codicon name="debug-disconnect" />}
                                title="Triggers"
                                description="Initiate your integration with a Trigger. Best for event-driven actions from external sources."
                                onClick={() => handleClick(DIRECTORY_MAP.TRIGGERS)}
                            />
                        </CardGrid>
                        {/* <Transition
                            show={viewMore}
                            {...transitionEffect}
                        > */}
                        <PanelViewMore>
                            <Divider />
                            <Title variant="h2">Other Artifacts</Title>
                            <BodyText>
                                Manage additional components for your integration. Select from the options below.
                            </BodyText>
                            <CardGrid>
                                <ButtonCard
                                    icon={<Codicon name="link" />}
                                    title="Connections"
                                    description="Set up external service connections, like databases and APIs."
                                    onClick={() => handleClick(DIRECTORY_MAP.CONNECTIONS)}
                                />
                                <ButtonCard
                                    icon={<Codicon name="layout" />}
                                    title="Schema"
                                    description="Define and manage data types with JSON schema."
                                    onClick={() => handleClick(DIRECTORY_MAP.SCHEMAS)}
                                />
                                <ButtonCard
                                    icon={<Codicon name="gear" />}
                                    title="Configurations"
                                    description="Handle environment variables and secrets for your project."
                                    onClick={() => handleClick(DIRECTORY_MAP.CONFIGURATIONS)}
                                />
                                <ButtonCard
                                    icon={<Codicon name="file-code" />}
                                    title="Functions"
                                    description="Create reusable functions to streamline your integration logic."
                                    onClick={() => handleClick(DIRECTORY_MAP.CONFIGURATIONS)}
                                />
                            </CardGrid>
                        </PanelViewMore>
                        {/* </Transition> */}
                        {/* <PanelFooter>
                            {!viewMore ? (
                                <LinkButton sx={{ padding: "4px 8px" }} onClick={() => setViewMore(true)}>
                                    <Codicon name="plus" />
                                    <Typography variant="body2">View More</Typography>
                                </LinkButton>
                            ) : (
                                <LinkButton sx={{ padding: "4px 8px" }} onClick={() => setViewMore(false)}>
                                    <Typography variant="body2">Show Less</Typography>
                                </LinkButton>
                            )}
                        </PanelFooter> */}
                    </AddPanel>
                </Container>
            </ViewContent>
        </View>
    );
}
