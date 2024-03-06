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
import { Range } from "@wso2-enterprise/mi-syntax-tree/lib/src";
import { getXML } from "../../utils/template-engine/mustache-templates/templateUtils";
import { SERVICE_DESIGNER } from "../../constants";

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

export interface APIData {
    apiName: string;
    apiContext: string;
    version?: string;
    swaggerdefPath?: string;
    documentUri: string;
    range: Range;
}

export interface APIWizardProps {
    path: string;
    apiData?: APIData;
}

type VersionType = "none" | "context" | "url";

export function APIWizard(props: APIWizardProps{ apiData }: APIWizardProps) {
    const { rpcClient } = useVisualizerContext();
    const [apiName, setAPIName] = useState("");
    const [apiContext, setAPIContext] = useState("/");
    const [versionType, setVersionType] = useState("none");
    const [version, setVersion] = useState("");
    const [swaggerdefPath, setSwaggerdefPath] = useState("");

    const identifyVersionType = (version: string): VersionType => {
        if (!version) {
            return "none";
        } else if (version.startsWith("http")) {
            return "url";
        } else {
            return "context";
        }
    }

    useEffect(() => {
        if (apiData) {
            const versionType = identifyVersionType(apiData.version);

            setAPIName(apiData.apiName);
            setAPIContext(apiData.apiContext);
            setVersionType(versionType);
            setVersion(apiData.version || "");
            setSwaggerdefPath(apiData.swaggerdefPath || "");
        }
    }, [apiData]);

    const versionLabels = ['none', 'context', 'url'];

    const handleVersionTypeChange = (type: string) => {
        setVersionType(type);
    };

    const handleCreateAPI = async () => {
        if (!apiData) {
            // Create API
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
        } else {
            // Update API
            const formValues = {
                name: apiName,
                context: apiContext,
                version_type: versionType,
                version: version
            }
            const xml = getXML(SERVICE_DESIGNER.EDIT_SERVICE, formValues);
            rpcClient.getMiDiagramRpcClient().applyEdit({
                text: xml,
                documentUri: apiData.documentUri,
                range: apiData.range
            });
            rpcClient.getMiVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { view: MACHINE_VIEW.ServiceDesigner, documentUri: apiData.documentUri } });
        }
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

    const validateAPIContext = (name: string) => { 
        // Check if the name is empty
        if (!name.trim()) {
            return "Context is required";
        }

        // Check if the name has spaces
        if (/\s/.test(name)) {
            return "Context cannot contain spaces";
        }

        // Check if the name starts with /
        if (!name.startsWith("/")) {
            return "Context should start with /";
        }

        return "";
    }

    const handleBackButtonClick = () => {
        rpcClient.getMiVisualizerRpcClient().goBack();
    }

    const isValid: boolean = apiName.length > 0 && apiContext.length > 0 && versionType.length > 0;
    const contentUpdated: boolean = apiData ?
        (apiData.apiName !== apiName)
        || (apiData.apiContext !== apiContext)
        || (apiData?.version ? apiData?.version !== version : false)
        || (apiData?.swaggerdefPath ? apiData?.swaggerdefPath !== swaggerdefPath : false) 
        : true;

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
                    errorMsg={validateAPIContext(apiContext)}
                    size={46}
                />
                <FieldGroup>
                    <AutoComplete sx={{ width: '370px' }} label="Version Type" items={versionLabels} selectedItem={versionType} onChange={handleVersionTypeChange} />
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
                        disabled={!isValid || !contentUpdated}
                    >
                        {apiData ? "Update" : "Create"}
                    </Button>
                </ActionContainer>
            </SectionWrapper>
        </WizardContainer>
    );
}
