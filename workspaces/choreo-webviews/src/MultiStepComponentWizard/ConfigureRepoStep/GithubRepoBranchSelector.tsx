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

import styled from "@emotion/styled";
import { VSCodeDropdown, VSCodeOption } from "@vscode/webview-ui-toolkit/react";
import { useCallback, useEffect, useState } from "react";
import { ChoreoWebViewAPI } from "../../utilities/WebViewRpc";
import { ComponentWizardState } from "../types";

const GhRepoBranhSelectorContainer = styled.div`
    display  : flex;
    flex-direction: column;
    gap: 5px;
    width: 200px;
`;

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
    onFormDataChange: (formData: Partial<ComponentWizardState>) => void;
}

export function GithubRepoBranchSelector(props: GithubRepoBranchSelectorProps) {
    const { formData, onFormDataChange } = props;
    const { org, repo, branch } = formData?.repository || {};

    const [updatingBranchList, setUpdatingBranchList] = useState<boolean>(false);

    const repoId = `${org}/${repo}`;

    const repoBranchList = formData?.cache?.branches?.get(repoId) || [];

    const refreshBranchList = useCallback(async (forceReload: boolean = false) => {
            setUpdatingBranchList(true);
            const branchesCache: Map<string, string[]> = formData?.cache?.branches || new Map();
            if (org && repo) {
                let repoBranches = branchesCache.get(repoId);
                if (forceReload || !repoBranches || repoBranches.length === 0) {
                    try {
                        repoBranches = await ChoreoWebViewAPI.getInstance()
                            .getChoreoGithubAppClient()
                            .getRepoBranches(org, repo);
                        branchesCache.set(repoId, repoBranches);
                    } catch (error: any) {
                        ChoreoWebViewAPI.getInstance().showErrorMsg(error.message);
                    }
                }
                if (!repoBranches) {
                    return;
                }
                const defaultBranch = getDefaultBranch(repoBranches, branch);
                onFormDataChange({
                    repository: { ...formData.repository, branch: defaultBranch },

                    cache: { 
                        ...formData.cache,
                        branches: branchesCache
                    }
                });
            }
            setUpdatingBranchList(false);
    }, [org, repo, branch]);

    useEffect(() => {
        refreshBranchList();
    }, [org, repo, refreshBranchList]);

    const handleBranchChange = (event: any) => {
        const repository = { ...formData.repository, branch: event.target.value };
        onFormDataChange({ repository });
    };

    return (
        <GhRepoBranhSelectorContainer>
            <label htmlFor="branch-drop-down">Branch</label>
            {!updatingBranchList && repoBranchList.length > 0 && (
                <VSCodeDropdown id="branch-drop-down" value={branch} onChange={handleBranchChange}>
                    {repoBranchList.map((branch) => (
                        <VSCodeOption
                            key={branch}
                            value={branch}
                        >
                            {branch}
                        </VSCodeOption>
                    ))}
                </VSCodeDropdown>
            )}
            {updatingBranchList && <span>Updating branch list...</span>}
        </GhRepoBranhSelectorContainer>
    );
}
