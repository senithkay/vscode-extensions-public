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
import { AutoComplete, Button, TextField, Dropdown, Typography, Codicon } from "@wso2-enterprise/ui-toolkit";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import { FieldGroup, SectionWrapper } from "./Commons";
import { VSCodeRadio, VSCodeRadioGroup } from "@vscode/webview-ui-toolkit/react";
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

const CardContainer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    flex-wrap: wrap;
    gap: 20px;
`;

const SubContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-content: space-between;
    gap: 20px;
`;

const TitleWrapper = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 10px;
`;

const HiddenFormWrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 10px 40px;
`;

export interface RegistryWizardProps {
    path: string;
}

export function RegistryResourceForm(props: RegistryWizardProps) {

    const { rpcClient } = useVisualizerContext();
    const templates = ['Address endpoint', 'Default Endpoint', 'Failover Endpoint', 'HTTP Endpoint', 'Load Balance Endpoint',
        'Recipient List Endpoint', 'Template Endpoint', 'WSDL Endpoint', 'Default Endpoint Template', 'HTTP Endpoint Template',
        'WSDL Endpoint Template', 'Address endpoint template', 'Data Mapper', 'Javascript File', 'JSON File', 'Local Entry',
        'Sequence', 'Sequence Template', 'SQL Script File', 'WSDL File', 'WS-Policy', 'XSD File', 'XSL File', 'XSLT File', 'YAML File'];

    const [createOption, setCreateOption] = useState("new");
    const [resourceName, setResourceName] = useState("");
    const [artifactName, setArtifactName] = useState("");
    const [filePath, setFilePath] = useState("");
    const [seletedTemplate, setSelectedTemplate] = useState("Address Endpoint");
    const [registry, setRegistry] = useState("gov");
    const [registryPath, setRegistryPath] = useState("");
    const onOptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCreateOption(e.target.value);
    }
    const onRegistryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRegistry(e.target.value);
    }
    const handleCancel = () => {
        rpcClient.getMiVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { view: MACHINE_VIEW.Overview } });
    };

    const openFile = async () => {
        const request = {
            dialogTitle: "Select a file to be imported as registry resource"
        }
        await rpcClient.getMiDiagramRpcClient().browseFile(request).then(response => {
            setFilePath(response.filePath);
        }).catch(e => { console.log(e); });
    }

    const handleSave = async () => {
        const projectDir = (await rpcClient.getMiDiagramRpcClient().getProjectRoot({ path: props.path })).path;
        const request = {
            projectDirectory: projectDir,
            templateType: seletedTemplate,
            filePath: filePath,
            resourceName: resourceName,
            artifactName: artifactName,
            registryPath: registryPath,
            registryRoot: registry,
            createOption: createOption
        }
        const regfilePath = await rpcClient.getMiDiagramRpcClient().createRegistryResource(request);
        rpcClient.getMiDiagramRpcClient().openFile(regfilePath);
        rpcClient.getMiDiagramRpcClient().closeWebView();
    }

    const isValid = createOption === "new" ? (artifactName && registryPath && resourceName) : (filePath && artifactName && registryPath);
    return (

        <WizardContainer>
            <SectionWrapper>
                <h3>Create New Registry Resource</h3>
                <VSCodeRadioGroup>
                    <VSCodeRadio value="new" checked={createOption === "new"} onChange={onOptionChange}>From existing template</VSCodeRadio>
                    <VSCodeRadio value="import" checked={createOption === "import"} onChange={onOptionChange}>Import from file system</VSCodeRadio>
                </VSCodeRadioGroup>
                {createOption === "new" && <>
                    <FieldGroup>
                        <span>Template</span>
                        <AutoComplete
                            items={templates}
                            selectedItem={seletedTemplate}
                            onChange={setSelectedTemplate}
                            sx={{ width: '370px' }}
                        ></AutoComplete>
                    </FieldGroup>
                    <TextField
                        value={resourceName}
                        id='name-input'
                        label="Resource Name"
                        placeholder="Resource Name"
                        onChange={(text: string) => setResourceName(text)}
                        size={40}
                        autoFocus
                        required
                    />
                </>}
                {createOption === "import" && <>
                    <FieldGroup>
                        <span>File Path</span>
                        <TextField
                            value={filePath}
                            id='file-path-input'
                            placeholder="File Path"
                            onChange={(text: string) => setFilePath(text)}
                            size={40}
                            autoFocus
                            required
                        />
                        <Button onClick={openFile}>Browse file</Button>
                    </FieldGroup>
                </>}
                <TextField
                    value={artifactName}
                    id='artifact-input'
                    label="Artifact Name"
                    placeholder="Artifact Name"
                    onChange={(text: string) => setArtifactName(text)}
                    size={40}
                    autoFocus
                    required
                />
                <span>Select registry category</span>
                <VSCodeRadioGroup>
                    <VSCodeRadio value="gov" checked={registry === "gov"} onChange={onRegistryChange}>gov</VSCodeRadio>
                    <VSCodeRadio value="conf" checked={registry === "conf"} onChange={onRegistryChange}>conf</VSCodeRadio>
                </VSCodeRadioGroup>
                <TextField
                    value={registryPath}
                    id='regPath-input'
                    label="Registry Path"
                    placeholder="endpoints"
                    onChange={(text: string) => setRegistryPath(text)}
                    size={40}
                    autoFocus
                    required
                />
                <br />
                <ActionContainer>
                    <Button appearance="secondary" onClick={handleCancel}>
                        Cancel
                    </Button>
                    <Button disabled={!isValid} onClick={handleSave}>
                        Save
                    </Button>
                </ActionContainer>
            </SectionWrapper>
        </WizardContainer>
    );
}