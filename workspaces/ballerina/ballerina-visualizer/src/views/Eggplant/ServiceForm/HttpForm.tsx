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
import { Button, LocationSelector, TextField, Typography, View, ViewContent, ErrorBanner } from "@wso2-enterprise/ui-toolkit";
import styled from "@emotion/styled";
import { css } from "@emotion/css";
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

const ErrorMsg = css`
    margin-top: 10px;
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
    const [specPath, setSpecPath] = useState("");
    const [port, setPort] = useState("");
    const [file, setFile] = useState("");
    const [selectedModule, setSelectedModule] = useState<ServiceType>("Scratch");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const { setPopupMessage } = useVisualizerContext();

    const handleCreateService = async () => {
        setIsLoading(true);
        const res = await rpcClient.getEggplantDiagramRpcClient().createComponent({ type: DIRECTORY_MAP.SERVICES, name, path, port, specPath });
        setIsLoading(res.response);
        setError(res.error);
    };

    const handleSelection = (type: ServiceType) => {
        setSelectedModule(type);
    };

    const handleFileSelect = async () => {
        const projectDirectory = await rpcClient.getCommonRpcClient().selectFileOrDirPath({ isFile: true });
        setSpecPath(projectDirectory.path);
    };

    const validate = () => {
        if (selectedModule === "Scratch") {
            return !name || !path || !port || isLoading;
        }
        if (selectedModule === "OAS") {
            return !specPath || isLoading;
        }
    }

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
                                onClick={() => handleSelection("OAS")}
                            />
                        </CardGrid>
                        {selectedModule === "Scratch" &&
                            <>
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
                            </>
                        }
                        {selectedModule === "OAS" &&
                            <>
                                <LocationSelector
                                    sx={{ marginTop: 20 }}
                                    label="Select Open API Spec File"
                                    btnText="Select File"
                                    selectedFile={specPath}
                                    onSelect={handleFileSelect}
                                />
                            </>
                        }
                        <TextField
                            onTextChange={setPort}
                            sx={{ marginTop: 20 }}
                            value={port}
                            label="Port"
                            placeholder="Enter service port"
                        />
                        <ButtonWrapper>
                            <Button
                                disabled={validate()}
                                onClick={handleCreateService}
                                appearance="primary"
                            >
                                Create Service
                            </Button>
                        </ButtonWrapper>
                        {error && <ErrorBanner className={ErrorMsg} errorMsg={error} />}
                    </FormContainer>
                </Container>
            </ViewContent>
        </View>
    );
}
