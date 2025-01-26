/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { DependencyDetails, MACHINE_VIEW, PomNodeDetails, POPUP_EVENT_TYPE, ProjectDetailsResponse } from "@wso2-enterprise/mi-core";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import { useEffect, useState } from "react";

import { FormGroup, Icon, ProgressIndicator, Typography } from "@wso2-enterprise/ui-toolkit";
import styled from "@emotion/styled";
import { ParamConfig, ParamManager } from "@wso2-enterprise/mi-diagram";
import { VSCodeLink } from "@vscode/webview-ui-toolkit/react";

const Item = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 12px;

    & > p {
        margin: 0px;
    }
`;

interface ProjectInformationProps {
}
export function ProjectInformation(props: ProjectInformationProps) {
    const { rpcClient } = useVisualizerContext();
    const [projectDetails, setProjectDetails] = useState<ProjectDetailsResponse>();
    const [connectorDependencies, setConnectorDependencies] = useState<ParamConfig>({
        paramValues: [],
        paramFields: []
    });
    const [otherDependencies, setOtherDependencies] = useState<ParamConfig>({
        paramValues: [],
        paramFields: []
    });

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await rpcClient.getMiVisualizerRpcClient().getProjectDetails();
                setProjectDetails(response);
                setDependencies(response.dependencies.connectorDependencies, setConnectorDependencies);
                setDependencies(response.dependencies.otherDependencies, setOtherDependencies);
            } catch (error) {
                console.error("Error fetching project details:", error);
            }
        }
        fetchData();
    }, [props]);

    const setDependencies = (dependencies: DependencyDetails[], setDependencies: any) => {
        setDependencies({
            paramValues: dependencies.map((dep, index) => (
                {
                    id: index,
                    key: dep.groupId,
                    value: dep.artifact,
                    icon: 'package',
                    paramValues: [
                        { value: dep.groupId },
                        { value: dep.artifact },
                    ]
                }
            )) || [],
            paramFields: [
                {
                    "type": "TextField" as "TextField",
                    "label": "Group ID",
                    "defaultValue": "",
                    "isRequired": false,
                    "canChange": false
                },
                {
                    "type": "TextField" as "TextField",
                    "label": "Artifact ID",
                    "defaultValue": "",
                    "isRequired": false,
                    "canChange": false
                },
            ]
        });
    };

    const openManageDependencies = (title: string, dependencies: DependencyDetails[]) => {
        rpcClient.getMiVisualizerRpcClient().openView({
            type: POPUP_EVENT_TYPE.OPEN_VIEW,
            location: { view: MACHINE_VIEW.ManageDependencies, customProps: { title, dependencies } },
            isPopup: true
        });
    }

    const openManageConfigs = (configs: PomNodeDetails[]) => {
        rpcClient.getMiVisualizerRpcClient().openView({
            type: POPUP_EVENT_TYPE.OPEN_VIEW,
            location: { view: MACHINE_VIEW.ManageConfigurables, customProps: { configs } },
            isPopup: true
        });
    }

    if (!projectDetails) {
        return <ProgressIndicator />;
    }

    const { primaryDetails, buildDetails, dependencies, unitTest, configurables } = projectDetails;

    function Dependencies(title: string, dependencies: DependencyDetails[], config: ParamConfig, onChange: (values: ParamConfig) => void) {
        return <FormGroup title={title} isCollapsed={false}>
            {!dependencies || dependencies.length === 0 ? <Typography>No dependencies found</Typography> :
                <ParamManager
                    paramConfigs={config}
                    readonly={true}
                    allowAddItem={false}
                    onChange={(values: ParamConfig) => {
                        values.paramValues = values.paramValues.map((param: any) => {
                            const paramValues = param.paramValues;
                            param.key = paramValues[0].value;
                            param.value = paramValues[1].value;
                            param.icon = 'query';
                            return param;
                        });
                        onChange(values);
                    }}
                />}
            <VSCodeLink onClick={() => openManageDependencies(title, dependencies)}>
                <div style={{
                    display: 'flex',
                }}>Manage Dependencies <Icon name="link-external" isCodicon sx={{ marginLeft: '5px' }} />
                </div>
            </VSCodeLink>
        </FormGroup>;
    }

    function Configurables(configs: PomNodeDetails[]) {
        return <>
            {!configs || configs.length === 0 ? <Typography>No configurables found</Typography> :
                <ParamManager
                    paramConfigs={{
                        paramValues: configurables.map((config, index) => (
                            {
                                id: index,
                                key: config.key,
                                value: config.value,
                                icon: 'query',
                                paramValues: [
                                    { value: config.key },
                                    { value: config.value },
                                ]
                            }
                        )) || [],
                        paramFields: [
                            {
                                "type": "TextField",
                                "label": "Key",
                                "defaultValue": "",
                                "isRequired": false,
                                "canChange": false
                            },
                            {
                                "type": "TextField",
                                "label": "Value",
                                "defaultValue": "",
                                "isRequired": false,
                                "canChange": false
                            },
                        ]
                    }}
                    readonly={true}
                    allowAddItem={false}
                />}
            <VSCodeLink onClick={() => openManageConfigs(configs)}>
                <div style={{
                    display: 'flex',
                }}>Manage Configurables <Icon name="link-external" isCodicon sx={{ marginLeft: '5px' }} />
                </div>
            </VSCodeLink>
        </>;
    }

    return (
        <div>
            <FormGroup title="Primary Details" isCollapsed={false}>
                <div>
                    <Item>
                        <Icon name="project" sx={{ marginRight: '8px' }} />
                        <Typography>Name: {primaryDetails.projectName.value}</Typography>
                    </Item>
                    <Item>
                        <Icon name="info" isCodicon sx={{ marginRight: '8px' }} />
                        <Typography>Description: {primaryDetails.projectDescription.value}</Typography>
                    </Item>
                    <Item>
                        <Icon name="versions" isCodicon sx={{ marginRight: '8px' }} />
                        <Typography>Version: {primaryDetails.projectVersion.value}</Typography>
                    </Item>
                    <Item>
                        <Icon name="vm" isCodicon sx={{ marginRight: '8px' }} />
                        <Typography>Runtime Version: {primaryDetails.runtimeVersion.value}</Typography>
                    </Item>
                </div>
            </FormGroup>

            <FormGroup title="Configurables" isCollapsed={false}>
                {Configurables(configurables)}
            </FormGroup>

            <FormGroup title="Dependencies" isCollapsed={false}>
                {Dependencies("Connector Dependencies", dependencies?.connectorDependencies, connectorDependencies, setConnectorDependencies)}
                {Dependencies("Other Dependencies", dependencies?.otherDependencies, otherDependencies, setOtherDependencies)}
            </FormGroup>

            <FormGroup title="Build Details" isCollapsed={true}>
                <div>
                    <Item>
                        <Icon name="file-code" isCodicon sx={{ marginRight: '8px' }} />
                        <Typography>Base Image: {buildDetails?.dockerDetails?.dockerFileBaseImage?.value}</Typography>
                    </Item>
                    <Item>
                        <Icon name="package" isCodicon sx={{ marginRight: '8px' }} />
                        <Typography>Docker Name: {buildDetails?.dockerDetails?.dockerName?.value}</Typography>
                    </Item>
                </div>
            </FormGroup>

            <FormGroup title="Unit Tests Configuration" isCollapsed={true}>
                <div>
                    <Item>
                        <Icon name="check" isCodicon sx={{ marginRight: '8px' }} />
                        <Typography>Skip Tests: {unitTest?.skipTest?.value}</Typography>
                    </Item>
                    <Item>
                        <Icon name="server" isCodicon sx={{ marginRight: '8px' }} />
                        <Typography>Server Host: {unitTest?.serverHost?.value}</Typography>
                    </Item>
                    <Item>
                        <Icon name="settings" isCodicon sx={{ marginRight: '8px' }} />
                        <Typography>Server Port: {unitTest?.serverPort?.value}</Typography>
                    </Item>
                    <Item>
                        <Icon name="folder" isCodicon sx={{ marginRight: '8px' }} />
                        <Typography>Server Path: {unitTest?.serverPath?.value}</Typography>
                    </Item>
                    <Item>
                        <Icon name="info" isCodicon sx={{ marginRight: '8px' }} />
                        <Typography>Server Type: {unitTest?.serverType?.value}</Typography>
                    </Item>
                </div>
            </FormGroup>
        </div>
    );
}
