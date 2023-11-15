/*
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React from "react";
import styled from "@emotion/styled";

import { VSCodeTextField, VSCodeCheckbox } from "@vscode/webview-ui-toolkit/react";
import { ErrorBanner } from "@wso2-enterprise/ui-toolkit";
import { RequiredFormInput } from "../../Commons/RequiredInput";
import { ComponentWizardState } from "../types";
import debounce from "lodash.debounce";
import { RepoFileOpenDialogInput } from "../ShowOpenDialogInput/RepoFileOpenDialogInput";

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

    const setFolderName = (fName: string) => {
        onFormDataChange(prevFormData => ({
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
                    {repository.directoryPathError && <ErrorBanner errorMsg={repository.directoryPathError} />}
                </DirectoryContainer>
                {repository.directoryPathError && <ErrorBanner errorMsg={repository.directoryPathError} />}
                {repository?.subPath && !repository.selectedDirectoryMetadata?.isSubPathValid && (
                    <VSCodeCheckbox checked={repository.createNewDir} onChange={onCreateNewDirChange} id="init-component-dir">
                        Initialize <b>{repository?.subPath}</b> as a new directory
                    </VSCodeCheckbox>
                )}
            </StepContainer>
        </div>
    );
};
