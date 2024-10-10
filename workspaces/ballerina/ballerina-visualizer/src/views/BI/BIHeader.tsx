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
import { Codicon, Divider } from "@wso2-enterprise/ui-toolkit";
import styled from "@emotion/styled";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { SHARED_COMMANDS } from "@wso2-enterprise/ballerina-core";

const TitleContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    /* margin-left: 20px; */
`;

const AIContainer = styled.div`
    right: 0;
    position: absolute;
    margin-right: 35px;
    margin-top: 50px;
`;

const ProjectTitle = styled.h1`
    font-weight: bold;
    font-size: 1.5rem;
    text-transform: capitalize;

    @media (min-width: 768px) {
        font-size: 1.875rem;
    }
`;

const ProjectSubtitle = styled.h2`
    display: none;
    font-weight: 200;
    font-size: 1.5rem;
    opacity: 0.3;

    @media (min-width: 640px) {
        display: block;
    }

    @media (min-width: 768px) {
        font-size: 1.875rem;
    }
`;

export function BIHeader(props: { showAI?: boolean }) {
    const { rpcClient } = useRpcContext();
    const [projectName, setProjectName] = React.useState<string>("");

    useEffect(() => {
        rpcClient.getBIDiagramRpcClient().getWorkspaces().then(res => {
            setProjectName(res.workspaces[0].name);
        });
    }, []);

    const handleGenerateBtn = () => {
        rpcClient.getCommonRpcClient().executeCommand({ commands: [SHARED_COMMANDS.OPEN_AI_PANEL] });
    }

    return (
        <>
            <TitleContainer>
                <ProjectTitle>{projectName}</ProjectTitle>
                <ProjectSubtitle>Project</ProjectSubtitle>
                {props.showAI && <AIContainer>
                    <VSCodeButton appearance="primary" title="Generate with AI" onClick={handleGenerateBtn}>
                        <Codicon name="wand" sx={{ marginRight: 5 }} /> Generate with AI
                    </VSCodeButton>
                </AIContainer>}
            </TitleContainer>
            <Divider />
        </>
    );
}
