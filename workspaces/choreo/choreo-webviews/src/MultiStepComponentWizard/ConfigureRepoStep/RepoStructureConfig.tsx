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

import debounce from "lodash.debounce"

import { cx } from "@emotion/css";
import { VSCodeTextField } from "@vscode/webview-ui-toolkit/react";
import { useContext } from "react";
import { ErrorBanner, ErrorIcon } from "@wso2-enterprise/ui-toolkit";
import { RequiredFormInput } from "../../Commons/RequiredInput";
import { ChoreoWebViewContext } from "../../context/choreo-web-view-ctx";
import { ChoreoWebViewAPI } from "../../utilities/WebViewRpc";
import { ComponentWizardState } from "../types";
import { BYOCRepoConfig } from "./BYOCRepoConfig";
import { WebAppRepoConfig } from "./WebAppRepoConfig";
import { BuildPackConfig } from "./BuildPackConfig";
import { MIConfig } from "./MIConfig";
import { ChoreoComponentType, ChoreoImplementationType } from "@wso2-enterprise/choreo-core";
import { RepoFileOpenDialogInput } from "../ShowOpenDialogInput/RepoFileOpenDialogInput";
import { useQuery } from "@tanstack/react-query";

const StepContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    gap: 20px;
`;

const BUILD_PACK_TYPES = [
    "java",
    "nodejs",
    "python",
    "go",
    "ruby",
    "php"
]

export interface RepoStructureConfigProps {
    formData: Partial<ComponentWizardState>;
    onFormDataChange: (updater: (prevFormData: Partial<ComponentWizardState>) => Partial<ComponentWizardState>) => void;
    formErrors: Record<keyof ComponentWizardState, string>;
}

export const RepoStructureConfig = (props: RepoStructureConfigProps) => {

    const { mode, repository, type, implementationType } = props.formData;
    const { choreoProject } = useContext(ChoreoWebViewContext);

    const { data: localDirectorMetaData, isFetching: fetchingDirectoryMetadata } = useQuery(
        ["getLocalComponentDirMetaData", choreoProject, repository],
        () =>
            ChoreoWebViewAPI.getInstance().getLocalComponentDirMetaData({
                orgName: repository?.org,
                repoName: repository?.repo,
                projectId: choreoProject.id,
                subPath: repository?.subPath,
            }),
            { refetchOnWindowFocus: false }
    );

    const setFolderName = (fName: string) => {
        props.onFormDataChange(prevFormData => ({
            ...prevFormData,
            repository: {
                ...prevFormData.repository,
                subPath: fName
            }
        }));
    };

    const isBuildPackType = BUILD_PACK_TYPES.includes(implementationType);
    

    const folderNameError = useMemo(() => {
        if(localDirectorMetaData){
            if (repository?.subPath) {
                if (mode === 'fromExisting' && !isBuildPackType) {
                    if (!localDirectorMetaData?.isSubPathValid) {
                        return 'Sub path does not exist';
                    }
                    if (localDirectorMetaData?.isSubPathEmpty) {
                        return "Please provide a path that is not empty"
                    }
                    if (implementationType === ChoreoImplementationType.Ballerina && !localDirectorMetaData?.hasBallerinaTomlInPath) {
                        return "Please provide a path that contains a Ballerina project."
                    }
                }
                if (mode === 'fromScratch') {
                    if (!localDirectorMetaData?.isSubPathEmpty) {
                        return "Please provide a path that is empty"
                    }
                }
            } else {
                if (mode === 'fromExisting') {
                    if (implementationType === ChoreoImplementationType.Ballerina && !localDirectorMetaData?.hasBallerinaTomlInRoot) {
                        return "Repository root does not contain a valid Ballerina project"
                    }
                }
            }
        }
    }, [repository, localDirectorMetaData]);

    const updateSubFolderName = debounce(setFolderName, 500);

    return (
        <div>
            {(mode === "fromScratch" || implementationType === ChoreoImplementationType.Ballerina) && (
                <StepContainer>
                    <VSCodeTextField
                        placeholder=""
                        onInput={(e: any) => updateSubFolderName(e.target.value)}
                        value={repository?.subPath}
                        id="directory-select-input"
                    >
                        Directory <RequiredFormInput />
                        {folderNameError && <span slot="end" className={`codicon codicon-error ${cx(ErrorIcon)}`} />}
                        <RepoFileOpenDialogInput
                            label="Browse"
                            repo={`${repository?.org}/${repository?.repo}`}
                            path={repository?.subPath}
                            onOpen={updateSubFolderName}
                            canSelectFiles={false}
                            canSelectFolders={true}
                            canSelectMany={false}
                            title={`Select the directory where your ${mode === "fromExisting" ? "existing code is" : "component will be created"}`}
                            filters={{}}
                        />
                    </VSCodeTextField>
                    {/** TODO: Show a message if folder is already being used */}
                </StepContainer>
            )}
            {fetchingDirectoryMetadata && <div style={{ marginTop: "5px" }}>validating paths...</div>}
            {folderNameError && <ErrorBanner errorMsg={folderNameError} />}
            {mode === "fromExisting" && implementationType === ChoreoImplementationType.Docker && (
                <BYOCRepoConfig formData={props.formData} onFormDataChange={props.onFormDataChange} />
            )}
            {mode === "fromExisting" && type === ChoreoComponentType.WebApplication && !isBuildPackType && (
                <WebAppRepoConfig 
                    formData={props.formData} 
                    onFormDataChange={props.onFormDataChange} 
                    webAppConfigError={props.formErrors['webAppConfig'] || props.formErrors['port']}
                />
            )}
            {mode === "fromExisting" && isBuildPackType && (
                <BuildPackConfig formData={props.formData} onFormDataChange={props.onFormDataChange} />
            )}
            {mode === "fromExisting" && implementationType === ChoreoImplementationType.MicroIntegrator && (
                <MIConfig formData={props.formData} onFormDataChange={props.onFormDataChange} />
            )}
        </div>
    );
};
