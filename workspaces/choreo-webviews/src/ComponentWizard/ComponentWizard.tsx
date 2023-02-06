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

import { VSCodeTextField, VSCodeTextArea, VSCodeButton, VSCodeDropdown, VSCodeOption, VSCodeProgressRing, VSCodeLink, VSCodePanelView, VSCodePanels } from "@vscode/webview-ui-toolkit/react";
import styled from "@emotion/styled";
import { useContext, useEffect, useState } from "react";
import { SignIn } from "../SignIn/SignIn";
import { ChoreoWebViewContext } from "../context/choreo-web-view-ctx";
import { ProjectSelector } from "../ProjectSelector/ProjectSelector";
import { ComponentTypeSelector } from "./ComponetTypeSelector/ComponentTypeSelector";
import { ChoreoWebViewAPI } from "../utilities/WebViewRpc";
import { ChoreoServiceComponentType, ComponentAccessibility } from "@wso2-enterprise/choreo-core";
import { GithubRepoSelector } from "../GithubRepoSelector/GithubRepoSelector";
import { GithubRepoBranchSelector } from "../GithubRepoBranchSelector/GithubRepoBranchSelector";

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

export function ComponentWizard() {
    const { loginStatus, loginStatusPending, isChoreoProject, choreoProject, selectedOrg } = useContext(ChoreoWebViewContext);

    const [name, setName] = useState<string>('');
    const [inProgress, setProgressStatus] = useState<boolean>(false);
    const [projectId, setProjectId] = useState<string | undefined>(choreoProject?.id);
    const [description, setDescription] = useState<string | undefined>('');
    const [accessibility, setAccessibility] = useState<ComponentAccessibility>('external');
    const [selectedType, setSelectedType] = useState<ChoreoServiceComponentType>(ChoreoServiceComponentType.REST_API);
    const [repository, setRepository] = useState<string>('');
    const [showRepoSelector, setShowRepoSelector] = useState<boolean>(false);
    const [selectedBranch, setSelectedBranch] = useState<string>('');
    const [folderName, setFolderName] = useState<string>(name);

    useEffect(() => {
        if (isChoreoProject && choreoProject) {
            ChoreoWebViewAPI.getInstance().getProjectRepository(choreoProject?.id).then((repo: any) => {
                if (repo) {
                    setRepository(repo);
                }
            });
        }
    }, [isChoreoProject, choreoProject]);

    useEffect(() => {
        if (name) {
            setFolderName(name);
        }
    }, [name]);

    useEffect(() => {
        if (isChoreoProject && choreoProject) {
            setProjectId(choreoProject?.id);
        }
    }, [isChoreoProject, choreoProject]);

    const canCreateComponent = name && projectId && accessibility && selectedType && selectedOrg && selectedBranch && folderName;

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
            }).then(() => {
                setProgressStatus(false);
                closeWebView();
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
                        onInput={(e: any) => setName(e.target.value)}
                        value={name}
                    >
                        Component Name
                    </VSCodeTextField>
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

                    <VSCodePanels>
                        <VSCodePanelView title="Repository Configuration">
                            <RepoInfoContainer>
                                <label htmlFor="repository">Selected Repository</label>
                                <VSCodeTextField id="repository" value={repository} readOnly={!showRepoSelector} />
                                <VSCodeLink onClick={() => setShowRepoSelector(!showRepoSelector)}>{showRepoSelector ? 'Hide Repositories' : 'Show Repositories'}</VSCodeLink>
                                {showRepoSelector && <GithubRepoSelector onRepoSelect={handleRepoSelection} />}
                                <GithubRepoBranchSelector repository={repository} onBranchSelected={setSelectedBranch} />
                                <VSCodeTextField
                                    placeholder="subfolder"
                                    onInput={(e: any) => setFolderName(e.target.value)}
                                    value={folderName}
                                >
                                    Sub Folder
                                </VSCodeTextField>
                            </RepoInfoContainer>
                        </VSCodePanelView>
                    </VSCodePanels>

                    <ActionContainer>
                        <VSCodeButton
                            appearance="secondary"
                            onClick={closeWebView}
                        >
                            Cancel
                        </VSCodeButton>
                        <VSCodeButton
                            appearance="primary"
                            disabled={!canCreateComponent}
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
