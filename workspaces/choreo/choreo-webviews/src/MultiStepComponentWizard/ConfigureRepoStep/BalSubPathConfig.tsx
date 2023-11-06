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
import React, { useEffect, useState } from "react";

import { useContext } from "react";
import { ChoreoWebViewContext } from "../../context/choreo-web-view-ctx";
import { ChoreoWebViewAPI } from "../../utilities/WebViewRpc";
import { ComponentWizardState } from "../types";
import { ChoreoImplementationType } from "@wso2-enterprise/choreo-core";
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

export const BalSubPathConfig = (props: RepoStructureConfigProps) => {

    const { repository, implementationType } = props.formData;
    const { choreoProject } = useContext(ChoreoWebViewContext);
    const [folderNameError, setFolderNameError] = useState("");

    const { data: localDirectorMetaData, isFetching: fetchingDirectoryMetadata } = useQuery(
        ["getLocalComponentDirMetaData", choreoProject, repository],
        () =>
            ChoreoWebViewAPI.getInstance().getLocalComponentDirMetaData({
                orgName: repository?.org ?? "",
                repoName: repository?.repo ?? "",
                projectId: choreoProject?.id ?? "",
                subPath: repository?.subPath ?? "",
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

    useEffect(() => {
        const updateFolderError = () => {
            let folderError = "";
            if (localDirectorMetaData) {
                if (repository?.subPath) {
                    if (!localDirectorMetaData?.isSubPathValid) {
                        folderError = 'Sub path does not exist';
                    }
                    if (localDirectorMetaData?.isSubPathEmpty) {
                        folderError = "Please provide a path that is not empty"
                    }
                    if (implementationType === ChoreoImplementationType.Ballerina && !localDirectorMetaData?.hasBallerinaTomlInPath) {
                        folderError = "Please provide a path that contains a Ballerina project."
                    }
                } else if (implementationType === ChoreoImplementationType.Ballerina && !localDirectorMetaData?.hasBallerinaTomlInRoot) {
                    folderError = "Repository root does not contain a valid Ballerina project"
                }
            }

            setFolderNameError(folderError);
        };

        updateFolderError();
    }, [repository?.subPath, localDirectorMetaData]);

    useEffect(() => {
        const isDirectoryValid = !folderNameError;
        props.onFormDataChange(prevFormData => ({ ...prevFormData, repository: { ...prevFormData.repository, isDirectoryValid } }));
    }, [folderNameError]);
    
    const updateSubFolderName = debounce(setFolderName, 500);

    return (
        <div>
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
                        path={repository?.subPath ?? ""}
                        onOpen={updateSubFolderName}
                        canSelectFiles={false}
                        canSelectFolders={true}
                        canSelectMany={false}
                        title={`Select the directory where your existing code is`}
                        filters={{}}
                    />
                </VSCodeTextField>
            </StepContainer>
            {fetchingDirectoryMetadata && <div style={{ marginTop: "5px" }}>validating paths...</div>}
            {folderNameError && <ErrorBanner errorMsg={folderNameError} />}
        </div>
    );
};
