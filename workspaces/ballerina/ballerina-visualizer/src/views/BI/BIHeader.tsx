/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect } from "react";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import { Codicon, Divider, Alert } from "@wso2-enterprise/ui-toolkit";
import styled from "@emotion/styled";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { SHARED_COMMANDS } from "@wso2-enterprise/ballerina-core";
import { AlertBox } from "../AIPanel/AlertBox";
import { AlertBoxWithClose } from "../AIPanel/AlertBoxWithClose";

const TitleContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    /* margin-left: 20px; */
`;

const ActionContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    margin-left: auto;
    margin-right: 0;
    align-self: flex-end;
`;

const ProjectTitle = styled.h1`
    font-weight: bold;
    font-size: 1.5rem;
    text-transform: capitalize;
    margin-bottom: 0;
    margin-top:0;
    @media (min-width: 768px) {
        font-size: 1.875rem;
    }
`;

const ProjectSubtitle = styled.h2`
    display: none;
    font-weight: 200;
    font-size: 1.5rem;
    opacity: 0.3;
    margin-bottom: 0;
    margin-top:0;
    @media (min-width: 640px) {
        display: block;
    }

    @media (min-width: 768px) {
        font-size: 1.875rem;
    }
`;

export function BIHeader(props: { showAI?: boolean, actions?: React.ReactNode[] }) {
    const { rpcClient } = useRpcContext();
    const [projectName, setProjectName] = React.useState<string>("");
    const [showAlert, setShowAlert] = React.useState(false);

    useEffect(() => {
        rpcClient.getBIDiagramRpcClient().getWorkspaces().then(res => {
            setProjectName(res.workspaces[0].name);
        });
        showLoginAlert().then((status) => {
            setShowAlert(status);
        });
    }, []);

    async function handleSettings() {
        await rpcClient.getAiPanelRpcClient().openSettings();
        rpcClient.getCommonRpcClient().executeCommand({ commands: [SHARED_COMMANDS.OPEN_AI_PANEL] });
    }

    async function handleClose() {
        //TODO: Set state to never show this alert again
        console.log("Close");
        await rpcClient.getAiPanelRpcClient().markAlertShown();
        setShowAlert(false);
    }

    async function showLoginAlert() {
        //TODO: Read state and return true/false
        const resp = await rpcClient.getAiPanelRpcClient().showSignInAlert();
        console.log("showLoginAlert", resp);
        setShowAlert(resp);
        return resp;
    }

    return (
        <>
            <TitleContainer>
            <ProjectTitle>{projectName}</ProjectTitle>
            <ProjectSubtitle>Integration</ProjectSubtitle>
            {/* {props.showAI && <AIContainer>
                <VSCodeButton appearance="primary" title="Generate with AI" onClick={handleGenerateBtn}>
                <Codicon name="wand" sx={{ marginRight: 5 }} /> Generate with AI
                </VSCodeButton>

            </AIContainer>} */}
            <ActionContainer>
                {props.actions}
            </ActionContainer>
            </TitleContainer>
            <Divider />
            {showAlert && (
            <AlertBoxWithClose 
                subTitle={
                "Please log in to WSO2 AI Platform to access AI features. You won't be able to use AI features until you log in."
                }
                title={"Login to WSO2 AI Platform"}

                btn1Title="Manage Accounts"
                btn1IconName="settings-gear"
                btn1OnClick={() => handleSettings()}
                btn1Id="settings"

                btn2Title="Close"
                btn2IconName="close"
                btn2OnClick={() =>handleClose()}
                btn2Id="Close"
            />
            )}
        </>
    );
}
