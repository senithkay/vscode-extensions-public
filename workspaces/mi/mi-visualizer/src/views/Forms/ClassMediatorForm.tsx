/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import styled from "@emotion/styled";
import { Button, TextField, Typography } from "@wso2-enterprise/ui-toolkit";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import { SectionWrapper } from "./Commons";
import { EVENT_TYPE, MACHINE_VIEW } from "@wso2-enterprise/mi-core";
import { useState } from "react";


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

export interface ClassMediatorProps {
    path: string;
}

export function ClassMediatorForm(props: ClassMediatorProps) {

    const { rpcClient } = useVisualizerContext();
    const [packageName, setPackage] = useState("");
    const [className, setClassName] = useState("");


    const handleCancel = () => {
        rpcClient.getMiVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { view: MACHINE_VIEW.Overview } });
    };

    const handleSave = async () => {
        const request = {
            projectDirectory: props.path,
            packageName: packageName,
            className: className
        };
        const response = await rpcClient.getMiDiagramRpcClient().createClassMediator(request);
        if (response) {
            rpcClient.getMiVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { view: MACHINE_VIEW.Overview } });
            rpcClient.getMiDiagramRpcClient().openFile(response);
            rpcClient.getMiDiagramRpcClient().closeWebView();
        }
    }

    const isValid = packageName && packageName != "" && className && className != "";

    return (

        <WizardContainer>
            <SectionWrapper>
                <Typography variant="h3">Create Class Mediator</Typography>
                <TextField
                    value={packageName}
                    id='package-input'
                    label="Package Name"
                    placeholder="com.example"
                    onTextChange={(text: string) => setPackage(text)}
                    size={40}
                    autoFocus
                    required
                />
                <TextField
                    value={className}
                    id='class-input'
                    label="Class Name"
                    placeholder="SampleMediator"
                    onTextChange={(text: string) => setClassName(text)}
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
                        Create
                    </Button>
                </ActionContainer>
            </SectionWrapper>
        </WizardContainer>
    );
}
