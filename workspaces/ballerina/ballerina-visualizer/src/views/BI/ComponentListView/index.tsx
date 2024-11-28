/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useState } from "react";
import { DIRECTORY_MAP, EVENT_TYPE, MACHINE_VIEW, TriggerModelsResponse, TriggerNode } from "@wso2-enterprise/ballerina-core";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import { Codicon, Divider, Icon, Typography, View, ViewContent, LinkButton } from "@wso2-enterprise/ui-toolkit";
import styled from "@emotion/styled";
import { BIHeader } from "../BIHeader";
import ButtonCard from "../../../components/ButtonCard";
import { BodyText } from "../../styles";
import { useVisualizerContext } from "../../../Context";
import { SERVICE_VIEW } from "../ServiceForm/constants";
import TriggerWizard from "../Trigger/AddTriggerWizard";
import ServiceConfigView from "../Trigger/ServiceConfigView";
import PullingModuleLoader from "../../Connectors/PackageLoader/Loader";
import { Colors } from "../../../resources/constants";

const LoadingContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 80vh;
    flex-direction: column;
`;

const Container = styled.div({
    display: "flex",
    flexDirection: "column",
    gap: 10,
});

const AddPanel = styled.div({
    position: "relative", // Add this line to position the close button absolutely
    display: "flex",
    flexDirection: "column",
    gap: 25,
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

const Card = styled.div`
    border: 2px solid ${(props: { active: boolean }) => (props.active ? Colors.PRIMARY : Colors.OUTLINE_VARIANT)};
    background-color: ${(props: { active: boolean }) => (props.active ? Colors.PRIMARY_CONTAINER : Colors.SURFACE_DIM)};
    cursor: pointer;
    &:hover {
        background-color: ${Colors.PRIMARY_CONTAINER};
        border: 2px solid ${Colors.PRIMARY};
    }
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 16px;
    max-width: 42rem;
    padding: 16px;
    border-radius: 4px;
    cursor: pointer;
`;

// Add this styled component for the close button

export function ComponentListView() {
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
                }
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
                }
            });
        } else if (key === DIRECTORY_MAP.TYPES) {
            await rpcClient.getVisualizerRpcClient().openView({
                type: EVENT_TYPE.OPEN_VIEW,
                location: {
                    view: MACHINE_VIEW.TypeDiagram,
                }
            });
        } else if (key === DIRECTORY_MAP.CONFIGURATIONS) {
            await rpcClient.getVisualizerRpcClient().openView({
                type: EVENT_TYPE.OPEN_VIEW,
                location: {
                    view: MACHINE_VIEW.ViewConfigVariables,
                }
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
        getTriggers();
    }, []);

    const [triggers, setTriggers] = useState<TriggerModelsResponse>({ local: [] });
    const { cacheTriggers, setCacheTriggers } = useVisualizerContext();

    const getTriggers = () => {
        if (cacheTriggers.local.length > 0) {
            setTriggers(cacheTriggers);
        } else {
            rpcClient
                .getTriggerWizardRpcClient()
                .getTriggerModels({ query: "" })
                .then((model) => {
                    console.log(">>> bi triggers", model);
                    setTriggers(model);
                    setCacheTriggers(model);
                });
        }
    };

    const handleOnSelect = async (trigger: TriggerNode) => {
        if (!trigger) {
            console.error(">>> Error selecting trigger. No codedata found");
            return;
        }
        const response = await rpcClient.getTriggerWizardRpcClient().getTriggerModel({ id: trigger.id.toString() });
        console.log(">>>Trigger by id", response);
        setTrigger(response.trigger);
    };

    const [trigger, setTrigger] = useState<TriggerNode>(undefined);
    const [isPullingConnector, setIsPullingConnector] = useState<boolean>(false);

    const handleServiceFormSubmit = async (trigger: TriggerNode) => {
        setIsPullingConnector(true);
        await rpcClient.getTriggerWizardRpcClient().getTriggerSourceCode({ filePath: "", trigger });
        setIsPullingConnector(false);
    };

    return (
        <View>
            <ViewContent padding>
                <BIHeader />
                {trigger && isPullingConnector && (
                    <LoadingContainer>
                        <PullingModuleLoader />
                        <Typography variant="h3" sx={{ marginTop: '16px' }}>Creating the trigger service</Typography>
                        <Typography variant="h4" sx={{ marginTop: '8px' }}>This might take some time</Typography>
                    </LoadingContainer>
                )}
                {trigger && !isPullingConnector && (
                    <>
                        <Typography variant="h2">{`Configure ${trigger?.displayName || ''} `}</Typography>
                        <BodyText>
                            Provide the necessary configuration details for the selected trigger to complete the setup.
                        </BodyText>
                        <ServiceConfigView
                            triggerNode={trigger}
                            onSubmit={handleServiceFormSubmit}
                            onBack={() => setTrigger(undefined)}
                        />
                    </>
                )}
                {!trigger &&
                    <Container>
                        <AddPanel>
                            <PanelViewMore>
                                <Title variant="h2">API</Title>
                                <BodyText>
                                    Explore and manage various components to enhance your integration capabilities.
                                </BodyText>
                                <CardGrid>
                                    <ButtonCard
                                        icon={<Icon name="bi-http-service" sx={{ width: "40px" }} iconSx={{ fontSize: "40px" }} />}
                                        title="HTTP Service"
                                        description="Handle web requests and responses."
                                        onClick={() => handleClick(DIRECTORY_MAP.SERVICES)}
                                    />
                                    <ButtonCard
                                        icon={<Codicon name="graph-scatter" sx={{ width: "40px" }} iconSx={{ fontSize: "40px" }} />}
                                        title="GraphQL Service"
                                        description="Flexible and efficient data queries."
                                        onClick={() => setPopupMessage(true)}
                                    />
                                    <ButtonCard
                                        icon={<Codicon name="symbol-interface" sx={{ width: "40px" }} iconSx={{ fontSize: "40px" }} />}
                                        title="gRPC Service"
                                        description="High-performance, cross-platform communication."
                                        onClick={() => setPopupMessage(true)}
                                    />
                                </CardGrid>
                            </PanelViewMore>
                            <PanelViewMore>
                                <Divider />
                                <Title variant="h2">Event Integration</Title>
                                <BodyText>
                                    Configure event-driven integrations for your project. Explore the available options below.
                                </BodyText>
                                <CardGrid>
                                    {triggers.local.map((item, index) => {
                                        return (
                                            <ButtonCard
                                                key={item.id}
                                                title={item.name}
                                                description={`${item.orgName}/${item.packageName}`}
                                                icon={
                                                    item.icon ? (
                                                        <img
                                                            src={item.icon}
                                                            alt={item.name}
                                                            style={{ width: "40px" }}
                                                        />
                                                    ) : (
                                                        <Codicon name="mail" />
                                                    )
                                                }
                                                onClick={() => {
                                                    handleOnSelect(item);
                                                }}
                                            />
                                        );
                                    })}
                                    <Card onClick={() => handleClick(DIRECTORY_MAP.TRIGGERS)}>
                                        <LinkButton onClick={() => handleClick(DIRECTORY_MAP.TRIGGERS)}> View More</LinkButton>
                                    </Card>
                                </CardGrid>
                            </PanelViewMore>
                            <PanelViewMore>
                                <Divider />
                                <Title variant="h2">File Integration</Title>
                                <BodyText>
                                    Select the file integration type that best suits your project's needs.
                                </BodyText>
                                <CardGrid>
                                    Coming soon...
                                </CardGrid>
                            </PanelViewMore>
                            <PanelViewMore>
                                <Divider />
                                <Title variant="h2">Automation</Title>
                                <BodyText>
                                    Explore automation options to streamline your integration processes.
                                </BodyText>
                                <CardGrid>
                                    <ButtonCard
                                        icon={<Icon name="bi-task" sx={{ width: "40px" }} iconSx={{ fontSize: "40px" }} />}
                                        title="Automation"
                                        description="Trigger your integration with a task. Perfect for scheduled or one-time jobs."
                                        onClick={() => handleClick(DIRECTORY_MAP.AUTOMATION)}
                                    />
                                </CardGrid>
                            </PanelViewMore>
                            <PanelViewMore>
                                <Divider />
                                <Title variant="h2">Other Artifacts</Title>
                                <BodyText>
                                    Manage additional components for your integration. Select from the options below.
                                </BodyText>
                                <CardGrid>
                                    <ButtonCard
                                        icon={<Icon name="bi-connection" sx={{ width: "40px" }} iconSx={{ fontSize: "40px" }} />}
                                        title="Connections"
                                        description="Set up external service connections, like databases and APIs."
                                        onClick={() => handleClick(DIRECTORY_MAP.CONNECTIONS)}
                                    />
                                    <ButtonCard
                                        icon={<Icon name="bi-type" sx={{ width: "40px" }} iconSx={{ fontSize: "40px" }} />}
                                        title="Types"
                                        description="Define and manage data types with JSON schema."
                                        onClick={() => handleClick(DIRECTORY_MAP.TYPES)}
                                    />
                                    <ButtonCard
                                        icon={<Icon name="bi-config" sx={{ width: "40px" }} iconSx={{ fontSize: "40px" }} />}
                                        title="Configurations"
                                        description="Handle environment variables and secrets for your project."
                                        onClick={() => handleClick(DIRECTORY_MAP.CONFIGURATIONS)}
                                    />
                                    <ButtonCard
                                        icon={<Icon name="bi-function" sx={{ width: "40px" }} iconSx={{ fontSize: "40px" }} />}
                                        title="Functions"
                                        description="Create reusable functions to streamline your integration logic."
                                        onClick={() => handleClick(DIRECTORY_MAP.FUNCTIONS)}
                                    />
                                </CardGrid>
                            </PanelViewMore>
                        </AddPanel>
                    </Container>
                }
            </ViewContent>
        </View>
    );
}
