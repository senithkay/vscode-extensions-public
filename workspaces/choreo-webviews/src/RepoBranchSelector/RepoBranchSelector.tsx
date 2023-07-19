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
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { useQuery } from "@tanstack/react-query";
import { ChoreoWebViewAPI } from "../utilities/WebViewRpc";
import { AutoComplete } from "@wso2-enterprise/ui-toolkit";
import { Codicon } from "../Codicon/Codicon";
import { useOrgOfCurrentProject } from "../hooks/use-org-of-current-project";

const RepoBranchWrapper = styled.div`
    display  : flex;
    flex-direction: column;
    gap: 5px;
`;

const BranchSelectorContainer = styled.div`
    display  : flex;
    flex-direction: row;
    gap: 30px;
`;

const RefreshBtn = styled(VSCodeButton)`
    margin-top: auto;
    padding: 1px;
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

export interface RepoBranchSelectorProps {
    org: string;
    repo: string;
    branch: string;
    onBranchChange: (branch: string) => void;
    credentialID: string;
    setLoadingBranches: (loading: boolean) => void;
}

export function RepoBranchSelector(props: RepoBranchSelectorProps) {
    const { org, repo, branch, onBranchChange, credentialID, setLoadingBranches } = props;
    const { currentProjectOrg } = useOrgOfCurrentProject();
    const repoId = `${org}/${repo}`;

    const { isFetching, data: repoBranches, refetch, isRefetching: isRefetchingBranches } = useQuery(
        ['branchData', repoId, org, repo],
        async () => {
            try {
                return ChoreoWebViewAPI.getInstance()
                    .getChoreoGithubAppClient()
                    .getRepoBranches(currentProjectOrg?.id, org, repo, credentialID);
            } catch (error: any) {
                ChoreoWebViewAPI.getInstance().showErrorMsg("Error while fetching branches. Please authorize with GitHub.");
                throw error;
            }
        },
        {
            enabled: org.length>0 && repo.length>0,
            onSuccess: (repoBranches) => {
                if (repoBranches) {
                    const defaultBranch = getDefaultBranch(repoBranches, branch);
                    onBranchChange(defaultBranch);
                }
            }
        }
    );

    const handleBranchChange = (event: any) => {
        onBranchChange(event);
    };

    isFetching ? setLoadingBranches(true) : setLoadingBranches(false);

    return (
        <RepoBranchWrapper>
            <label htmlFor="branch-drop-down">Branch</label>
            <BranchSelectorContainer>
                <AutoComplete items={repoBranches ?? []} selectedItem={branch} onChange={handleBranchChange}></AutoComplete>
                <RefreshBtn
                    appearance="icon"
                    onClick={() => refetch()}
                    title="Refresh branch list"
                    disabled={isRefetchingBranches}
                    id='refresh-branch-btn'
                >
                    <Codicon name="refresh" />
                </RefreshBtn>
            </BranchSelectorContainer>
        </RepoBranchWrapper>

    );
}
