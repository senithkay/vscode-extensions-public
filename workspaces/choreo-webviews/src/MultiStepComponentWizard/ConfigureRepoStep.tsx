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
import { cx } from "@emotion/css";
import styled from "@emotion/styled";
import { VSCodeTextField, VSCodeLink, VSCodeProgressRing } from "@vscode/webview-ui-toolkit/react";
import { useCallback, useContext, useEffect, useState } from "react";
import { ErrorIcon, ErrorBanner } from "../Commons/ErrorBanner";
import { Step, StepProps } from "../Commons/MultiStepWizard/types";
import { RequiredFormInput } from "../Commons/RequiredInput";
import { ChoreoWebViewContext } from "../context/choreo-web-view-ctx";
import { GithubRepoBranchSelector } from "../GithubRepoBranchSelector/GithubRepoBranchSelector";
// import { GithubRepoSelector } from "../GithubRepoSelector/GithubRepoSelector";
import { ChoreoWebViewAPI } from "../utilities/WebViewRpc";
import { ComponentWizardState } from "./types";

const StepContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
`;

export const ConfigureRepoStepC = (props: StepProps<Partial<ComponentWizardState>>) => {
    const { formData, onFormDataChange } = props;
    const { org, repo, branch, subPath } = formData?.repository || {};
    
    const [showRepoSelector, setShowRepoSelector] = useState<boolean>(false);
    const { isChoreoProject, choreoProject } = useContext(ChoreoWebViewContext);

    const setRepository = (newOrg: string, newRepo: string) => {
        const repository = { ...formData?.repository, org: newOrg, repo: newRepo };
        onFormDataChange({ repository });
    };

    const setSelectedBranch = useCallback((newBranch: string) => {
        const repository = { ...formData?.repository, branch: newBranch };
        onFormDataChange({ repository });
    }, [formData?.repository, onFormDataChange]);

    useEffect(() => {
        if (isChoreoProject && choreoProject) {
            ChoreoWebViewAPI.getInstance().getProjectRepository(choreoProject?.id).then((repo: string) => {
                if (repo && repo.split('/').length === 2) {
                    const parts = repo.split('/');
                    setRepository(parts[0], parts[1]);
                }
            });
        }
    }, [isChoreoProject, choreoProject]);

    // useEffect(() => {
    //     if (isChoreoProject && choreoProject) {
    //         ChoreoWebViewAPI.getInstance().getProjectRepository(choreoProject?.id).then((storedRepo: string) => {
    //             if (storedRepo && storedRepo.split('/').length === 2) {
    //                 const [orgName, repoName] = storedRepo.split('/');
    //                 setRepository(orgName, repoName);
    //             } else {
    //                 setShowRepoSelector(true);
    //             }
    //         });
    //     }
    // }, [isChoreoProject, choreoProject, setRepository]);
    const showSelectedRepo = (org && repo && !showRepoSelector);

    const seletedRepoC = (
        <>
            <label htmlFor="repository">Repository <RequiredFormInput /></label>
            <VSCodeTextField id="repository" value={`${org}/${repo}`} readOnly={true} />
            <VSCodeLink onClick={() => setShowRepoSelector(true)}>
                Change
            </VSCodeLink>
        </>
    )

    return (
        <StepContainer>
            {/* {showSelectedRepo && seletedRepoC} */}
            {/* {showSelectedRepo &&
                <VSCodeTextField id="repository" value={`${org}/${repo}`} readOnly={true} />                            
            }
            {!showRepoSelector &&
                <VSCodeLink onClick={() => setShowRepoSelector(true)}>
                    Change
                </VSCodeLink>
            } */}
            {/* {(!(org && repo) || showRepoSelector)
                && <GithubRepoSelector onRepoSelect={setRepository} />
            } */}
            {/* <GithubRepoBranchSelector repository={`${org}/${repo}`} onBranchSelected={setSelectedBranch} /> */}
            
            {/* {(repository && !isRepoCloned) &&
                <>
                    Selected Repository is not available locally in Project folder. Clone the repository to continue.
                    {!isCloneInProgress &&
                        <VSCodeLink onClick={handleRepoClone}>
                            Clone Repository
                        </VSCodeLink>
                    }
                    {isCloneInProgress && 
                        <>
                            <span>Cloning Repository...</span>
                            <VSCodeProgressRing />
                        </>
                    }
                </>
            }
            <VSCodeTextField
                placeholder="Sub folder"
                onInput={(e: any) => setSubFolderName(e.target.value)}
                value={folderName}
            >
                Sub Folder <RequiredFormInput />
                {folderNameError && <span slot="end" className={`codicon codicon-error ${cx(ErrorIcon)}`} />}
            </VSCodeTextField>
            {folderNameError && <ErrorBanner errorMsg={folderNameError} />} */}
        </StepContainer>
    );
};

export const ConfigureRepoStep: Step<Partial<ComponentWizardState>> = {
    title: 'Configure Repository',
    component: ConfigureRepoStepC,
    validationRules: []
};

