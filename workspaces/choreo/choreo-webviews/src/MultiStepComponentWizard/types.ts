/*
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { Buildpack, ChoreoComponentType, ChoreoServiceType, ComponentAccessibility, ComponentNetworkVisibility, GitProvider, LocalComponentDirMetaDataRes } from "@wso2-enterprise/choreo-core";

export interface ComponentWizardState {
    name: string;
    description: string;
    type: ChoreoComponentType;
    serviceType: ChoreoServiceType;
    implementationType: string;
    accessibility: ComponentAccessibility;
    networkVisibility: ComponentNetworkVisibility;
    port?: string;
    endpointContext?: string;
    repository: {
        isCloned?: boolean;
        isBareRepo?: boolean;
        org?: string;
        repo?: string;
        branch?: string;
        subPath?: string;
        dockerContext?: string;
        dockerFile?: string;
        openApiFilePath?: string;
        gitProvider?: GitProvider;
        credentialID?: string;
        isMonoRepo?: boolean;
        directoryPathError?: string;
        createNewDir?: boolean;
        selectedDirectoryMetadata?: LocalComponentDirMetaDataRes;
    };
    webAppConfig?: {
        dockerContext?: string;
        webAppType?: string;
        webAppBuildCommand?: string;
        webAppPackageManagerVersion?: string;
        webAppOutputDirectory?: string;
    },
    version: string;
    buildPacksLoading?: boolean;
    buildPackList: Buildpack[];
    selectedBuildPackVersion?: string;
}
