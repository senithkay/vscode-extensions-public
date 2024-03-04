/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import styled from "@emotion/styled";
import React, { useEffect, useState } from "react";
import { AutoComplete, Button, Codicon, Icon, TextField, Typography } from "@wso2-enterprise/ui-toolkit";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import { FieldGroup, SectionWrapper } from "./Commons";
import { EVENT_TYPE, MACHINE_VIEW } from "@wso2-enterprise/mi-core";

const WizardContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 95vw;
    height: calc(100vh - 140px);
    overflow: auto;
`;

const ActionContainer = styled.div`
    display  : flex;
    flex-direction: row;
    justify-content: flex-end;
    gap: 10px;
    padding-bottom: 20px;
`;

const LocationText = styled.div`
    max-width: 60vw;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const Container = styled.div`
    display: flex;
    flex-direction: row;
    height: 50px;
    align-items: center;
    justify-content: flex-start;
`;

export interface Region {
    label: string;
    value: string;
}

export interface APIWizardProps {
    path: string;
}

export function APIWizard(props: APIWizardProps) {

    const { rpcClient } = useVisualizerContext();
    const [apiName, setAPIName] = useState("");
    const [apiContext, setAPIContext] = useState("");
    const [versionType, setVersionType] = useState("none");
    const [version, setVersion] = useState("");
    const [swaggerdefPath, setSwaggerdefPath] = useState("");;

    const versionLabels = ['none', 'context', 'url'];

    const handleVersionTypeChange = (type: string) => {
        setVersionType(type);
    };

    const handleCreateAPI = async () => {
        const projectDir = (await rpcClient.getMiDiagramRpcClient().getProjectRoot({path: props.path})).path;
        const APIDir = `${projectDir}/src/main/wso2mi/artifacts/apis`;
        const createAPIParams = {
            name: apiName,
            context: apiContext,
            directory: APIDir,
            swaggerDef: swaggerdefPath,
            type: versionType,
            version: version
        }
        const file = await rpcClient.getMiDiagramRpcClient().createAPI(createAPIParams);
        console.log("API created");
        rpcClient.getMiVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { view: MACHINE_VIEW.ServiceDesigner, documentUri: file.path } });
    };

    const handleCancel = () => {
        console.log("cancel");
        rpcClient.getMiVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { view: MACHINE_VIEW.Overview } });
    };

    const handleSwaggerPathSelection = async () => {
        const projectDirectory = await rpcClient.getMiDiagramRpcClient().askProjectDirPath();
        setSwaggerdefPath(projectDirectory.path);
    }

    const validateAPIName = (name: string) => {
        // Check if the name is empty
        if (!name.trim()) {
            return "Name is required";
        }

        // Check if the name has spaces
        if (/\s/.test(name)) {
            return "Name cannot contain spaces";
        }

        return "";
    };

    const handleBackButtonClick = () => {
        rpcClient.getMiVisualizerRpcClient().goBack();
    }

    const isValid: boolean = apiName.length > 0 && apiContext.length > 0 && versionType.length > 0;

    return (
        <WizardContainer>
            <SectionWrapper>
                <Container>
                    <Codicon iconSx={{ marginTop: -3, fontWeight: "bold", fontSize: 22 }} name='arrow-left' onClick={handleBackButtonClick} />
                    <div style={{ marginLeft: 30 }}>
                        <Typography variant="h3">Synapse API Artifact</Typography>
                    </div>
                </Container>
                <TextField
                    value={apiName}
                    id='name-input'
                    label="Name"
                    placeholder="Name"
                    onChange={(text: string) => setAPIName(text)}
                    errorMsg={validateAPIName(apiName)}
                    size={46}
                    autoFocus
                    required
                />
                <TextField
                    placeholder="Context"
                    label="Context"
                    onChange={(text: string) => setAPIContext(text)}
                    value={apiContext}
                    id='context-input'
                    required
                    errorMsg={validateAPIName(apiContext)}
                    size={46}
                />
                <FieldGroup>
                    <span>Version Type</span>
                    <AutoComplete sx={{ width: '370px' }} items={versionLabels} selectedItem={versionType} onChange={handleVersionTypeChange}></AutoComplete>
                    {versionType !== "none" && (
                        <TextField
                            placeholder={versionType === "context" ? "0.0.1" : "https://example.com"}
                            label="Version"
                            onChange={(text: string) => setVersion(text)}
                            value={version}
                            id='version-input'
                            size={35}
                        />)}
                </FieldGroup>
                <FieldGroup>
                    <span>  Swagger Def Path  </span>
                    {!!swaggerdefPath && <LocationText>{swaggerdefPath}</LocationText>}
                    {!swaggerdefPath && <span>Please choose a directory for swagger definition. </span>}
                    <Button appearance="secondary" onClick={handleSwaggerPathSelection} id="select-swagger-path-btn">
                        Select Location
                    </Button>
                </FieldGroup>
                <ActionContainer>
                    <Button
                        appearance="secondary"
                        onClick={handleCancel}
                    >
                        Cancel
                    </Button>
                    <Button
                        appearance="primary"
                        onClick={handleCreateAPI}
                        disabled={!isValid}
                    >
                        Create
                    </Button>
                </ActionContainer>
            </SectionWrapper>
        </WizardContainer>
    );
}
