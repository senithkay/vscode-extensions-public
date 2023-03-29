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

import debounce from "lodash.debounce"

import { cx } from "@emotion/css";
import { VSCodeTextField } from "@vscode/webview-ui-toolkit/react";
import { useContext, useState } from "react";
import { ErrorBanner, ErrorIcon } from "../../Commons/ErrorBanner";
import { RequiredFormInput } from "../../Commons/RequiredInput";
import { ChoreoWebViewContext } from "../../context/choreo-web-view-ctx";
import { ChoreoWebViewAPI } from "../../utilities/WebViewRpc";
import { ComponentWizardState } from "../types";
import { BYOCRepoConfig } from "./BYOCRepoConfig"
import { ChoreoComponentType } from "@wso2-enterprise/choreo-core";

const StepContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    gap: 20px;
`;


export interface RepoStructureConfigProps {
    formData: Partial<ComponentWizardState>;
    onFormDataChange: (updater: (prevFormData: Partial<ComponentWizardState>) => Partial<ComponentWizardState>) => void;
}

export const RepoStructureConfig = (props: RepoStructureConfigProps) => {

    const { name, mode, repository, type } = props.formData;

    const [folderName, setFolderName] = useState<string>(mode === "fromExisting" ? "" : (name || ""));
    const [folderNameError, setFolderNameError] = useState<string>("");
    const [isValidationInProgress, setIsValidationInProgress] = useState<boolean>(false);

    const { choreoProject } = useContext(ChoreoWebViewContext);

    const setSubFolderName = async (fName: string) => {
        setFolderName(fName);
        setFolderNameError("");
        setIsValidationInProgress(true);
        if (mode === "fromExisting" && !type?.startsWith("byoc")) {
            const projClient = ChoreoWebViewAPI.getInstance().getProjectClient();
            const repoMetaData = await projClient.getRepoMetadata({
                organization: repository?.org,
                repo: repository?.repo,
                branch: repository?.branch,
                path: fName,
                dockerfile: '',
                dockerContextPath: '',
                openApiPath: '',
                componentId: ''
            });
            if (!repoMetaData.isSubPathValid) {
                setFolderNameError("There isn't such a folder in the repository");
            } else if (repoMetaData.isSubPathValid && !repoMetaData.hasBallerinaTomlInPath) {
                setFolderNameError("Provide a path that contains a Ballerina project.")
            } else {
                setFolderNameError("");
            }
        } else if (mode === "fromExisting" && type?.startsWith("byoc")) {

        } else if (mode === "fromScratch") {
            if (repository?.org && repository.repo && choreoProject) {
                const isSubpathAvailable = await ChoreoWebViewAPI.getInstance().isSubpathAvailable({
                    orgName: repository.org,
                    repoName: repository.repo,
                    subpath: fName,
                    projectID: choreoProject?.id
                });
                if (!isSubpathAvailable) {
                    setFolderNameError("The folder name is already in use in the repository");
                } else {
                    setFolderNameError("");
                }
            } 
        } else {
            setFolderNameError("");
        }
        setIsValidationInProgress(false);
    }

    const updateSubFolderName = debounce(setSubFolderName, 500);

    const isExistingBallerinaMode = mode === "fromExisting" && (
             type === ChoreoComponentType.Service
            || type === ChoreoComponentType.ScheduledTask
            || type === ChoreoComponentType.ManualTrigger
            || type === ChoreoComponentType.RestApi
            || type === ChoreoComponentType.Webhook
            || type === ChoreoComponentType.GraphQL
    );

    const isExistingDockerMode = mode === "fromExisting" && (
            type === ChoreoComponentType.ByocService
        || type === ChoreoComponentType.ByocCronjob
        || type === ChoreoComponentType.ByocJob
    );
    
    return (
        <div>
            {mode === "fromScratch" && (
                <StepContainer>
                    <VSCodeTextField
                        placeholder="Sub folder"
                        onInput={(e: any) => updateSubFolderName(e.target.value)}
                        value={folderName}
                    >
                        Sub Folder <RequiredFormInput />
                        {folderNameError && <span slot="end" className={`codicon codicon-error ${cx(ErrorIcon)}`} />}
                    </VSCodeTextField>
                </StepContainer>
            )}
            {isExistingBallerinaMode &&(
                <StepContainer>
                    <VSCodeTextField
                        placeholder=""
                        onInput={(e: any) => updateSubFolderName(e.target.value)}
                        value={folderName}
                    >
                        Ballerina Package Path <RequiredFormInput />
                        {folderNameError && <span slot="end" className={`codicon codicon-error ${cx(ErrorIcon)}`} />}
                    </VSCodeTextField>
                </StepContainer>
            )}

            {isValidationInProgress && <div>validating...</div>}
            {folderNameError && <ErrorBanner errorMsg={folderNameError} />}
            {isExistingDockerMode &&(
                <BYOCRepoConfig formData={props.formData} onFormDataChange={props.onFormDataChange} />
             )}
        </div>
    );
};
