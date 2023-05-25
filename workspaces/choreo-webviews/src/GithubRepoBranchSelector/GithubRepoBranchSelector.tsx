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
import React, { useEffect, useState } from "react";
import { ChoreoWebViewAPI } from "../utilities/WebViewRpc";

const GhRepoBranhSelectorContainer = styled.div`
    display  : flex;
    flex-direction: column;
    gap: 5px;
    width: 200px;
`;

export interface GithubRepoBranchSelectorProps {
    repository: string;
    defaultBranch?: string;
    onBranchSelected: (branch: string) => void;
}

export function GithubRepoBranchSelector(props: GithubRepoBranchSelectorProps) {
    const { repository, defaultBranch, onBranchSelected } = props;

    const [updatingBranchList, setUpdatingBranchList] = useState<boolean>(false);
    const [repoBranchList, setRepoBranchList] = useState<string[]>([]);
    const [selectedBranch, setSelectedBranch] = useState<string>('');

    useEffect(() => {
        setUpdatingBranchList(true);
        setSelectedBranch('');
        async function updateBranchList() {
            const repoSplit = repository.split('/');
            if (repository && repoSplit.length === 2) {
                try {
                    const branches = await ChoreoWebViewAPI.getInstance()
                        .getChoreoGithubAppClient()
                        .getRepoBranches(repoSplit[0], repoSplit[1]);
                    setSelectedBranch(branches.length > 0 ? branches[0] : '');
                    setRepoBranchList(branches);
                    setUpdatingBranchList(false);
                } catch (error) {
                    console.error(error);
                }
            }
        }
        updateBranchList();
    }, [repository]);

    useEffect(() => {
        onBranchSelected(selectedBranch);
    }, [onBranchSelected, selectedBranch]);

    const handleBranchChange = (event: any) => {
        const selectedBranch = event.target.value;
        setSelectedBranch(selectedBranch);
    };

    return (
        <GhRepoBranhSelectorContainer>
            <label htmlFor="branch-drop-down">Branch</label>
            {!updatingBranchList && repoBranchList.length > 0 && (
                <VSCodeDropdown id="branch-drop-down" onChange={handleBranchChange}>
                    {repoBranchList.map((branch) => (
                        <VSCodeOption
                            key={branch}
                            value={branch}
                            selected={defaultBranch === branch}
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
