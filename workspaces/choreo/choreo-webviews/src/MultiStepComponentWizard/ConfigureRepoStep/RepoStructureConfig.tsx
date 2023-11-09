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
import React from "react";

import { ComponentWizardState } from "../types";
import { BYOCRepoConfig } from "./BYOCRepoConfig";
import { WebAppRepoConfig } from "./WebAppRepoConfig";
import { BuildPackConfig } from "./BuildPackConfig";
import { MIConfig } from "./MIConfig";
import {
    ChoreoBuildPackNames,
    ChoreoComponentType,
    ChoreoImplementationType,
    LocalComponentDirMetaDataRes,
    WebAppSPATypes,
} from "@wso2-enterprise/choreo-core";
import { BalSubPathConfig } from "./BalSubPathConfig";
import { ChoreoWebViewAPI } from "../../utilities/WebViewRpc";
import { useQuery } from "@tanstack/react-query";
import { useChoreoWebViewContext } from "../../context/choreo-web-view-ctx";

export interface RepoStructureConfigProps {
    formData: Partial<ComponentWizardState>;
    onFormDataChange: (updater: (prevFormData: Partial<ComponentWizardState>) => Partial<ComponentWizardState>) => void;
    formErrors: Record<keyof ComponentWizardState, string>;
}

export const RepoStructureConfig = (props: RepoStructureConfigProps) => {
    const { type, implementationType, repository, webAppConfig } = props.formData;
    const { choreoProject } = useChoreoWebViewContext();

    const isBuildPackType = ![
        ChoreoImplementationType.Ballerina,
        ChoreoImplementationType.MicroIntegrator,
        ChoreoImplementationType.Docker,
        ChoreoImplementationType.StaticFiles,
        ...WebAppSPATypes,
    ].includes(implementationType as ChoreoImplementationType);

    useQuery(
        ["getLocalComponentDirMetaData", choreoProject, repository, implementationType, webAppConfig],
        () =>
            ChoreoWebViewAPI.getInstance().getLocalComponentDirMetaData({
                orgName: repository?.org,
                repoName: repository?.repo,
                projectId: choreoProject?.id,
                subPath: repository?.subPath || webAppConfig?.dockerContext || webAppConfig?.webAppOutputDirectory,
                dockerFilePath: repository?.dockerFile,
                dockerContextPath: repository?.dockerContext,
                buildPackId: implementationType,
            }),
        {
            enabled: !!choreoProject,
            onSuccess: (selectedDirectoryMetadata) => {
                const directoryPathError = getDirPathError(selectedDirectoryMetadata, implementationType);
                props.onFormDataChange((prevFormData) => ({
                    ...prevFormData,
                    repository: { ...prevFormData.repository, directoryPathError, selectedDirectoryMetadata },
                }));
            },
        }
    );

    const getDirPathError = (selectedDirectoryMetadata: LocalComponentDirMetaDataRes, implementationType: string) => {
        if (selectedDirectoryMetadata) {
            if (implementationType === ChoreoImplementationType.Docker) {
                if (!selectedDirectoryMetadata.dockerFilePathValid) {
                    return "Please provide a valid Dockerfile path";
                } else if (!selectedDirectoryMetadata.isDockerContextPathValid) {
                    return "Provide a valid path for docker context.";
                }
                return "";
            }
            if (type === ChoreoComponentType.WebApplication && !isBuildPackType) {
                if (
                    implementationType &&
                    WebAppSPATypes.includes(implementationType as ChoreoBuildPackNames) &&
                    webAppConfig.dockerContext &&
                    !repository.createNewDir &&
                    !selectedDirectoryMetadata?.isSubPathValid
                ) {
                    return "Sub path does not exist";
                }
                if (
                    implementationType === ChoreoImplementationType.StaticFiles &&
                    webAppConfig.webAppOutputDirectory &&
                    !repository.createNewDir &&
                    !selectedDirectoryMetadata?.isSubPathValid
                ) {
                    return "Sub path does not exist";
                }
                return "";
            }

            if (repository?.subPath) {
                if (!repository.createNewDir && !selectedDirectoryMetadata?.isSubPathValid) {
                    return "Sub path does not exist";
                }
                if (!selectedDirectoryMetadata?.isSubPathEmpty) {
                    if (
                        implementationType === ChoreoImplementationType.Ballerina &&
                        !selectedDirectoryMetadata?.hasBallerinaTomlInPath
                    ) {
                        return "Please provide a path that contains a Ballerina project.";
                    }
                    if (
                        implementationType === ChoreoImplementationType.MicroIntegrator &&
                        !selectedDirectoryMetadata?.hasPomXmlInPath
                    ) {
                        return "Please provide a valid path to the Micro Integrator Project.";
                    }
                    if (isBuildPackType && !selectedDirectoryMetadata.isBuildpackPathValid) {
                        return `Please provide a valid path to the ${implementationType} Project.`;
                    }
                }
            } else {
                if (
                    implementationType === ChoreoImplementationType.Ballerina &&
                    !selectedDirectoryMetadata?.hasBallerinaTomlInRoot
                ) {
                    return "Repository root does not contain a valid Ballerina project";
                }
                if (
                    implementationType === ChoreoImplementationType.MicroIntegrator &&
                    !selectedDirectoryMetadata?.hasPomXmlInInRoot
                ) {
                    return "Repository root does not contain a valid Micro Integrator project";
                }
                if (isBuildPackType && !selectedDirectoryMetadata.isBuildpackPathValid) {
                    return `Please provide a valid path to the ${implementationType} Project.`;
                }
            }
        }
        return "";
    };

    if (type === ChoreoComponentType.WebApplication && !isBuildPackType) {
        return (
            <WebAppRepoConfig
                formData={props.formData}
                onFormDataChange={props.onFormDataChange}
                webAppConfigError={props.formErrors["webAppConfig"] || props.formErrors["port"]}
            />
        );
    } else if (implementationType === ChoreoImplementationType.Ballerina) {
        return <BalSubPathConfig {...props} />;
    } else if (implementationType === ChoreoImplementationType.Docker) {
        return <BYOCRepoConfig formData={props.formData} onFormDataChange={props.onFormDataChange} />;
    } else if (implementationType === ChoreoImplementationType.MicroIntegrator) {
        return <MIConfig formData={props.formData} onFormDataChange={props.onFormDataChange} />;
    } else {
        return <BuildPackConfig formData={props.formData} onFormDataChange={props.onFormDataChange} />;
    }
};
