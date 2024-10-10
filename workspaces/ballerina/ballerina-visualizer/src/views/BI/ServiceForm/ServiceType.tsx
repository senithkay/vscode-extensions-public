/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from "react";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import { Button, Codicon, TextArea, Card, Typography, LinkButton, Divider, View, ViewContent, ViewHeader } from "@wso2-enterprise/ui-toolkit";
import { Transition } from "@headlessui/react";
import { css } from "@emotion/css";
import styled from "@emotion/styled";
import { SERVICE_VIEW } from "./constants";
import { BIHeader } from "../BIHeader";
import ButtonCard from "../../../components/ButtonCard";
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
    marginBottom: 10,
});

// Add this styled component for the close button

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

export interface HttpFormProps {
    handleView: (view: SERVICE_VIEW) => void;
}

export function ServiceType(props: HttpFormProps) {
    const { rpcClient } = useRpcContext();

    const { setPopupMessage } = useVisualizerContext();

    const handleClick = async (view: SERVICE_VIEW) => {
        props.handleView(view);
    };

    return (
        <View>
            <ViewContent padding>
                <BIHeader />
                <Container>
                    <AddPanel>
                        <Title variant="h2">Select Service Type</Title>
                        <BodyText>
                            Choose the type of service you want to add to your integration. Select from the options
                            below.
                        </BodyText>
                        <CardGrid>
                            <ButtonCard
                                icon={<Codicon name="globe" />}
                                title="HTTP Service"
                                description="Create an HTTP service to handle web requests and responses."
                                onClick={() => handleClick(SERVICE_VIEW.HTTP_FORM)}
                            />
                            <ButtonCard
                                icon={<Codicon name="graph-scatter" />}
                                title="GraphQL Service"
                                description="Set up a GraphQL service for flexible and efficient data queries."
                                onClick={() => setPopupMessage(true)}
                            />
                            <ButtonCard
                                icon={<Codicon name="symbol-interface" />}
                                title="gRPC Service"
                                description="Implement a gRPC service for high-performance, cross-platform communication."
                                onClick={() => setPopupMessage(true)}
                            />
                        </CardGrid>
                    </AddPanel>
                </Container>
            </ViewContent>
        </View>
    );
}
