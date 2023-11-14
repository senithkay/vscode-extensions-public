/*
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React, { useEffect, useState } from "react";
import styled from "@emotion/styled";

import { VSCodeTextField, VSCodeCheckbox } from "@vscode/webview-ui-toolkit/react";
import { AutoComplete, ErrorBanner, TextField } from "@wso2-enterprise/ui-toolkit";
import { RequiredFormInput } from "../../Commons/RequiredInput";
import { useChoreoWebViewContext } from "../../context/choreo-web-view-ctx";
import { ChoreoWebViewAPI } from "../../utilities/WebViewRpc";
import { ComponentWizardState } from "../types";
import debounce from "lodash.debounce";
import { RepoFileOpenDialogInput } from "../ShowOpenDialogInput/RepoFileOpenDialogInput";
import { useQuery } from "@tanstack/react-query";
import { ChoreoComponentType } from "@wso2-enterprise/choreo-core";

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

const MarginTopWrap = styled.div`
    margin-top: 20px
`;

export interface BuildPackConfigProps {
    formData: Partial<ComponentWizardState>;
    onFormDataChange: (updater: (prevFormData: Partial<ComponentWizardState>) => Partial<ComponentWizardState>) => void;
}

export const BuildPackConfig = (props: BuildPackConfigProps) => {

    const { formData, onFormDataChange } = props;

    const { repository, type } = formData;

    const { choreoProject } = useChoreoWebViewContext();

    const [folderNameError, setFolderNameError] = useState("");

    const { data: localDirectorMetaData, isFetching: fetchingDirectoryMetadata } = useQuery(
        ["getLocalComponentDirMetaData", choreoProject, repository],
        () =>
            ChoreoWebViewAPI.getInstance().getLocalComponentDirMetaData({
                orgName: repository?.org,
                repoName: repository?.repo,
                projectId: choreoProject.id,
                subPath: repository?.subPath,
                buildPackId: formData.implementationType
            }),
    );

    const selectedBuildPack = formData.buildPackList?.find(item => item.language === formData.implementationType);
    const supportedVersions: string[] = selectedBuildPack?.supportedVersions?.split(',')?.filter(item => !!item);

    // TODO: Need to remove the useEffect & find a better solution
    useEffect(() => {
        const updateFolderError = () => {
            let folderError = '';
            if (localDirectorMetaData) {
                if (repository?.subPath) {
                    if(!repository.createNewDir) {
                        if (!localDirectorMetaData?.isSubPathValid ) {
                            folderError = 'Sub path does not exist';
                        } else if (!localDirectorMetaData?.isSubPathEmpty && !localDirectorMetaData.isBuildpackPathValid) {
                            folderError = `Provide a valid path to the ${formData.implementationType} Project.`;
                        }
                    }
                } else if (!localDirectorMetaData.isBuildpackPathValid) {
                    folderError = `Provide a valid path to the ${formData.implementationType} Project.`;
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

    const setFolderName = (fName: string) => {
        props.onFormDataChange(prevFormData => ({
            ...prevFormData,
            repository: {
                ...prevFormData.repository,
                subPath: fName
            }
        }));
    }

    const onCreateNewDirChange = () => {
        props.onFormDataChange(prevFormData => ({
            ...prevFormData,
            repository: { ...prevFormData.repository, createNewDir: !!!prevFormData.repository.createNewDir}
        }));
    };

    const handleVersionChange = (version: string) => {
        onFormDataChange(prevFormData => ({
            ...prevFormData,
            selectedBuildPackVersion: version
        }));
    };

    const setPortValue = (port: string) => {
        props.onFormDataChange(prevFormData => ({ ...prevFormData, port }));
    };

    const updateSubFolderName = debounce(setFolderName, 500);

    useEffect(()=>{
        if(supportedVersions?.length > 0 && !supportedVersions.includes(formData.selectedBuildPackVersion)) {
            onFormDataChange(prevFormData => ({
                ...prevFormData,
                selectedBuildPackVersion: supportedVersions[0]
            }));
        }
    },[formData.selectedBuildPackVersion, supportedVersions])
    
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
                    {repository?.subPath && (!localDirectorMetaData?.isSubPathValid || !localDirectorMetaData?.isBuildpackPathValid) && (
                        <VSCodeCheckbox checked={repository.createNewDir} onChange={onCreateNewDirChange}>
                            Initialize an empty component at {repository?.subPath}
                        </VSCodeCheckbox>
                    )}
                </DirectoryContainer>
                {supportedVersions?.length > 0 && (
                    <AutoComplete
                        items={supportedVersions ?? []}
                        selectedItem={formData.selectedBuildPackVersion}
                        onChange={handleVersionChange}
                        id="version-selector"
                    /> 
                )}
                {type === ChoreoComponentType.WebApplication && (
                    <MarginTopWrap>
                        <TextField
                            value={props.formData?.port || ''}
                            id='component-port-input'
                            label="Port"
                            placeholder="Port"
                            onChange={(text: string) => setPortValue(text)}
                            required
                        />
                    </MarginTopWrap>
                )}
            </StepContainer>
            {fetchingDirectoryMetadata && <div style={{ marginTop: "5px" }}>validating paths...</div>}
        </div>
    );
};
