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
import { VSCodeTextField, VSCodeTextArea, VSCodeButton, VSCodeProgressRing } from "@vscode/webview-ui-toolkit/react";
import styled from "@emotion/styled";
import React, { useEffect, useMemo, useState } from "react";
import { SignIn } from "../SignIn/SignIn";
import { useChoreoWebViewContext } from "../context/choreo-web-view-ctx";
import { ChoreoWebViewAPI } from "../utilities/WebViewRpc";
import { GithubAutherizer } from "../GithubRepoSelector/GithubAutherizer";
import { RequiredFormInput } from "../Commons/RequiredInput";
import { ProviderTypeCard } from "./ProviderTypeCard";
import { ProjectTypeCard } from "./ProjectTypeCard";
import { ConfigureRepoAccordion } from "./ConfigureRepoAccordion";
import { CLONE_COMPONENT_FROM_OVERVIEW_PAGE_EVENT, CREATE_COMPONENT_CANCEL_EVENT, CREATE_PROJECT_FAILURE_EVENT, CREATE_PROJECT_START_EVENT, CREATE_PROJECT_SUCCESS_EVENT, GitProvider, Project } from "@wso2-enterprise/choreo-core";
import { FilteredCredentialData } from "@wso2-enterprise/choreo-client/lib/github/types";
import { BitbucketCredSelector } from "../BitbucketCredSelector/BitbucketCredSelector";
import { AutoComplete } from "@wso2-enterprise/ui-toolkit";
import { ErrorBanner } from "../Commons/ErrorBanner";
import { useQuery } from "@tanstack/react-query";

const WizardContainer = styled.div`
    width: 100%;
    display  : flex;
    flex-direction: column;
    gap: 20px;
    padding: 20px;
`;

const ActionContainer = styled.div`
    display  : flex;
    flex-direction: row;
    justify-content: flex-end;
    gap: 10px;
    padding-bottom: 20px;
`;

const ErrorMessageContainer = styled.div`
    color: var(--vscode-errorForeground);
`;

const CardContainer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    flex-wrap: wrap;
    gap: 20px;
`;

const SubContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-content: space-between;
    gap: 20px;
`;

const SectionWrapper = styled.div`
    // Flex Props
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    position: relative;
    gap: 10px;
    // End Flex Props
    // Sizing Props
    padding: 20px;
    // End Sizing Props
    // Border Props
    border-radius: 10px;
    border-style: solid;
    border-width: 1px;
    border-color: transparent;
    background-color: var(--vscode-welcomePage-tileBackground);
    &.active {
        border-color: var(--vscode-focusBorder);
    }
`;

const TitleWrapper = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 10px;
`;

const OrgContainer = styled.div`
    width: fit-content;
    height: fit-content;
    padding: 5px;
    // Border Props
    border-radius: 5px;
    border-style: solid;
    border-width: 1px;
    border-color: transparent;
    background-color: var(--vscode-welcomePage-tileBackground);
`;

const BrowseBtn = styled(VSCodeButton)`
    width: fit-content;
    padding: 5px;
`;

export interface Region {
    label: string;
    value: string;
}

const REGIONS: Region[] = [{ label: "Cloud Data Plane - US", value: "US" }, { label: "Cloud Data Plane - EU", value: "EU" }];

export function ProjectWizard(props: { orgId: string }) {

    const { orgId } = props;
    const { loginStatus, userInfo, loginStatusPending, error, currentProjectOrg } = useChoreoWebViewContext();


    const selectedOrg = currentProjectOrg || userInfo?.organizations.find(org => org.id.toString() === orgId);

    const [projectName, setProjectName] = useState("");
    const [projectDescription, setProjectDescription] = useState("");
    const [creationInProgress, setCreationInProgress] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [initMonoRepo, setInitMonoRepo] = useState(true);
    const [selectedGHOrgName, setSelectedGHOrgName] = useState("");
    const [selectedGHRepo, setSelectedGHRepo] = useState("");
    const [isBareRepo, setIsBareRepo] = useState(false);
    const [gitProvider, setGitProvider] = useState(undefined);
    const [selectedCredential, setSelectedCredential] = useState<FilteredCredentialData>({ id: '', name: '' });
    const [projectDir, setProjectDir] = useState("");
    const [validationInProgress, setValidationInProgress] = useState(false);
    const [selectedBranch, setSelectedBranch] = useState("");
    const [selectedRegion, setSelectedRegion] = useState("Cloud Data Plane - US");
    
    const { data: projects } = useQuery(
        [selectedOrg],
        async () =>
            await ChoreoWebViewAPI.getInstance().getAllProjects(selectedOrg.id)
    );

    const isProjectNameTaken = useMemo(() => {
        return projects?.some((project) => project.name === projectName)
    }, [projectName, projects]);

    const regionLabels = REGIONS.map(region => region.label);

    useEffect(() => {
        ChoreoWebViewAPI.getInstance().sendTelemetryEvent({
            eventName: CREATE_PROJECT_START_EVENT
        });
    }, []);

    const handleInitiMonoRepoCheckChange = (isMonoRepo: boolean) => {
        setInitMonoRepo(isMonoRepo);
    };

    const handleRegionChange = (region: string) => {
        setSelectedRegion(region);
    };

    const handleCreateProject = async () => {
        setCreationInProgress(true);
        const webviewAPI = ChoreoWebViewAPI.getInstance();
        const projectClient = webviewAPI.getProjectClient();
        const regionValue = REGIONS.find(region => region.label === selectedRegion).value;
        if (selectedOrg) {
            try {
                const repoString = getRepoString();
                const createdProject = await projectClient.createProject({
                    name: projectName,
                    description: projectDescription,
                    orgId: selectedOrg.id,
                    orgHandle: selectedOrg.handle,
                    region: regionValue,
                    repository: initMonoRepo ? repoString : null,
                    credentialId: initMonoRepo ? selectedCredential.id : null,
                    branch: initMonoRepo ? selectedBranch : null,
                });

                handleCloneProject({
                    ...createdProject,
                    repository: selectedGHRepo,
                    gitOrganization: selectedGHOrgName,
                    gitProvider
                });

                ChoreoWebViewAPI.getInstance().sendTelemetryEvent({
                    eventName: CREATE_PROJECT_SUCCESS_EVENT,
                    properties: {
                        name: createdProject?.name,
                    }
                });
                webviewAPI.closeWebView();
            } catch (error: any) {
                ChoreoWebViewAPI.getInstance().sendTelemetryEvent({
                    eventName: CREATE_PROJECT_FAILURE_EVENT,
                    properties: {
                        name: projectName,
                        cause: error.message + " " + error.cause
                    }
                });
                setErrorMsg(error.message + " " + error.cause);
            }
        }
        setCreationInProgress(false);
    };

    const handleCloneProject = (project: Project) => {
        ChoreoWebViewAPI.getInstance().sendTelemetryEvent({
            eventName: CLONE_COMPONENT_FROM_OVERVIEW_PAGE_EVENT,
            properties: {
                project: project?.name
            }
        });
        ChoreoWebViewAPI.getInstance().cloneChoreoProjectWithDir(project, projectDir, true);
    };

    const getRepoString = (): string => {
        if (selectedGHOrgName && selectedGHRepo) {
            if (gitProvider === GitProvider.GITHUB) {
                return `http://github.com/${selectedGHOrgName}/${selectedGHRepo}`;
            } else if (gitProvider === GitProvider.BITBUCKET) {
                return `http://bitbucket.org/${selectedGHOrgName}/${selectedGHRepo}`;
            }
        } else {
            return "";
        }
    }

    const handleProjecDirSelection = async () => {
        const projectDirectory = await ChoreoWebViewAPI.getInstance().askProjectDirPath();
        setProjectDir(projectDirectory);
    }

    const changeGitProvider = (type: GitProvider) => {
        setSelectedGHOrgName('');
        setSelectedGHRepo('');
        setSelectedBranch('');
        if (type === GitProvider.GITHUB) {
            setSelectedCredential({ id: '', name: '' });
        }
        setGitProvider(type);
    }


    const projectNameError = 'Project name is already taken.';
    const isValid: boolean = projectName.length > 0 && !!projectDir && !isProjectNameTaken &&(!initMonoRepo || (!!selectedGHOrgName &&
        !!selectedGHRepo)) && !validationInProgress && !isBareRepo;

    return (
        <>
            {loginStatus !== "LoggedIn" && <SignIn />}
            {!loginStatusPending && loginStatus === "LoggedIn" && (
                <WizardContainer>
                    <TitleWrapper>
                        <h2>New Choreo Project</h2>
                        <OrgContainer>Organization:   {selectedOrg.name}</OrgContainer>
                    </TitleWrapper>
                    <SectionWrapper>
                        <h3>Project Details</h3>
                        <VSCodeTextField
                            autofocus
                            // TODO: Add validation
                            // validate={projectName.length > 0}
                            validationMessage="Project name is required"
                            placeholder="Name"
                            onInput={(e: any) => setProjectName(e.target.value)}
                            value={projectName}
                            id='project-name-input'
                        >
                            Project Name <RequiredFormInput />
                        </VSCodeTextField>
                        {isProjectNameTaken && (
                            <ErrorBanner errorMsg={projectNameError} />
                        )}
                        <VSCodeTextArea
                            placeholder="Description"
                            onInput={(e: any) => setProjectDescription(e.target.value)}
                            value={projectDescription}
                            id='project-description-input'
                        >
                            Project Description
                        </VSCodeTextArea>
                        <span>Region</span>
                        <AutoComplete items={regionLabels} selectedItem={selectedRegion} onChange={handleRegionChange}></AutoComplete>
                        <SubContainer>
                            <CardContainer>
                                <ProjectTypeCard
                                    isMonoRepo={true}
                                    label="Mono Repository"
                                    isCurrentMonoRepo={initMonoRepo}
                                    onChange={handleInitiMonoRepoCheckChange}
                                />
                                <ProjectTypeCard
                                    isMonoRepo={false}
                                    label="Multi Repository"
                                    isCurrentMonoRepo={initMonoRepo}
                                    onChange={handleInitiMonoRepoCheckChange}
                                />
                            </CardContainer>
                        </SubContainer>
                    </SectionWrapper>
                    {initMonoRepo &&
                        (
                            <SectionWrapper>
                                <h3>Git Provider Details</h3>
                                <SubContainer>
                                    <CardContainer>
                                        <ProviderTypeCard
                                            type={GitProvider.GITHUB}
                                            label="GitHub"
                                            currentType={gitProvider}
                                            onChange={changeGitProvider}
                                        />
                                        <ProviderTypeCard
                                            type={GitProvider.BITBUCKET}
                                            label="BitBucket"
                                            currentType={gitProvider}
                                            onChange={changeGitProvider}
                                        />
                                    </CardContainer>
                                </SubContainer>
                                {gitProvider === GitProvider.GITHUB && <GithubAutherizer />}
                                {gitProvider === GitProvider.BITBUCKET && <BitbucketCredSelector org={selectedOrg} selectedCred={selectedCredential} onCredSelect={setSelectedCredential} />}
                            </SectionWrapper>
                        )
                    }
                    {initMonoRepo && gitProvider &&
                        (
                            <SectionWrapper>
                                <ConfigureRepoAccordion
                                    selectedOrg={selectedOrg}
                                    gitProvider={gitProvider}
                                    selectedCredential={selectedCredential}
                                    selectedGHOrgName={selectedGHOrgName}
                                    selectedGHRepo={selectedGHRepo}
                                    setSelectedGHOrgName={setSelectedGHOrgName}
                                    setSelectedGHRepo={setSelectedGHRepo}
                                    isBareRepo={isBareRepo}
                                    setIsBareRepo={setIsBareRepo}
                                    validationInProgress={validationInProgress}
                                    setValidationInProgress={setValidationInProgress}
                                    selectedBranch={selectedBranch}
                                    setSelectedBranch={setSelectedBranch}
                                    setErrorMsg={setErrorMsg}
                                />
                            </SectionWrapper>)
                    }
                    <SectionWrapper>
                        <h3>  Project Location  </h3>
                        <BrowseBtn onClick={handleProjecDirSelection}>
                            Select Directory to Save Project
                        </BrowseBtn>
                        {!!projectDir && <span>{projectDir}</span>}
                        {!projectDir && <span>Please choose a directory for project workspace. {initMonoRepo && <span>The git repositories will be cloned here</span>} </span>}
                    </SectionWrapper>
                    {errorMsg !== "" && <ErrorMessageContainer>{errorMsg}</ErrorMessageContainer>}
                    {error && (
                        <ErrorMessageContainer>
                            {error.message + error.cause}
                        </ErrorMessageContainer>
                    )}
                    <ActionContainer>
                        <VSCodeButton
                            appearance="secondary"
                            onClick={() => {
                                ChoreoWebViewAPI.getInstance().sendTelemetryEvent({
                                    eventName: CREATE_COMPONENT_CANCEL_EVENT
                                });
                                ChoreoWebViewAPI.getInstance().closeWebView();
                            }}
                        >
                            Cancel
                        </VSCodeButton>
                        <VSCodeButton
                            appearance="primary"
                            onClick={handleCreateProject}
                            disabled={creationInProgress || !isValid}
                            id='create-project-btn'
                        >
                            Create
                        </VSCodeButton>
                        {creationInProgress && <VSCodeProgressRing />}
                    </ActionContainer>
                </WizardContainer>
            )}
        </>
    );
}
