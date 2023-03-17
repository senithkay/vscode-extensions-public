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
import styled from "@emotion/styled";
import { cx } from "@emotion/css";
import { VSCodeTextField } from "@vscode/webview-ui-toolkit/react";
import { useCallback, useContext, useState } from "react";
import { ErrorBanner, ErrorIcon } from "../../Commons/ErrorBanner";
import { RequiredFormInput } from "../../Commons/RequiredInput";
import { ChoreoWebViewContext } from "../../context/choreo-web-view-ctx";
import { ChoreoWebViewAPI } from "../../utilities/WebViewRpc";
import { ComponentWizardState } from "../types";

const StepContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    gap: 20px;
`;


export interface RepoStructureConfigProps {
    formData: Partial<ComponentWizardState>;
    onFormDataChange: (formData: Partial<ComponentWizardState>) => void;
}

export const RepoStructureConfig = (props: RepoStructureConfigProps) => {

    const { name, mode, repository, type } = props.formData;

    const [folderName, setFolderName] = useState<string>(name || "");
    const [folderNameError, setFolderNameError] = useState<string>("");

    const { choreoProject } = useContext(ChoreoWebViewContext);

    const setSubFolderName = useCallback(async (fName: string) => {
        setFolderName(fName);
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
        } else {
            setFolderNameError("");
        }
    }, [choreoProject, repository]);
    
    return (
        <div>
            {mode === "fromScratch" && (
                <StepContainer>
                    <VSCodeTextField
                        placeholder="Sub folder"
                        onInput={(e: any) => setSubFolderName(e.target.value)}
                        value={folderName}
                    >
                        Sub Folder <RequiredFormInput />
                        {folderNameError && <span slot="end" className={`codicon codicon-error ${cx(ErrorIcon)}`} />}
                    </VSCodeTextField>
                </StepContainer>
            )}
            {folderNameError && <ErrorBanner errorMsg={folderNameError} />}
            {mode === "fromExisting" && type === "Ballerina Package" &&(
                <StepContainer>
                    <VSCodeTextField
                        placeholder=""
                        onInput={(e: any) => setSubFolderName(e.target.value)}
                        value={folderName}
                    >
                        Ballerina Package Path <RequiredFormInput />
                        {folderNameError && <span slot="end" className={`codicon codicon-error ${cx(ErrorIcon)}`} />}
                    </VSCodeTextField>
                </StepContainer>
            )}
            {mode === "fromExisting" && type === "Dockerfile" &&(
                <StepContainer>
                    <VSCodeTextField
                        placeholder=""
                        onInput={(e: any) => setSubFolderName(e.target.value)}
                        value={folderName}
                    >
                        Docker File Path <RequiredFormInput />
                        {folderNameError && <span slot="end" className={`codicon codicon-error ${cx(ErrorIcon)}`} />}
                    </VSCodeTextField>
                    <VSCodeTextField
                        placeholder=""
                        onInput={(e: any) => setSubFolderName(e.target.value)}
                        value={"/"}
                    >
                        Docker Context Path <RequiredFormInput />
                        {folderNameError && <span slot="end" className={`codicon codicon-error ${cx(ErrorIcon)}`} />}
                    </VSCodeTextField>
                </StepContainer>
             )}
        </div>
    );
};
