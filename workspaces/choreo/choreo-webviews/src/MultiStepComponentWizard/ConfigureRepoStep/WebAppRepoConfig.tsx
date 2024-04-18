/*
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React from "react";
import styled from "@emotion/styled";

import { VSCodeCheckbox, VSCodeTextField } from "@vscode/webview-ui-toolkit/react";
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

    const onCreateNewDirChange = () => {
        props.onFormDataChange(prevFormData => ({
            ...prevFormData,
            repository: { ...prevFormData.repository, createNewDir: !!!prevFormData.repository.createNewDir}
        }));
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
                        {repository.directoryPathError && <ErrorBanner errorMsg={repository.directoryPathError} />}
                        {webAppConfig?.dockerContext && !repository.selectedDirectoryMetadata?.isSubPathValid && (
                            <VSCodeCheckbox checked={repository.createNewDir} onChange={onCreateNewDirChange} id="init-component-dir">
                                Initialize <b>{webAppConfig?.dockerContext}</b> as a new directory
                            </VSCodeCheckbox>
                        )}
                        <TextField
                            value={props.formData.webAppConfig?.webAppBuildCommand || ''}
                            id='build-command'
                            label="Build Command"
                            placeholder="npm run build"
                            onTextChange={(text: string) => setBuildCommand(text)}
                            required
                        />
                        <TextField
                            value={props.formData.webAppConfig?.webAppOutputDirectory || ''}
                            id='build-directory'
                            label="Build output directory"
                            placeholder="build"
                            onTextChange={(text: string) => setBuildOutputDirectory(text)}
                            required
                        />
                        <TextField
                            value={props.formData.webAppConfig?.webAppPackageManagerVersion || ''}
                            id='build--node-version'
                            label="Node Version"
                            placeholder="18"
                            onTextChange={(text: string) => setNodeVersion(text)}
                            required
                        />
                    </>
                )}

                {implementationType === ChoreoImplementationType.StaticFiles && (
                    <>
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
                        {repository.directoryPathError && <ErrorBanner errorMsg={repository.directoryPathError} />}
                        {webAppConfig?.webAppOutputDirectory && !repository.selectedDirectoryMetadata?.isSubPathValid && (
                            <VSCodeCheckbox checked={repository.createNewDir} onChange={onCreateNewDirChange} id="init-component-dir-static-files">
                                Initialize <b>{webAppConfig?.webAppOutputDirectory}</b> as a new directory
                            </VSCodeCheckbox>
                        )}
                    </>
                )}

                {![ChoreoImplementationType.StaticFiles, ...WebAppSPATypes].includes(implementationType as any) && (
                    <TextField
                        value={props.formData?.port || ''}
                        id='component-port-input'
                        label="Port"
                        placeholder="Port"
                        onTextChange={(text: string) => setPortValue(text)}
                        required
                    />
                )}
            </StepContainer>
            {props.webAppConfigError && <MarginTopWrap>
                    <ErrorBanner errorMsg={props.webAppConfigError} />
                </MarginTopWrap>
            }
        </div>
    );
};
