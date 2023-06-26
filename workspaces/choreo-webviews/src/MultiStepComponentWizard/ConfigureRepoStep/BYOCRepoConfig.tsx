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
import React, { useMemo } from "react";
import styled from "@emotion/styled";

import { cx } from "@emotion/css";
import { VSCodeTextField } from "@vscode/webview-ui-toolkit/react";
import { useContext } from "react";
import { ErrorBanner, ErrorIcon } from "../../Commons/ErrorBanner";
import { RequiredFormInput } from "../../Commons/RequiredInput";
import { ChoreoWebViewContext } from "../../context/choreo-web-view-ctx";
import { ChoreoWebViewAPI } from "../../utilities/WebViewRpc";
import { ComponentWizardState } from "../types";
import debounce from "lodash.debounce";
import { RepoFileOpenDialogInput } from "../ShowOpenDialogInput/RepoFileOpenDialogInput";
import { useQuery } from "@tanstack/react-query";

const StepContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    gap: 20px;
`;

export interface BYOCRepoConfigProps {
    formData: Partial<ComponentWizardState>;
    onFormDataChange: (updater: (prevFormData: Partial<ComponentWizardState>) => Partial<ComponentWizardState>) => void;
}

export const BYOCRepoConfig = (props: BYOCRepoConfigProps) => {

    const { repository } = props.formData;

    const { choreoProject } = useContext(ChoreoWebViewContext);

    const { data: localDirectorMetaData, isFetching: fetchingDirectoryMetadata } = useQuery(
        ["getLocalComponentDirMetaData", choreoProject, repository],
        () =>
            ChoreoWebViewAPI.getInstance().getLocalComponentDirMetaData({
                orgName: repository?.org,
                repoName: repository?.repo,
                projectId: choreoProject.id,
                subPath: repository?.subPath,
                dockerFilePath: repository?.dockerFile,
                dockerContextPath: repository?.dockerContext
            }),
    );

    const setDockerFile = (fName: string) => {
        props.onFormDataChange(prevFormData => ({
            ...prevFormData,
            repository: {
                ...prevFormData.repository,
                dockerFile: fName
            }
        }));
    }

    const setDockerFileCtx = (ctxPath: string) => {
        props.onFormDataChange(prevFormData => ({
            ...prevFormData,
            repository: {
                ...prevFormData.repository,
                dockerContext: ctxPath
            }
        }));
    }

    const dockerFileError = useMemo(() => {
        if(localDirectorMetaData){
            if (!localDirectorMetaData.dockerFilePathValid) {
                return "There isn't such a Dockerfile in the repository";
            }
            if (localDirectorMetaData.dockerFilePathValid && !localDirectorMetaData.isDockerContextPathValid) {
                return "Provide a valid path for docker context.";
            }
        }
    }, [repository, localDirectorMetaData]);


    const debouncedSetDockerFile = debounce(setDockerFile, 500);
    const debouncedSetDockerContext = debounce(setDockerFileCtx, 500);
    
    return (
        <div>
            <StepContainer>
                <VSCodeTextField
                    placeholder=""
                    onInput={(e: any) => setDockerFile(e.target.value)}
                    value={repository?.dockerFile}
                >
                    Docker File Path <RequiredFormInput />
                    {dockerFileError && <span slot="end" className={`codicon codicon-error ${cx(ErrorIcon)}`} />}
                    <RepoFileOpenDialogInput
                        label="Browse"
                        repo={`${repository?.org}/${repository?.repo}`}
                        path={repository?.dockerFile}
                        onOpen={debouncedSetDockerFile}
                        canSelectFiles={true}
                        canSelectFolders={false}
                        canSelectMany={false}
                        title="Select Dockerfile"
                        filters={{ "Dockerfile": ['*']}}
                    />
                </VSCodeTextField>
                <VSCodeTextField
                    placeholder=""
                    onInput={(e: any) => setDockerFileCtx(e.target.value)}
                    value={repository?.dockerContext}
                >
                    Docker Context Path
                    {dockerFileError && <span slot="end" className={`codicon codicon-error ${cx(ErrorIcon)}`} />}
                    <RepoFileOpenDialogInput
                        label="Browse"
                        repo={`${repository?.org}/${repository?.repo}`}
                        path={repository?.dockerContext}
                        onOpen={debouncedSetDockerContext}
                        canSelectFiles={false}
                        canSelectFolders={true}
                        canSelectMany={false}
                        title="Select Docker Context"
                        filters={{}}
                    />

                </VSCodeTextField>
            </StepContainer>
            {fetchingDirectoryMetadata && <div style={{ marginTop: "5px" }}>validating paths...</div>}
            {dockerFileError && <ErrorBanner errorMsg={dockerFileError} />}
        </div>
    );
};
