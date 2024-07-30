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
import { Button, Codicon, TextArea, Card, Typography, LinkButton, Divider } from "@wso2-enterprise/ui-toolkit";
import { Transition } from "@headlessui/react";
import { css } from "@emotion/css";
import styled from "@emotion/styled";
import { View, ViewContent, ViewHeader } from "../../../components/View";
import { SERVICE_VIEW } from "./constants";
import { EggplantHeader } from "../EggplantHeader";

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
    marginBottom: 10
});

const PanelViewMore = styled.div({
    display: "flex",
    flexDirection: "column",
    gap: 10,
});

const HorizontalCardContainer = styled.div({
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gridAutoRows: "minmax(80px, auto)",
    gap: "20px",
    margin: "0px 155px 0px 155px"
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

export interface HttpFormProps {
    handleView: (view: SERVICE_VIEW) => void;
}

export function ServiceType(props: HttpFormProps) {
    const { rpcClient } = useVisualizerContext();

    const handleClick = async (view: SERVICE_VIEW) => {
        props.handleView(view);
    };

    return (
        <View>
            <ViewContent padding>
                <EggplantHeader />
                <Container>
                    <AddPanel>
                        <Typography variant="h2">
                            Select Service Type
                        </Typography>
                        <HorizontalCardContainer>
                            <Card
                                icon="APIResource"
                                title="HTTP Service"
                                description="Implement a HTTP service"
                                onClick={() => handleClick(SERVICE_VIEW.HTTP_FORM)}
                            />
                            <Card
                                icon="GraphQL"
                                title="GraphQL Service"
                                description="Implement a GraphQL service."
                                onClick={() => handleClick(SERVICE_VIEW.HTTP_FORM)}
                            />
                            <Card
                                icon="task"
                                title="gRPC Service"
                                description="Implement a gRPC service."
                                onClick={() => handleClick(SERVICE_VIEW.HTTP_FORM)}
                            />
                        </HorizontalCardContainer>
                    </AddPanel>
                </Container>
            </ViewContent>
        </View >
    );
}
