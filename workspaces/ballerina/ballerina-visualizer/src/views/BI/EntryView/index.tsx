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
import { Button, Codicon, TextArea, Card, Typography, LinkButton, Divider, View, ViewContent } from "@wso2-enterprise/ui-toolkit";
import { Transition } from "@headlessui/react";
import { css } from "@emotion/css";
import styled from "@emotion/styled";
import { BIHeader } from "../BIHeader";

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
    backgroundColor: "var(--vscode-sideBar-background);",
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

export function AddEntryView() {
    const { rpcClient } = useRpcContext();
    const [activeWorkspaces, setActiveWorkspaces] = React.useState<any>(undefined);
    const [inputAiPrompt, setInputAiPrompt] = React.useState<string>("");
    const [viewMore, setViewMore] = React.useState<boolean>(false);

    const handleClick = async (key: DIRECTORY_MAP) => {
        if (key === DIRECTORY_MAP.SERVICES) {
            await rpcClient.getVisualizerRpcClient().openView({
                type: EVENT_TYPE.OPEN_VIEW,
                location: {
                    view: MACHINE_VIEW.BIServiceForm
                }
            });
        } else {
            await rpcClient.getVisualizerRpcClient().openView({
                type: EVENT_TYPE.OPEN_VIEW,
                location: {
                    view: MACHINE_VIEW.BIServiceForm
                }
            });
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
                <BIHeader />
                <Container>
                    <AddPanel>
                        <Typography variant="h2">
                            Entry Points
                        </Typography>
                        <HorizontalCardContainer>
                            <Card
                                icon="Service"
                                title="Service"
                                description="Create an HTTP service."
                                onClick={() => handleClick(DIRECTORY_MAP.SERVICES)}
                            />
                            <Card
                                icon="Task"
                                title="Task"
                                description="Create a task that can be run periodically."
                                onClick={() => handleClick(DIRECTORY_MAP.TASKS)}
                            />
                            <Card
                                icon="Triggers"
                                title="Triggers"
                                description="Create a trigger that can will listen to an event."
                                onClick={() => handleClick(DIRECTORY_MAP.TRIGGERS)}
                            />
                        </HorizontalCardContainer>
                    </AddPanel>
                </Container>
            </ViewContent>
        </View >
    );
}
