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

import { VSCodeTextField } from "@vscode/webview-ui-toolkit/react";
import { ErrorBanner } from "@wso2-enterprise/ui-toolkit";
import { RequiredFormInput } from "../../Commons/RequiredInput";
import { useChoreoWebViewContext } from "../../context/choreo-web-view-ctx";
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

const DirectoryContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    gap: 5px;
`;

export interface MIConfigProps {
    formData: Partial<ComponentWizardState>;
    onFormDataChange: (updater: (prevFormData: Partial<ComponentWizardState>) => Partial<ComponentWizardState>) => void;
}

export const MIConfig = (props: MIConfigProps) => {

    const { formData, onFormDataChange } = props;

    const { repository } = formData;

    const { choreoProject } = useChoreoWebViewContext();

    const { data: localDirectorMetaData, isFetching: fetchingDirectoryMetadata } = useQuery(
        ["getLocalComponentDirMetaData", choreoProject, repository],
        () =>
            ChoreoWebViewAPI.getInstance().getLocalComponentDirMetaData({
                orgName: repository?.org,
                repoName: repository?.repo,
                projectId: choreoProject.id,
                subPath: repository?.subPath
            }),
    );

    const setFolderName = (fName: string) => {
        onFormDataChange(prevFormData => ({
            ...prevFormData,
            repository: {
                ...prevFormData.repository,
                subPath: fName
            }
        }));
    }
    
    const folderNameError = useMemo(() => {
        if(localDirectorMetaData){
            if (repository?.subPath) {
                if (!localDirectorMetaData.hasPomXmlInPath) {
                    return `Provide a valid path to the Micro Integrator Project.`;
                }
            } else {
                if (!localDirectorMetaData?.hasPomXmlInInRoot) {
                    return "Repository root does not contain a valid Micro Integrator project"
                }
            }
        }
    }, [repository, localDirectorMetaData]);

    const updateSubFolderName = debounce(setFolderName, 500);
    
    return (
        <div>
            <StepContainer>
                <DirectoryContainer>
                    <VSCodeTextField
                        placeholder=""
                        onInput={(e: any) => updateSubFolderName(e.target.value)}
                        value={repository?.subPath}
                    >
                        Project Directory <RequiredFormInput />
                        <RepoFileOpenDialogInput
                            label="Browse"
                            repo={`${repository?.org}/${repository?.repo}`}
                            path={repository?.subPath}
                            onOpen={updateSubFolderName}
                            canSelectFiles={false}
                            canSelectFolders={true}
                            canSelectMany={false}
                            title="Select the directory where your existing code is"
                            filters={{}}
                        />
                    </VSCodeTextField>
                    {folderNameError && <ErrorBanner errorMsg={folderNameError} />}
                </DirectoryContainer>
            </StepContainer>
            {fetchingDirectoryMetadata && <div style={{ marginTop: "5px" }}>validating paths...</div>}
        </div>
    );
};
