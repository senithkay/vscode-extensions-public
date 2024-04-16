/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { RpcClient } from "@wso2-enterprise/mi-rpc-client";
import { Control, FieldErrors, UseFormGetValues, UseFormRegister } from "react-hook-form";
import { CreateRegistryResourceRequest } from "@wso2-enterprise/mi-core";
import ControllerField, { FieldType } from "./Commons/ControllerField";

export interface AddToRegistryProps {
    path: string;
    fileName: string;
    register: UseFormRegister<any>;
    getValues: UseFormGetValues<any>;
    errors: FieldErrors<any>;
    control: Control<any, any>;
}

export async function saveToRegistry(rpcClient: RpcClient, path: string, registryType: string,
    fileName: string, content: string, registryPath: string, artifactName: string) {
    const regRequest: CreateRegistryResourceRequest = {
        projectDirectory: path,
        templateType: "Sequence",
        filePath: "",
        resourceName: fileName,
        artifactName: artifactName,
        registryPath: registryPath,
        registryRoot: registryType,
        createOption: "new",
        content: content,
    }
    const regfilePath = await rpcClient.getMiDiagramRpcClient().createRegistryResource(regRequest);
}

export function formatRegistryPath(path: string, registryType: string, fileName: string): string {
    let regPath = '';
    if (registryType === 'gov') {
        regPath = regPath + 'gov';
    } else {
        regPath = regPath + 'conf';
    }
    path.startsWith('/') ? regPath = regPath + path : regPath = regPath + '/' + path;
    regPath.endsWith('/') ? regPath = regPath + fileName + '.xml' : regPath = regPath + '/' + fileName + '.xml';
    return regPath;
}

export async function getArtifactNamesAndRegistryPaths(path: string, rpcClient: RpcClient)
    : Promise<{ artifactNamesArr: string[], registryPaths: string[] }> {
    const response = await rpcClient.getMiDiagramRpcClient().getAvailableRegistryResources({ path: path });
    const artifacts = response.artifacts;
    var tempArtifactNames: string[] = [];
    for (let i = 0; i < artifacts.length; i++) {
        tempArtifactNames.push(artifacts[i].name);
    }
    const res = await rpcClient.getMiVisualizerRpcClient().getAllRegistryPaths({
        path: path,
    });
    return { artifactNamesArr: tempArtifactNames, registryPaths: res.registryPaths };
}

export function AddToRegistry(props: AddToRegistryProps) {
    return (
        <div>
            <ControllerField
                required
                autoFocus
                id="artifactName"
                label="Artifact name"
                control={props.control}
                errors={props.errors}
            />
            <ControllerField
                id="registryType"
                label="Select registry type"
                control={props.control}
                errors={props.errors}
                fieldType={FieldType.RADIO_GROUP}
                options={[{ content: "Governance registry (gov)", value: "gov" }, { content: "Configuration registry (conf)", value: "conf" }]}
            />
            <ControllerField
                required
                autoFocus
                id="registryPath"
                label="Registry path"
                control={props.control}
                errors={props.errors}
            />
        </div>
    );
};

export default AddToRegistry;
