/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import styled from "@emotion/styled";
import { useEffect, useState } from "react";
import { Button, Codicon, Dropdown, TextField, Typography } from "@wso2-enterprise/ui-toolkit";
import { SectionWrapper } from "../Commons";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import { EVENT_TYPE, MACHINE_VIEW } from "@wso2-enterprise/mi-core";
import InlineButtonGroup from "../Commons/InlineButtonGroup";
import ParamsTable from "./ParamTable";

const WizardContainer = styled.div`
    display: flex;
    flex-direction: column;
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
    width: 100%;
    margin-top: 20px;
`;

const SubTitle = styled.h3`
    margin: 0px;
`;

const FieldGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 5px;
`;

export interface Region {
    label: string;
    value: string;
}

const Container = styled.div`
    display: flex;
    flex-direction: row;
    height: 50px;
    align-items: center;
    justify-content: flex-start;
`;

export interface TemplateEndpointWizardProps {
    path: string;
}

type Endpoint = {
    type: string;
    value: string;
}

export function TemplateEndpointWizard(props: TemplateEndpointWizardProps) {

    const { rpcClient } = useVisualizerContext();

    const [endpoint, setEndpoint] = useState<any>({
        name: '',
        uri: '',
        template: '',
        description: '',
    });

    const [templates, setTemplates] = useState<any[]>([]);
    const [parameters, setParameters] = useState<any[]>([]);
    const [expandParamsView, setExpandParamsView] = useState<boolean>(false);

    useEffect(() => {
        (async () => {
            const { parameters, ...endpoint } = await rpcClient.getMiDiagramRpcClient().getTemplateEndpoint({ path: props.path });

            setEndpoint(endpoint);
            setParameters(parameters);

            if (parameters.length > 0) {
                setExpandParamsView(true);
            }

            const items = await rpcClient.getMiDiagramRpcClient().getTemplates();
            const templates = items.data.map((temp: string) => {
                temp = temp.replace(".xml", "");
                return { value: temp }
            });
            setTemplates(templates);
        })();
    }, []);

    const handleOnChange = (field: string, value: any) => {
        setEndpoint((prev: any) => ({ ...prev, [field]: value }));
    }

    const handleAddNewProperty = () => {
        if (parameters.length > 0 && parameters[parameters.length - 1].name === "" && parameters[parameters.length - 1].value === "") {
            return;
        }

        setParameters((prev: any) => [...prev, { name: '', value: '', scope: 'default' }]);
        setExpandParamsView(true);
    }

    const handleUpdateEndpoint = async () => {
        const updateEndpointParams = {
            directory: props.path,
            ...endpoint,
            parameters,
        }
        rpcClient.getMiDiagramRpcClient().updateTemplateEndpoint(updateEndpointParams);
        openOverview();
    };

    const openOverview = () => {
        rpcClient.getMiVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { view: MACHINE_VIEW.Overview } });
    };

    const handleBackButtonClick = () => {
        openOverview();
    }

    const validateEndpointName = (name: string) => {
        // Check if the name is empty
        if (!name.trim()) {
            return "Enpoint name is required";
        }

        // Check if the name contains spaces or special characters
        if (/[\s~`!@#$%^&*()_+={}[\]:;'",.<>?/\\|]+/.test(name)) {
            return "Endpoint name cannot contain spaces or special characters";
        }
        return "";
    };

    const isValid: boolean = validateEndpointName(endpoint.name) === '' && endpoint.template.length > 0;

    return (
        <WizardContainer>
            <SectionWrapper>
                <Container>
                    <Codicon iconSx={{ marginTop: -3, fontWeight: "bold", fontSize: 22 }} name='arrow-left' onClick={handleBackButtonClick} />
                    <div style={{ marginLeft: 30 }}>
                        <Typography variant="h3">Template Endpoint Artifact</Typography>
                    </div>
                </Container>
                <SubTitle>Basic Properties</SubTitle>
                <TextField
                    id='name-input'
                    label="Name"
                    placeholder="Name"
                    value={endpoint.name}
                    onChange={(text: string) => handleOnChange('name', text)}
                    errorMsg={validateEndpointName(endpoint.name)}
                    size={100}
                    autoFocus
                    required
                />
                <TextField
                    id='uri-input'
                    label="Uri"
                    placeholder="Uri"
                    value={endpoint.uri}
                    onChange={(text: string) => handleOnChange('uri', text)}
                />
                <FieldGroup>
                    <span>Template</span>
                    <Dropdown
                        id="template"
                        value={endpoint.template}
                        onChange={(text: string) => handleOnChange("template", text)}
                        items={templates}
                    />
                </FieldGroup>
                <TextField
                    id='description'
                    value={endpoint.description}
                    label="Description"
                    onChange={(text: string) => handleOnChange('description', text)}
                />
                <FieldGroup>
                    <InlineButtonGroup
                        label="Parameters"
                        isHide={expandParamsView}
                        onShowHideToggle={() => {
                            setExpandParamsView(!expandParamsView);
                        }}
                        addNewFunction={handleAddNewProperty}
                    />
                    {expandParamsView && <ParamsTable params={parameters} setParams={setParameters} />}
                </FieldGroup>
            </SectionWrapper>
            <ActionContainer>
                <Button
                    appearance="secondary"
                    onClick={openOverview}
                >
                    Cancel
                </Button>
                <Button
                    appearance="primary"
                    onClick={handleUpdateEndpoint}
                    disabled={!isValid}
                >
                    Update
                </Button>
            </ActionContainer>
        </WizardContainer>
    );
}
