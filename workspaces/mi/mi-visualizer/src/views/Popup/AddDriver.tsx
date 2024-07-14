/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Button, FormActions, FormView, ProgressIndicator, Typography } from "@wso2-enterprise/ui-toolkit";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import { useEffect, useState } from "react";
import { ParamConfig, ParamManager, ParamValue, getParamManagerFromValues, getParamManagerValues } from "@wso2-enterprise/mi-diagram";
import { POPUP_EVENT_TYPE, Dependency } from "@wso2-enterprise/mi-core";

export interface AddDriverProps {
    path: string;
    identifier?: string;
    isPopup?: boolean;
}

export function AddDriver(props: AddDriverProps) {
    const { rpcClient } = useVisualizerContext();
    const [config, setConfig] = useState<ParamConfig>();
    const [isLoading, setIsLoading] = useState(true);
    const [dependencies, setDependencies] = useState<any[]>([]);
    const name = props.identifier

    useEffect(() => {
        const fetchDependencies = async () => {
            const dependencies = await rpcClient.getMiDiagramRpcClient().getAllDependencies({ file: props.path });

            const filteredDependencies = dependencies?.dependencies.filter((dependency: any) => {
                return dependency.artifactId.toLowerCase().includes(name.toLowerCase());
            });

            let dependenciesList = filteredDependencies.map((dependency: any) => {
                return Object.values(dependency);
            });
            setDependencies(filteredDependencies);

            dependenciesList = dependenciesList.map((dependency: any) => {
                dependency.pop();
                return dependency;
            });

            setConfig({
                paramValues: dependenciesList ? getParamManagerFromValues(dependenciesList, 1, 2) : [],
                paramFields: [
                    {
                        "type": "TextField",
                        "label": "Group ID",
                        "defaultValue": "",
                        "isRequired": true
                    },
                    {
                        "type": "TextField",
                        "label": "Artifact ID",
                        "defaultValue": "",
                        "isRequired": true
                    },
                    {
                        "type": "TextField",
                        "label": "Version",
                        "defaultValue": "",
                        "isRequired": true
                    }
                ]
            });
            setIsLoading(false);

        };
        fetchDependencies();
    }, [rpcClient, props.path]);

    const handleOnClose = () => {
        rpcClient.getMiVisualizerRpcClient().openView({ type: POPUP_EVENT_TYPE.CLOSE_VIEW, location: { view: null }, isPopup: true })
    };

    const handleSave = async () => {
        let values: Dependency[] = getParamManagerValues(config);

        const items = values.length === 0 ? dependencies : values;
        for (let i = 0; i < items.length; i++) {
            const value: any = values[i];
            const dependency = dependencies[i];

            await rpcClient.getMiDiagramRpcClient().updateDependencyInPom({
                file: props.path,
                groupId: value ? value[0] : undefined,
                artifactId: value ? value[1] : undefined,
                version: value ? value[2] : undefined,
                range: dependency ? dependency.range : undefined
            });
        }
        handleOnClose();
    };

    if (isLoading) {
        return <ProgressIndicator />;
    }

    return (
        <FormView title={`Available drivers for ${name}`} onClose={handleOnClose} hideClose={props.isPopup}>
            <div style={{
                maxWidth: "49em",
            }}>
                {config.paramValues.length === 0 ? (
                    <Typography variant="body3">{`No drivers found for ${name}`}</Typography>
                ) : null}
                <ParamManager
                    paramConfigs={config}
                    allowAddItem={config.paramValues.length === 0}
                    addParamText="Add Driver"
                    onChange={(values) => {
                        values.paramValues = values.paramValues.map((param: any, index: number) => {
                            const property: ParamValue[] = param.paramValues;
                            param.key = property[1].value;
                            param.value = property[2].value;
                            param.icon = 'query';
                            return param;
                        });
                        setConfig(values);
                    }}
                />
            </div>
            <FormActions>
                <Button
                    appearance="primary"
                    onClick={handleSave}
                >
                    {"Save Changes"}
                </Button>
                <Button
                    appearance="secondary"
                    onClick={handleOnClose}
                >
                    Cancel
                </Button>
            </FormActions>
        </FormView>
    );
}
