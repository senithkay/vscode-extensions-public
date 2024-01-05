/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import styled from "@emotion/styled";
import React, { useEffect, useState } from "react";
import { AutoComplete, TextField } from "@wso2-enterprise/ui-toolkit";
import { MIWebViewAPI } from "./utils/WebViewRpc";

const WizardContainer = styled.div`
    width: 95%;
    display  : flex;
    flex-direction: column;
    gap: 20px;
    padding: 20px;
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


export const SectionWrapper: React.FC<React.HTMLAttributes<HTMLDivElement>> = styled.div`
    // Flex Props
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    position: relative;
    gap: 10px;
    // End Flex Props
    // Sizing Props
    padding: 20px;
    // End Sizing Props
    // Border Props
    border-radius: 10px;
    border-style: solid;
    border-width: 1px;
    border-color: transparent;
    background-color: var(--vscode-welcomePage-tileBackground);
    &.active {
        border-color: var(--vscode-focusBorder);
    }
`;

export interface Region {
    label: string;
    value: string;
}

export function APIWizard() {


    const [apiName, setAPIName] = useState("");
    const [apiContext, setAPIContext] = useState("");
    const [versionType, setVersionType] = useState("none");
    const [version, setVersion] = useState("");
    const [swaggerdefPath, setSwaggerdefPath] = useState("");
    const [projectDir, setProjectDir] = useState("");

    useEffect(() => {
        (async () => {
            const synapseAPIPath = await MIWebViewAPI.getInstance().getAPIDirectory();
            setProjectDir(synapseAPIPath);
        })();

    }, []);

    const versionLabels = ['none', 'context', 'url'];

    const handleVersionTypeChange = (type: string) => {
        setVersionType(type);
    };

    const handleCreateProject = async () => {
        const createAPIParams = {
            name: apiName,
            context: apiContext,
            directory: projectDir,
            swaggerDef: swaggerdefPath,
            type: versionType,
            version: version
        }
        const file = await MIWebViewAPI.getInstance().createAPI(createAPIParams);
        console.log("API created");
        MIWebViewAPI.getInstance().openDiagram(file);
        MIWebViewAPI.getInstance().closeWebView();
    };

    const handleCancel = () => {
        console.log("cancel");
        MIWebViewAPI.getInstance().closeWebView();
    };

    // const isValid: boolean = apiName.length > 0 && !!apiContext && !!selectedVersionType;

    return (
        <>
            <WizardContainer>
                <TitleWrapper>
                    <h2>New Synapse API</h2>
                </TitleWrapper>
                <SectionWrapper>
                    <h3>Synapse API Artifact</h3>
                    <TextField
                        value={apiName}
                        id='name-input'
                        label="Name"
                        placeholder="Name"
                        validationMessage="Project name is required"
                        onChange={(text: string) => setAPIName(text)}
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
                    />
                    <span>Version Type</span>
                    <AutoComplete items={versionLabels} selectedItem={versionType} onChange={handleVersionTypeChange}></AutoComplete>
                    {versionType !== "none" && (
                        <TextField
                            placeholder="Version"
                            label="Version"
                            onChange={(text: string) => setVersion(text)}
                            value={version}
                            id='version-input'
                        />)}
                    <TextField
                        placeholder="Path to swagger definition"
                        label="Path to swagger definition"
                        onChange={(text: string) => setSwaggerdefPath(text)}
                        validationMessage="API context is required"
                        value={swaggerdefPath}
                        id='context-input'
                    />
                    <SubContainer>
                        <CardContainer>
                        </CardContainer>
                    </SubContainer>
                </SectionWrapper>
                <ActionContainer>
                    <VSCodeButton
                        appearance="secondary"
                        onClick={handleCancel}
                    >
                        Cancel
                    </VSCodeButton>
                    <VSCodeButton
                        appearance="primary"
                        onClick={handleCreateProject}
                        id='create-project-btn'
                    // disabled={!isValid}
                    >
                        Create
                    </VSCodeButton>
                </ActionContainer>
            </WizardContainer>
        </>
    );
}
