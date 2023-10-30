/*
 *  Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
 * 
 *  This software is the property of WSO2 LLC. and its suppliers, if any.
 *  Dissemination of any information or reproduction of any material contained
 *  herein is strictly forbidden, unless permitted by WSO2 in accordance with
 *  the WSO2 Commercial License available at http://wso2.com/licenses.
 *  For specific language governing the permissions and limitations under
 *  this license, please see the license as well as any agreement you’ve
 *  entered into with WSO2 governing the purchase of this software and any
 *  associated services.
 */
import { BuildPackVersions, ChoreoComponentType, ChoreoImplementationType, ChoreoServiceType, ComponentAccessibility, ComponentCreateMode, ComponentNetworkVisibility, GitProvider } from "@wso2-enterprise/choreo-core";

export interface ComponentWizardState {
    mode: ComponentCreateMode; // instead of boolean, use this type everywhere
    name: string;
    description: string;
    type: ChoreoComponentType;
    serviceType: ChoreoServiceType;
    implementationType: ChoreoImplementationType;
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
    };
    webAppConfig?: {
        dockerContext?: string;
        webAppType?: string;
        webAppBuildCommand?: string;
        webAppPackageManagerVersion?: string;
        webAppOutputDirectory?: string;
    },
    trigger?: {
        id: string;
        services?: string[];
    };
    buildPack?: {
        supportedVersions?: BuildPackVersions[];
        selectedVersion?: string;
    }
    version: string;
}
