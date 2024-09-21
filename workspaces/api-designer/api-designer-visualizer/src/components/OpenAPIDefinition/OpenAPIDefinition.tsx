/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React, { useState } from "react";
import { OpenAPI } from "../../Definitions/ServiceDefinitions";
import { Codicon, SidePanelBody, SidePanelTitleContainer, TextField, Typography } from '@wso2-enterprise/ui-toolkit';
import styled from "@emotion/styled";
import { PathsComponent } from "../PathsComponent/PathsComponent";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { version } from "os";
import { Overview } from "../Overview/Overview";

interface OpenAPIDefinitionProps {
    openAPIDefinition: OpenAPI;
}

const OverviewContainer = styled.div`
    padding: 10px;
    max-height: 90vh;
    overflow-y: auto;
`;

const OverviewTitle = styled.div`
    display: flex;
    flex-direction: row;
    gap: 9px;
    padding: 5px;
    cursor: pointer;
    &:hover {
        background-color: var(--vscode-editor-selectionBackground);
    }
`;

const PanelContainer = styled.div`
    width: 900px; // Adjust width as needed
    background-color: #f0f0f0; // Change background color as needed
    padding: 10px;
    position: absolute; // Position it absolutely
    right: 0; // Align to the right
    top: 30px; // Align to the top
    height: 100%; // Full height
    overflow-y: auto; // Enable scrolling if content overflows
`;

const schema = yup.object({
    title: yup.string(),
    version: yup.string()
});

export function OpenAPIDefinition(props: OpenAPIDefinitionProps) {
    const { openAPIDefinition } = props;
    const [selectedPathID, setSelectedPathID] = useState<string | undefined>(undefined);

    const {
        reset,
        register,
        formState: { errors, isDirty },
        handleSubmit,
        getValues,
        setValue,
        control,
        watch,
    } = useForm({
        // defaultValues: null,
        resolver: yupResolver(schema),
        mode: "onChange"
    });

    const handlePathClick = (pathID: string) => {
        setSelectedPathID(pathID);
    }
    console.log(openAPIDefinition);
    return (
        <OverviewContainer>
            <OverviewTitle>
                <Codicon name="globe" iconSx={{fontSize: 20}} />
                <Typography variant="h3" sx={{margin: 2}}>Overview</Typography>
            </OverviewTitle>
            <PathsComponent paths={openAPIDefinition.paths} selectedPathID={selectedPathID} onPathChange={handlePathClick}/>
            <PanelContainer>
                <Overview openAPIDefinition={openAPIDefinition}/>
            </PanelContainer>
        </OverviewContainer>
    )
}
