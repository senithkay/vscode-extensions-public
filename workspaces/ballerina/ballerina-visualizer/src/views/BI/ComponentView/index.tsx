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
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import { Codicon, Divider, Typography, View, ViewContent } from "@wso2-enterprise/ui-toolkit";
import styled from "@emotion/styled";
import { BIHeader } from "../BIHeader";
import ButtonCard from "../../../components/ButtonCard";
import { BodyText } from "../../styles";
import { useVisualizerContext } from "../../../Context";

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
    padding: 20,
});

const PanelViewMore = styled.div({
    display: "flex",
    flexDirection: "column",
    gap: 10,
});

const CardGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
    width: 100%;
`;

const Title = styled(Typography)`
    margin: 8px 0;
`;

// Add this styled component for the close button

export function AddComponentView() {
    const { rpcClient } = useRpcContext();
    const [activeWorkspaces, setActiveWorkspaces] = React.useState<any>(undefined);

    const { setPopupMessage } = useVisualizerContext();

    const handleClick = async (key: DIRECTORY_MAP) => {
        if (key === DIRECTORY_MAP.SERVICES) {
            await rpcClient.getVisualizerRpcClient().openView({
                type: EVENT_TYPE.OPEN_VIEW,
                location: {
                    view: MACHINE_VIEW.BIServiceForm,
                },
            });
        } else if (key === DIRECTORY_MAP.CONNECTIONS) {
            await rpcClient.getVisualizerRpcClient().openView({
                type: EVENT_TYPE.OPEN_VIEW,
                location: {
                    view: MACHINE_VIEW.AddConnectionWizard,
                },
                isPopup: true,
            });
        } else if (key === DIRECTORY_MAP.AUTOMATION) {
            await rpcClient.getVisualizerRpcClient().openView({
                type: EVENT_TYPE.OPEN_VIEW,
                location: {
                    view: MACHINE_VIEW.BIMainFunctionForm,
                }
            });
        } else if (key === DIRECTORY_MAP.FUNCTIONS) {
            await rpcClient.getVisualizerRpcClient().openView({
                type: EVENT_TYPE.OPEN_VIEW,
                location: {
                    view: MACHINE_VIEW.BIFunctionForm,
                }
            });
        } else if (key === DIRECTORY_MAP.TRIGGERS) {
            await rpcClient.getVisualizerRpcClient().openView({
                type: EVENT_TYPE.OPEN_VIEW,
                location: {
                    view: MACHINE_VIEW.AddTriggerWizard,
                },
                isPopup: true
            });
        } else {
            setPopupMessage(true);
        }
    };

    useEffect(() => {
        rpcClient
            .getBIDiagramRpcClient()
            .getWorkspaces()
            .then((response: any) => {
                setActiveWorkspaces(response.workspaces[0]);
                console.log(response.workspaces[0]);
            });
    }, []);

    return (
        <View>
            <ViewContent padding>
                <BIHeader />
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
                                title="Automation"
                                description="Trigger your integration with a task. Perfect for scheduled or one-time jobs."
                                onClick={() => handleClick(DIRECTORY_MAP.AUTOMATION)}
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
                                    title="Types"
                                    description="Define and manage data types with JSON schema."
                                    onClick={() => handleClick(DIRECTORY_MAP.TYPES)}
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
                                    onClick={() => handleClick(DIRECTORY_MAP.FUNCTIONS)}
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
                        {/* <br /> */}
                        {/* <Title variant="h2">Generate Entry Point with Copilot</Title>
                        <BodyText>
                            Describe your project entry point in detail and click 'Generate' to create it using AI.{" "}
                        </BodyText>
                        <TextArea
                            placeholder="E.g. Create a webhook to trigger an email notification. Accept JSON payloads with event details and send an email based on the event type. Include error handling for invalid data."
                            rows={6}
                            style={{ width: "100%" }}
                        />
                        <Button onClick={() => {}} appearance="primary" sx={{ marginTop: "4px" }}>
                            Generate
                        </Button> */}
                    </AddPanel>
                </Container>
            </ViewContent>
        </View>
    );
}
