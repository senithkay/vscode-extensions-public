/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useState } from "react";
import { DIRECTORY_MAP } from "@wso2-enterprise/ballerina-core";
import { Button, TextField, Typography, View, ViewContent } from "@wso2-enterprise/ui-toolkit";
import styled from "@emotion/styled";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import { SERVICE_VIEW } from "./constants";
import { EggplantHeader } from "../EggplantHeader";
import ButtonCard from "../../../components/ButtonCard";
import { BodyText } from "../../styles";
import { useVisualizerContext } from "../../../Context";

const FormContainer = styled.div`
    display: flex;
    flex-direction: column;
    max-width: 600px;
`;

const Container = styled.div`
    display: "flex";
    flex-direction: "column";
    gap: 10;
    margin: 20px;
`;

const ButtonWrapper = styled.div`
    margin-top: 20px;
    width: 130px;
`;

const CardGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    margin-top: 20px;
    width: 100%;
`;

type ServiceType = "Scratch" | "OAS";

export interface HttpFormProps {
    handleView: (view: SERVICE_VIEW) => void;
}

export function HttpForm(props: HttpFormProps) {
    const { handleView } = props;
    const { rpcClient } = useRpcContext();
    const [name, setName] = useState("");
    const [path, setPath] = useState("");
    const [port, setPort] = useState("");
    const [file, setFile] = useState("");
    const [selectedModule, setSelectedModule] = useState<ServiceType>("Scratch");
    const [isLoading, setIsLoading] = useState(false);

    const { setPopupMessage } = useVisualizerContext();
    
    const handleCreateService = () => {
        setIsLoading(true);
        rpcClient.getEggplantDiagramRpcClient().createComponent({ type: DIRECTORY_MAP.SERVICES, name, path, port });
    };

    const handleSelection = (type: ServiceType) => {
        setSelectedModule(type);
    };

    return (
        <View>
            <ViewContent padding>
                <EggplantHeader />
                <Container>
                    <FormContainer>
                        <Typography variant="h2">Create HTTP Service</Typography>
                        <BodyText>
                            Design your HTTP service using the our Service Designer or import an OpenAPI
                            Specification (OAS) file to set it up quickly.
                        </BodyText>
                        <TextField
                            onTextChange={setName}
                            sx={{ marginTop: 20 }}
                            value={name}
                            label="Service Name"
                            placeholder="Enter service name"
                        />
                        <TextField
                            onTextChange={setPath}
                            sx={{ marginTop: 20 }}
                            value={path}
                            label="Path"
                            placeholder="Enter service path"
                        />
                        <TextField
                            onTextChange={setPort}
                            sx={{ marginTop: 20 }}
                            value={port}
                            label="Port"
                            placeholder="Enter service port"
                        />
                        <CardGrid>
                            <ButtonCard
                                title="Design From Scratch"
                                description="Design your HTTP service using our service design tool."
                                active={selectedModule === "Scratch"}
                                onClick={() => handleSelection("Scratch")}
                            />
                            <ButtonCard
                                title="Import From OAS"
                                description="Import an existing OpenAPI Specification file to set up your service."
                                active={selectedModule === "OAS"}
                                onClick={() => setPopupMessage(true)}
                            />
                        </CardGrid>

                        {selectedModule === "OAS" && (
                            <TextField
                                type="file"
                                onTextChange={setFile}
                                sx={{ marginTop: 20 }}
                                value={file}
                                label="Select a OAS File"
                            />
                        )}

                        <ButtonWrapper>
                            <Button
                                disabled={!name || !path || !port}
                                onClick={handleCreateService}
                                appearance="primary"
                            >
                                Create Service
                            </Button>
                        </ButtonWrapper>
                    </FormContainer>
                </Container>
            </ViewContent>
        </View>
    );
}
