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
import React, { useEffect } from "react";
import styled from "@emotion/styled";

import { cx } from "@emotion/css";
import { VSCodeTextField } from "@vscode/webview-ui-toolkit/react";
import { useContext, useState } from "react";
import { ErrorBanner, ErrorIcon } from "../../Commons/ErrorBanner";
import { RequiredFormInput } from "../../Commons/RequiredInput";
import { ChoreoWebViewContext } from "../../context/choreo-web-view-ctx";
import { ChoreoWebViewAPI } from "../../utilities/WebViewRpc";
import { ComponentWizardState } from "../types";
import debounce from "lodash.debounce";
import { RepoFileOpenDialogInput } from "../ShowOpenDialogInput/RepoFileOpenDialogInput";

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

    const [dockerFileError, setDockerFileError] = useState<string>("");
    const [isValidationInProgress, setIsValidationInProgress] = useState<boolean>(false);

    const { choreoProject } = useContext(ChoreoWebViewContext);

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

    const validate = async () => {
        setDockerFileError("");
        setIsValidationInProgress(true);
        if (repository?.org && repository?.repo && repository?.branch && choreoProject) {
            const projClient = ChoreoWebViewAPI.getInstance().getProjectClient();
            const repoMetaData = await projClient.getRepoMetadata({
                organization: repository?.org,
                repo:   repository?.repo,
                branch: repository?.branch,
                path: '',
                dockerfile: repository?.dockerFile,
                dockerContextPath: repository?.dockerContext,
                openApiPath: '',
                componentId: ''
            });
            if (!repoMetaData.isDockerfilePathValid) {
                setDockerFileError("There isn't such a Dockerfile in the repository");
            } else if (repoMetaData.isDockerfilePathValid && !repoMetaData.isDockerContextPathValid) {
                setDockerFileError("Provide a valid path for docker context.")
            } else {
                setDockerFileError("");
            }
        } else {
            setDockerFileError("");
        }
        setIsValidationInProgress(false);
    }

    const debouncedValidate = debounce(validate, 500);

    useEffect(() => {
        debouncedValidate();
    }, [repository?.dockerFile, repository?.dockerContext])
    
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
                        onOpen={setDockerFile}
                        canSelectFiles={true}
                        canSelectFolders={false}
                        canSelectMany={false}
                        title="Select Dockerfile"
                        filters={{ "Dockerfile": ["Dockerfile"]}}
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
                        onOpen={setDockerFileCtx}
                        canSelectFiles={false}
                        canSelectFolders={true}
                        canSelectMany={false}
                        title="Select Docker Context"
                        filters={{}}
                    />

                </VSCodeTextField>
            </StepContainer>
            {isValidationInProgress && <div>validating...</div>}
            {dockerFileError && <ErrorBanner errorMsg={dockerFileError} />}
        </div>
    );
};
