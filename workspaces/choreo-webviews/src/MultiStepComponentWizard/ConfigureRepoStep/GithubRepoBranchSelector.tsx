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
import React from "react";

import styled from "@emotion/styled";
import { VSCodeDropdown, VSCodeLink, VSCodeOption } from "@vscode/webview-ui-toolkit/react";
import { useEffect } from "react";
import { ChoreoWebViewAPI } from "../../utilities/WebViewRpc";
import { ComponentWizardState } from "../types";
import { useQuery } from "@tanstack/react-query";

const GhRepoBranhSelectorContainer = styled.div`
    display  : flex;
    flex-direction: column;
    gap: 5px;
    width: 200px;
`;

const BranchListContainer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    gap: 20px;
`

function getDefaultBranch(branches: string[], branch?: string): string {
    if (!branch) {
        if (branches.includes('main')) {
            return 'main';
        } else if (branches.includes('master')) {
            return 'master';
        }
        return branches[0];
    }
    return branches.includes(branch) ? branch : getDefaultBranch(branches);
}

export interface GithubRepoBranchSelectorProps {
    formData: Partial<ComponentWizardState>;
    onFormDataChange: (updater: (prevFormData: Partial<ComponentWizardState>) => Partial<ComponentWizardState>) => void;
}

export function GithubRepoBranchSelector(props: GithubRepoBranchSelectorProps) {
    const { formData, onFormDataChange } = props;
    const { org, repo, branch } = formData?.repository || {};
    const repoId = `${org}/${repo}`;

    const {isLoading: updatingBranchList, data: repoBranches, refetch } = useQuery({
        queryKey: [`branchData-${repoId}`], 
        queryFn: async () => {
            try {
                return ChoreoWebViewAPI.getInstance()
                .getChoreoGithubAppClient()
                .getRepoBranches(org, repo);
            } catch (error: any) {
                ChoreoWebViewAPI.getInstance().showErrorMsg("Error while fetching branches. Please authorize with GitHub.");
                throw error;
            }
        }
    });

    useEffect(() => {
        if (repoBranches) {
            const defaultBranch = getDefaultBranch(repoBranches, branch);
            onFormDataChange((prevFormData) => ({
                ...prevFormData,
                repository: { ...prevFormData.repository, branch: defaultBranch }
            }));
        }
    }, [repoBranches]);

    const handleBranchChange = (event: any) => {
        onFormDataChange(prevFormData => ({ ...prevFormData, repository: { ...prevFormData.repository, branch: event.target.value } }));
    };

    return (
        <GhRepoBranhSelectorContainer>
            <label htmlFor="branch-drop-down">Branch</label>
            {!updatingBranchList && repoBranches && repoBranches.length > 0 && (
                <BranchListContainer>
                    <VSCodeDropdown id="branch-drop-down" value={branch} onChange={handleBranchChange}>
                        {repoBranches.map((branch) => (
                            <VSCodeOption
                                key={branch}
                                value={branch}
                            >
                                {branch}
                            </VSCodeOption>
                        ))}
                    </VSCodeDropdown>
                    <VSCodeLink onClick={() => refetch()}>Refresh</VSCodeLink>
                </BranchListContainer>
            )}
            {updatingBranchList && <span>Updating branch list...</span>}
        </GhRepoBranhSelectorContainer>
    );
}
