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
import { useEffect, useState } from "react";
import { ChoreoWebViewAPI } from "../../utilities/WebViewRpc";

const GhRepoBranhSelectorContainer = styled.div`
    display  : flex;
    flex-direction: column;
    gap: 5px;
    width: 200px;
`;

export interface GithubRepoBranchSelectorProps {
    repository: string;
    selectedBranch?: string;
    onBranchSelected: (branch: string) => void;
}

export function GithubRepoBranchSelector(props: GithubRepoBranchSelectorProps) {
    const { repository, selectedBranch, onBranchSelected } = props;

    const [updatingBranchList, setUpdatingBranchList] = useState<boolean>(false);
    const [repoBranchList, setRepoBranchList] = useState<string[]>([]);

    useEffect(() => {
        setUpdatingBranchList(true);
        async function updateBranchList() {
            const repoSplit = repository.split('/');
            if (repository && repoSplit.length === 2) {
                try {
                    const branches = await ChoreoWebViewAPI.getInstance()
                        .getChoreoGithubAppClient()
                        .getRepoBranches(repoSplit[0], repoSplit[1]);
                    setRepoBranchList(branches);
                    setUpdatingBranchList(false);
                } catch (error) {
                    console.error(error);
                }
            }
        }
        updateBranchList();
    }, [repository]);

    const handleBranchChange = (event: any) => {
        onBranchSelected(event.target.value);
    };

    return (
        <GhRepoBranhSelectorContainer>
            <label htmlFor="branch-drop-down">Branch</label>
            {!updatingBranchList && repoBranchList.length > 0 && (
                <VSCodeDropdown id="branch-drop-down" value={selectedBranch} onChange={handleBranchChange}>
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
