/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect } from "react";
import { useVisualizerContext } from "@wso2-enterprise/ballerina-rpc-client";
import { Divider } from "@wso2-enterprise/ui-toolkit";
import styled from "@emotion/styled";

const TitleContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
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

export function EggplantHeader() {
    const { rpcClient } = useVisualizerContext();
    const [projectName, setProjectName] = React.useState<string>("");

    useEffect(() => {
        rpcClient.getEggplantDiagramRpcClient().getWorkspaces().then(res => {
            setProjectName(res.workspaces[0].name);
        })
    }, []);

    return (
        <>
            <TitleContainer>
                <ProjectTitle>{projectName}</ProjectTitle>
                <ProjectSubtitle>Project</ProjectSubtitle>
            </TitleContainer>
            <Divider />
        </>
    );
}
