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
import styled from "@emotion/styled";

import { VSCodeTextField } from "@vscode/webview-ui-toolkit/react";
import { ComponentWizardState } from "../types";
import { RepoFileOpenDialogInput } from "../ShowOpenDialogInput/RepoFileOpenDialogInput";
import { ChoreoBuildPackNames, ChoreoImplementationType, WebAppSPATypes } from "@wso2-enterprise/choreo-core";
import { ErrorBanner } from "@wso2-enterprise/ui-toolkit";
import { TextField } from "@wso2-enterprise/ui-toolkit";

const StepContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    gap: 20px;
`;

const MarginTopWrap = styled.div`
    margin-top: 20px
`;

export interface WebAppRepoConfigProps {
    formData: Partial<ComponentWizardState>;
    onFormDataChange: (updater: (prevFormData: Partial<ComponentWizardState>) => Partial<ComponentWizardState>) => void;
    webAppConfigError?: string;
}

export const WebAppRepoConfig = (props: WebAppRepoConfigProps) => {
    const { webAppConfig, repository, implementationType } = props.formData;

    const setBuildCtxPath = (ctxPath: string) => {
        props.onFormDataChange(prevFormData => ({
            ...prevFormData,
            webAppConfig:{ ...prevFormData.webAppConfig, dockerContext: ctxPath }
        }));
    }

    const setBuildCommand = (buildCmd: string) => {
        props.onFormDataChange(prevFormData => ({
            ...prevFormData,
            webAppConfig:{...prevFormData.webAppConfig, webAppBuildCommand: buildCmd }
        }));
    }

    const setBuildOutputDirectory = (outputDir: string) => {
        props.onFormDataChange(prevFormData => ({
            ...prevFormData,
            webAppConfig:{ ...prevFormData.webAppConfig, webAppOutputDirectory: outputDir }
        }));
    }

    const setNodeVersion = (nodeVersion: string) => {
        props.onFormDataChange(prevFormData => ({
            ...prevFormData,
            webAppConfig:{ ...prevFormData.webAppConfig, webAppPackageManagerVersion: nodeVersion }
        }));
    }

    const setPortValue = (port: string) => {
        props.onFormDataChange(prevFormData => ({ ...prevFormData, port }));
    };

    return (
        <div>
            <StepContainer>
                {implementationType && WebAppSPATypes.includes(implementationType as ChoreoBuildPackNames) && (
                    <>
                        <VSCodeTextField
                            placeholder=""
                            onInput={(e: any) => setBuildCtxPath(e.target.value)}
                            value={webAppConfig?.dockerContext ?? ''}
                        >
                            Build Context Path
                            <RepoFileOpenDialogInput
                                label="Browse"
                                repo={`${repository?.org}/${repository?.repo}`}
                                path={webAppConfig?.dockerContext ?? ''}
                                onOpen={setBuildCtxPath}
                                canSelectFiles={false}
                                canSelectFolders={true}
                                canSelectMany={false}
                                title="Select Build Context"
                                filters={{}}
                            />
                        </VSCodeTextField>
                        <TextField
                            value={props.formData.webAppConfig?.webAppBuildCommand || ''}
                            id='build-command'
                            label="Build Command"
                            placeholder="npm run build"
                            onChange={(text: string) => setBuildCommand(text)}
                            required
                        />
                        <TextField
                            value={props.formData.webAppConfig?.webAppOutputDirectory || ''}
                            id='build-directory'
                            label="Build output directory"
                            placeholder="build"
                            onChange={(text: string) => setBuildOutputDirectory(text)}
                            required
                        />
                        <TextField
                            value={props.formData.webAppConfig?.webAppPackageManagerVersion || ''}
                            id='build-directory'
                            label="Node Version"
                            placeholder="18"
                            onChange={(text: string) => setNodeVersion(text)}
                            required
                        />
                    </>
                )}

                {implementationType === ChoreoImplementationType.StaticFiles && (
                    <VSCodeTextField
                        placeholder=""
                        onInput={(e: any) => setBuildOutputDirectory(e.target.value)}
                        value={webAppConfig?.webAppOutputDirectory ?? ''}
                    >
                        Files Directory
                        <RepoFileOpenDialogInput
                            label="Browse"
                            repo={`${repository?.org}/${repository?.repo}`}
                            path={webAppConfig?.webAppOutputDirectory ?? ''}
                            onOpen={setBuildOutputDirectory}
                            canSelectFiles={false}
                            canSelectFolders={true}
                            canSelectMany={false}
                            title="Select files directory"
                            filters={{}}
                        />
                    </VSCodeTextField>
                )}

                {implementationType === ChoreoImplementationType.Docker && (
                    <MarginTopWrap>
                        <TextField
                            value={props.formData?.port || ''}
                            id='component-port-input'
                            label="Port"
                            placeholder="Port"
                            onChange={(text: string) => setPortValue(text)}
                            required
                        />
                    </MarginTopWrap>
                )}                
            </StepContainer>
            {props.webAppConfigError && <MarginTopWrap>
                    <ErrorBanner errorMsg={props.webAppConfigError} />
                </MarginTopWrap>
            }
        </div>
    );
};
