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

import { VSCodeTextField, VSCodeTextArea, VSCodeButton, VSCodeDropdown, VSCodeOption, VSCodeProgressRing, VSCodeLink } from "@vscode/webview-ui-toolkit/react";
import styled from "@emotion/styled";
import { css, cx } from "@emotion/css";
import { useCallback, useContext, useEffect, useState } from "react";
import { SignIn } from "../SignIn/SignIn";
import { ChoreoWebViewContext } from "../context/choreo-web-view-ctx";
import { ProjectSelector } from "../ProjectSelector/ProjectSelector";
import { ComponentTypeSelector } from "./ComponetTypeSelector/ComponentTypeSelector";
import { ChoreoWebViewAPI } from "../utilities/WebViewRpc";
import { ChoreoServiceComponentType, Component, ComponentAccessibility } from "@wso2-enterprise/choreo-core";
import { GithubRepoSelector } from "../GithubRepoSelector/GithubRepoSelector";
import { GithubRepoBranchSelector } from "../GithubRepoBranchSelector/GithubRepoBranchSelector";
import { ErrorBanner } from "../Commons/ErrorBanner";
import { RequiredFormInput } from "../Commons/styles";

const WizardContainer = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 20px;
`;

const ActionContainer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    gap: 10px;
`;

const RepoInfoContainer = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 20px;
`;

const ErrorIcon = css`
    color: var(--vscode-errorForeground);
`;

export function ComponentWizard() {
    const { loginStatus, loginStatusPending, isChoreoProject, choreoProject, selectedOrg } = useContext(ChoreoWebViewContext);

    const [name, setName] = useState<string>('');
    const [isDuplicateName, setIsDuplicateName] = useState<boolean>(false);
    const [inProgress, setProgressStatus] = useState<boolean>(false);
    const [projectId, setProjectId] = useState<string | undefined>(choreoProject?.id);
    const [description, setDescription] = useState<string | undefined>('');
    const [accessibility, setAccessibility] = useState<ComponentAccessibility>('external');
    const [selectedType, setSelectedType] = useState<ChoreoServiceComponentType>(ChoreoServiceComponentType.REST_API);
    const [repository, setRepository] = useState<string>('');
    const [isRepoCloned, setIsRepoCloned] = useState<boolean>(false);
    const [componentNames, setComponentNames] = useState<string[]>([]);
    const [showRepoSelector, setShowRepoSelector] = useState<boolean>(false);
    const [selectedBranch, setSelectedBranch] = useState<string>('');
    const [folderName, setFolderName] = useState<string>(name);
    const [folderNameError, setFolderNameError] = useState<string>("");


    const setSubFolderName = useCallback(async (fName: string) => {
        setFolderName(fName);
        if (repository && projectId) {
            // TODO: Debounce
            const isSubpathAvailable = await ChoreoWebViewAPI.getInstance().isSubpathAvailable({
                orgName: repository.split('/')[0],
                repoName: repository.split('/')[1],
                subpath: fName,
                projectID: projectId
            });
            if (!isSubpathAvailable) {
                setFolderNameError("The folder name is already in use in the repository");
            } else {
                setFolderNameError("");
            }
        } else {
            setFolderNameError("");
        }
    }, [projectId, repository]);

    useEffect(() => {
       const checkRepoCloneStatus = async () => {
            if (projectId && repository) {
                const projectPath = await ChoreoWebViewAPI.getInstance().getProjectLocation(projectId);
                if (projectPath) {
                    const isCloned = await ChoreoWebViewAPI.getInstance().getChoreoProjectManager().isRepoCloned({
                        repository,
                        workspaceFilePath: projectPath,
                    });
                    setIsRepoCloned(isCloned);
                }
            }
        };
        checkRepoCloneStatus();
    }, [selectedBranch, repository, projectId]);

    useEffect(() => {
        if (isChoreoProject && choreoProject) {
            ChoreoWebViewAPI.getInstance().getProjectRepository(choreoProject?.id).then((repo: any) => {
                if (repo) {
                    setRepository(repo);
                } else {
                    setShowRepoSelector(true);
                }
            });
        }
    }, [isChoreoProject, choreoProject]);

    useEffect(() => {
        if (name) {
            setSubFolderName(name);
        }
    }, [name, setSubFolderName]);

    useEffect(() => {
        if (isChoreoProject && choreoProject) {
            setProjectId(choreoProject?.id);
        }
    }, [isChoreoProject, choreoProject]);

    useEffect(() => {
        if (isChoreoProject && choreoProject && projectId) {
            ChoreoWebViewAPI.getInstance().getComponents(projectId).then((components: Component[]) => {
                if (components.length) {
                    setComponentNames(components.map(component => component.displayName.toLowerCase()));
                }
            });
        }
    }, [choreoProject, isChoreoProject, projectId]);

    const setComponentName = (name: string) => {
        setName(name);

        if (componentNames.includes(name.toLowerCase())) {
            setIsDuplicateName(true);
        } else if (isDuplicateName) {
            setIsDuplicateName(false);
        }
    };

    const canCreateComponent = name && !isDuplicateName && !folderNameError && projectId && accessibility && selectedType && selectedOrg && selectedBranch && folderName && isRepoCloned;

    const handleComponentCreation = () => {
        if (canCreateComponent) {
            setProgressStatus(true);
            ChoreoWebViewAPI.getInstance().getChoreoProjectManager().createLocalComponent({
                name: name,
                projectId: projectId,
                org: selectedOrg,
                displayType: selectedType,
                accessibility: accessibility,
                description: description ?? '',
                repositoryInfo: {
                    org: repository.split('/')[0],
                    repo: repository.split('/')[1],
                    branch: selectedBranch,
                    subPath: folderName
                }
            }).then((response: any) => {
                setProgressStatus(false);
                if (response === true) {
                    ChoreoWebViewAPI.getInstance().updateProjectOverview(projectId);
                    closeWebView();
                } else if (response?.message) {
                    throw new Error(response.message);
                }
            }).catch((err: Error) => {
                ChoreoWebViewAPI.getInstance().showErrorMsg(err.message);
            });
        }
    };

    const closeWebView = () => {
        ChoreoWebViewAPI.getInstance().closeWebView();
    };

    const handleRepoSelection = (org?: string, repo?: string) => {
        if (org && repo) {
            setRepository(`${org}/${repo}`);
        }
    };

    return (
        <>
            {loginStatus !== "LoggedIn" && <SignIn />}
            {!loginStatusPending && loginStatus === "LoggedIn" && (
                <WizardContainer>
                    <h2>Create New Choreo Component {(isChoreoProject && choreoProject) ? ` in ${choreoProject?.name} Project` : ''}</h2>
                    {!isChoreoProject && <ProjectSelector currentProject={projectId} setProject={setProjectId} />}
                    <ComponentTypeSelector selectedType={selectedType} onChange={setSelectedType} />
                    <VSCodeTextField
                        autofocus
                        placeholder="Name"
                        onInput={(e: any) => setComponentName(e.target.value)}
                        value={name}
                    >
                        Component Name <RequiredFormInput />
                        {isDuplicateName && <span slot="end" className={`codicon codicon-error ${cx(ErrorIcon)}`} />}
                    </VSCodeTextField>
                    {isDuplicateName && <ErrorBanner errorMsg={`Component ${name} already exists.`} />}

                    <VSCodeTextArea
                        autofocus
                        placeholder="Description"
                        onInput={(e: any) => setDescription(e.target.value)}
                        value={description}
                    >
                        Description
                    </VSCodeTextArea>

                    <label htmlFor="access-mode">Access Mode</label>
                    <VSCodeDropdown id="access-mode" onChange={(e: any) => setAccessibility(e.target.value)}>
                        <VSCodeOption value={'external'}><b>External:</b> API is publicly accessible</VSCodeOption>
                        <VSCodeOption value={'internal'}><b>Internal:</b> API is accessible only within Choreo</VSCodeOption>
                    </VSCodeDropdown>

                    <RepoInfoContainer>
                        <label htmlFor="repository">Repository <RequiredFormInput /></label>
                        {!showRepoSelector &&
                            <VSCodeTextField id="repository" value={repository} readOnly={true} />                            
                        }
                        {!showRepoSelector &&
                            <VSCodeLink onClick={() => setShowRepoSelector(true)}>
                                Change
                            </VSCodeLink>
                        }
                        {(showRepoSelector)
                            && <GithubRepoSelector onRepoSelect={handleRepoSelection} />}
                        <GithubRepoBranchSelector repository={repository} onBranchSelected={setSelectedBranch} />
                        
                        {(repository && !isRepoCloned) &&
                            <>
                                Selected Repository is not available locally in Project folder. Clone the repository to continue.
                                <VSCodeLink onClick={() => {} }>
                                    Clone Repository
                                </VSCodeLink>
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
                        {folderNameError && <ErrorBanner errorMsg={folderNameError} />}
                    </RepoInfoContainer>

                    <ActionContainer>
                        <VSCodeButton
                            appearance="secondary"
                            onClick={closeWebView}
                        >
                            Cancel
                        </VSCodeButton>
                        <VSCodeButton
                            appearance="primary"
                            disabled={!canCreateComponent || inProgress}
                            onClick={handleComponentCreation}
                        >
                            Create
                        </VSCodeButton>
                        {inProgress && <VSCodeProgressRing />}
                    </ActionContainer>
                </WizardContainer>
            )}
        </>
    );
}
