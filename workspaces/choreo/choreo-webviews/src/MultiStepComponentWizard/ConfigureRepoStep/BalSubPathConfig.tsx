/*
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React from "react";

import { ComponentWizardState } from "../types";
import { cx } from "@emotion/css";
import { VSCodeTextField, VSCodeCheckbox } from "@vscode/webview-ui-toolkit/react";
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

    const { repository } = props.formData;   

    const setFolderName = (fName: string) => {
        props.onFormDataChange(prevFormData => ({
            ...prevFormData,
            repository: {
                ...prevFormData.repository,
                subPath: fName
            }
        }));
    };

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
                <VSCodeTextField
                    placeholder=""
                    onInput={(e: any) => updateSubFolderName(e.target.value)}
                    value={repository?.subPath}
                    id="directory-select-input"
                >
                    Directory <RequiredFormInput />
                    {repository.directoryPathError && <span slot="end" className={`codicon codicon-error ${cx(ErrorIcon)}`} />}
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
