/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { DependencyDetails } from "@wso2-enterprise/mi-core";
import { getParamManagerValues, ParamConfig, ParamManager } from "@wso2-enterprise/mi-diagram";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import { Button, FormActions, FormView, Typography } from "@wso2-enterprise/ui-toolkit";
import { useState } from "react";

interface ManageDependenciesProps {
    title: string;
    dependencies: DependencyDetails[];
    onClose: () => void;
}
export function ManageDependencies(props: ManageDependenciesProps) {
    const { title, dependencies, onClose } = props;
    const { rpcClient } = useVisualizerContext();
    const [paramConfig, setParamConfig] = useState<ParamConfig>({
        paramValues: dependencies?.map((dep, index) => (
            {
                id: index,
                key: index.toString(),
                value: dep.groupId,
                icon: 'package',
                paramValues: [
                    { value: dep.groupId },
                    { value: dep.artifact },
                    { value: dep.version },
                ]
            }
        )) || [],
        paramFields: [
            {
                "type": "TextField" as "TextField",
                "label": "Group ID",
                "defaultValue": "",
                "isRequired": true,
                "canChange": false
            },
            {
                "type": "TextField" as "TextField",
                "label": "Artifact ID",
                "defaultValue": "",
                "isRequired": true,
                "canChange": false
            },
            {
                "type": "TextField" as "TextField",
                "label": "Version",
                "defaultValue": "",
                "isRequired": true,
                "canChange": false
            }
        ]
    });

    const updateDependencies = async () => {
        const dependencies = getParamManagerValues(paramConfig);
        dependencies.forEach((dep, index) => {
            rpcClient.getMiVisualizerRpcClient().updateDependency({
                groupId: dep[0],
                artifact: dep[1],
                version: dep[2]
            });
        });
        onClose();
    };

    return (
        <FormView title={title} onClose={onClose}>
            {paramConfig.paramValues.length === 0 && <Typography>No dependencies found</Typography>}
            <ParamManager
                paramConfigs={paramConfig}
                readonly={false}
                addParamText="Add Dependency"
                onChange={(values: ParamConfig) => {
                    values.paramValues = values.paramValues.map((param: any) => {
                        const paramValues = param.paramValues;
                        param.key = paramValues[0].value;
                        param.value = paramValues[1].value;
                        param.icon = 'query';
                        return param;
                    });
                    setParamConfig(values);
                }}
            />
            <FormActions>
                <Button
                    appearance="secondary"
                    onClick={onClose}
                >
                    Cancel
                </Button>
                <Button
                    appearance="primary"
                    onClick={updateDependencies}
                >
                    {"Update Dependencies"}
                </Button>
            </FormActions>
        </FormView>
    );
}
