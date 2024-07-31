/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useRef, useState } from 'react';
import { DIRECTORY_MAP } from '@wso2-enterprise/ballerina-core';
import { Button, Codicon, ComponentCard, Icon, TextField, Typography, View, ViewContent } from '@wso2-enterprise/ui-toolkit';
import styled from '@emotion/styled';
import { useVisualizerContext } from '@wso2-enterprise/ballerina-rpc-client';
import { SERVICE_VIEW } from "./constants";
import { EggplantHeader } from '../EggplantHeader';

const FORM_WIDTH = 600;

const FormContainer = styled.div`
    display: flex;
    flex-direction: column;
    margin: auto; /* Center vertically and horizontally */
    max-width: 600px;
`;

const Container = styled.div({
    display: "flex",
    flexDirection: "column",
    gap: 10,
});

const BottomMarginTextWrapper = styled.div`
    font-size: 13px;
    margin-bottom: 10px;
`;

const HorizontalCardContainer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    margin-top: 10px;
    margin-bottom: 10px;
`;

const IconWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
`;

const ButtonWrapper = styled.div`
    margin-top: 20px;
    width: 130px;
`;

export interface HttpFormProps {
    handleView: (view: SERVICE_VIEW) => void;
}

export function HttpForm(props: HttpFormProps) {
    const { rpcClient } = useVisualizerContext();
    const [name, setName] = useState("");
    const [path, setPath] = useState("");
    const [port, setPort] = useState("");
    const [selectedModule, setSelectedModule] = useState("Scratch");
    const [isLoading, setIsLoading] = useState(false);

    const handleCreateService = () => {
        setIsLoading(true);
        rpcClient.getEggplantDiagramRpcClient().createComponent({ type: DIRECTORY_MAP.SERVICES, name, path, port });
    }

    const handleSelection = (type: string) => {
        setSelectedModule(type);
    }

    return (
        <View>
            <ViewContent padding>
                <EggplantHeader />
                <Container>
                    <FormContainer>
                        <Typography variant="h1">New HTTP Service</Typography>
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
                        <HorizontalCardContainer>
                            <ComponentCard isSelected={selectedModule === "Scratch"} onClick={() => handleSelection("Scratch")} sx={{ borderRadius: "unset", height: 40, width: (FORM_WIDTH / 2 - 25), marginTop: 15, margin: 10 }}>
                                <IconWrapper>
                                    <div>Design From Scratch</div>
                                </IconWrapper>
                            </ComponentCard>
                            <ComponentCard isSelected={selectedModule === "OAS"} onClick={() => handleSelection("OAS")} sx={{ borderRadius: "unset", height: 40, width: (FORM_WIDTH / 2 - 25), marginTop: 15, margin: 10 }}>
                                <IconWrapper>
                                    <div>Import From OAS</div>
                                </IconWrapper>
                            </ComponentCard>
                        </HorizontalCardContainer>
                        {selectedModule === "OAS" &&
                            <div>
                                <label>Select a OAS File:</label>
                                <input type="file" id="myfile" name="myfile" />
                            </div>
                        }
                        <ButtonWrapper>
                            <Button disabled={!name || !path || !port} onClick={handleCreateService} appearance="primary">Create Service</Button>
                        </ButtonWrapper>
                    </FormContainer>
                </Container>
            </ViewContent>
        </View>
    );
};
