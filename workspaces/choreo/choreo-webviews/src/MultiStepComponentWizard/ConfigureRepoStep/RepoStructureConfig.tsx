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

import { useContext } from "react";
import { ChoreoWebViewContext } from "../../context/choreo-web-view-ctx";
import { ChoreoWebViewAPI } from "../../utilities/WebViewRpc";
import { ComponentWizardState } from "../types";
import { BYOCRepoConfig } from "./BYOCRepoConfig";
import { WebAppRepoConfig } from "./WebAppRepoConfig";
import { BuildPackConfig } from "./BuildPackConfig";
import { MIConfig } from "./MIConfig";
import { ChoreoComponentType, ChoreoImplementationType } from "@wso2-enterprise/choreo-core";
import { useQuery } from "@tanstack/react-query";
import { cx } from "@emotion/css";
import { VSCodeTextField } from "@vscode/webview-ui-toolkit/react";
import { ErrorBanner, ErrorIcon } from "@wso2-enterprise/ui-toolkit";
import debounce from "lodash.debounce";
import { RequiredFormInput } from "../../Commons/RequiredInput";
import { RepoFileOpenDialogInput } from "../ShowOpenDialogInput/RepoFileOpenDialogInput";
import styled from "@emotion/styled";

const StepContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    gap: 20px;
`;

export interface RepoStructureConfigProps {
    formData: Partial<ComponentWizardState>;
    onFormDataChange: (updater: (prevFormData: Partial<ComponentWizardState>) => Partial<ComponentWizardState>) => void;
    formErrors: Record<keyof ComponentWizardState, string>;
}

export const RepoStructureConfig = (props: RepoStructureConfigProps) => {

    const { repository, type, implementationType } = props.formData;
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

    const isBuildPackType = ![ChoreoImplementationType.Ballerina, ChoreoImplementationType.MicroIntegrator, ChoreoImplementationType.Docker].includes(implementationType as ChoreoImplementationType);
    

    const folderNameError = useMemo(() => {
        if(localDirectorMetaData){
            // todo: revisit this!!!
            if (repository?.subPath) {
                if (!localDirectorMetaData?.isSubPathValid) {
                    return 'Sub path does not exist';
                }
                if (localDirectorMetaData?.isSubPathEmpty) {
                    return "Please provide a path that is not empty"
                }
                if (implementationType === ChoreoImplementationType.Ballerina && !localDirectorMetaData?.hasBallerinaTomlInPath) {
                    return "Please provide a path that contains a Ballerina project."
                }
            } else if (implementationType === ChoreoImplementationType.Ballerina && !localDirectorMetaData?.hasBallerinaTomlInRoot) {
                return "Repository root does not contain a valid Ballerina project"
            }
        }
    }, [repository, localDirectorMetaData]);

    const updateSubFolderName = debounce(setFolderName, 500);

    return (
        <div>
            {(implementationType === ChoreoImplementationType.Ballerina) && (
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
                            title={`Select the directory where your existing code is`}
                            filters={{}}
                        />
                    </VSCodeTextField>
                </StepContainer>
            )}
            {fetchingDirectoryMetadata && <div style={{ marginTop: "5px" }}>validating paths...</div>}
            {implementationType === ChoreoImplementationType.Docker && (
                <BYOCRepoConfig formData={props.formData} onFormDataChange={props.onFormDataChange} />
            )}
            {type === ChoreoComponentType.WebApplication && !isBuildPackType && (
                <WebAppRepoConfig 
                    formData={props.formData} 
                    onFormDataChange={props.onFormDataChange} 
                    webAppConfigError={props.formErrors['webAppConfig'] || props.formErrors['port']}
                />
            )}
            {isBuildPackType && (
                <BuildPackConfig formData={props.formData} onFormDataChange={props.onFormDataChange} />
            )}
            {implementationType === ChoreoImplementationType.MicroIntegrator && (
                <MIConfig formData={props.formData} onFormDataChange={props.onFormDataChange} />
            )}
            {folderNameError && <ErrorBanner errorMsg={folderNameError} />}
        </div>
    );
};
