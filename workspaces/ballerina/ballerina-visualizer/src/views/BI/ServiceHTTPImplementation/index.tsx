/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useState } from "react";
import { DIRECTORY_MAP, EVENT_TYPE, MACHINE_VIEW } from "@wso2-enterprise/ballerina-core";
import {
    Button,
    LocationSelector,
    TextField,
    Typography,
    View,
    ViewContent,
    ErrorBanner,
} from "@wso2-enterprise/ui-toolkit";
import styled from "@emotion/styled";
import { css } from "@emotion/css";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import { BIHeader } from "../BIHeader";
import ButtonCard from "../../../components/ButtonCard";
import { BodyText } from "../../styles";

const Container = styled.div`
    display: "flex";
    flex-direction: "column";
    gap: 10;
    margin: 20px;
`;

const CardGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
    width: 100%;
`;

const PanelViewMore = styled.div({
    display: "flex",
    flexDirection: "column",
    gap: 10,
});


type ServiceType = "Scratch" | "OAS";

export interface HttpFormProps {
}

export function ServiceHTTPImplementation(props: HttpFormProps) {
    const { rpcClient } = useRpcContext();

    const handleSelection = async (type: ServiceType) => {
        await rpcClient.getVisualizerRpcClient().openView({
            type: EVENT_TYPE.OPEN_VIEW,
            location: {
                view: type === "Scratch" ? MACHINE_VIEW.BIServiceWizard : MACHINE_VIEW.BIServiceOASForm,
                serviceType: "http"
            },
        });
    };
    return (
        <View>
            <ViewContent padding>
                <BIHeader />
                <Container>
                    <PanelViewMore>
                        <Typography variant="h2">Create an HTTP Service</Typography>
                        <BodyText>
                            Choose an option to implement your HTTP service
                        </BodyText>
                        <CardGrid>
                            <ButtonCard
                                title="Design From Scratch"
                                description="Design your HTTP service using our service designer."
                                onClick={() => handleSelection("Scratch")}
                            />
                            <ButtonCard
                                title="Import From OAS"
                                description="Import an existing OpenAPI Specification file to set up your service."
                                onClick={() => handleSelection("OAS")}
                            />
                        </CardGrid>
                    </PanelViewMore>
                </Container>
            </ViewContent>
        </View>
    );
}
