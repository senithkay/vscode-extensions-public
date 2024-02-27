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
import { AutoComplete, Button, TextField } from "@wso2-enterprise/ui-toolkit";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import { SectionWrapper } from "./Commons";

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

export interface Region {
    label: string;
    value: string;
}

export function APIWizard() {

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
        const projectDir = (await rpcClient.getMiDiagramRpcClient().getProjectRoot()).path;
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
        rpcClient.getMiVisualizerRpcClient().openView({ view: "Diagram", documentUri: file.path, identifier: `/resource` });
    };

    const handleCancel = () => {
        console.log("cancel");
        rpcClient.getMiVisualizerRpcClient().openView({ view: "Overview" });
    };

    const isValid: boolean = apiName.length > 0 && apiContext.length > 0 && versionType.length > 0;

    return (
        <WizardContainer>
            <SectionWrapper>
                <h3>Synapse API Artifact</h3>
                <TextField
                    value={apiName}
                    id='name-input'
                    label="Name"
                    placeholder="Name"
                    validationMessage="Project name is required"
                    onChange={(text: string) => setAPIName(text)}
                    size={35}
                    autoFocus
                    required
                />
                <TextField
                    placeholder="Context"
                    label="Context"
                    onChange={(text: string) => setAPIContext(text)}
                    validationMessage="API context is required"
                    value={apiContext}
                    id='context-input'
                    required
                    size={35}
                />
                <span>Version Type</span>
                <AutoComplete sx={{width: '370px'}} items={versionLabels} selectedItem={versionType} onChange={handleVersionTypeChange}></AutoComplete>
                {versionType !== "none" && (
                    <TextField
                        placeholder="Version"
                        label="Version"
                        onChange={(text: string) => setVersion(text)}
                        value={version}
                        id='version-input'
                        size={35}
                    />)}
                <TextField
                    placeholder="Path to swagger definition"
                    label="Path to swagger definition"
                    onChange={(text: string) => setSwaggerdefPath(text)}
                    validationMessage="API context is required"
                    value={swaggerdefPath}
                    id='context-input'
                    size={35}
                />
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
