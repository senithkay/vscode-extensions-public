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
import React, { useEffect } from "react";
import styled from "@emotion/styled";

import { VSCodeTextField, VSCodeCheckbox } from "@vscode/webview-ui-toolkit/react";
import { AutoComplete, ErrorBanner, TextField } from "@wso2-enterprise/ui-toolkit";
import { RequiredFormInput } from "../../Commons/RequiredInput";
import { ComponentWizardState } from "../types";
import debounce from "lodash.debounce";
import { RepoFileOpenDialogInput } from "../ShowOpenDialogInput/RepoFileOpenDialogInput";
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

    const selectedBuildPack = formData.buildPackList?.find(item => item.language === formData.implementationType);
    const supportedVersions: string[] = selectedBuildPack?.supportedVersions?.split(',')?.filter(item => !!item);

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
                    {formData.repository.directoryPathError && <ErrorBanner errorMsg={formData.repository.directoryPathError} />}
                    {repository?.subPath && !repository.selectedDirectoryMetadata?.isSubPathValid && (
                        <VSCodeCheckbox checked={repository.createNewDir} onChange={onCreateNewDirChange} id="init-component-dir">
                            Initialize <b>{repository?.subPath}</b> as a new directory
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
        </div>
    );
};
