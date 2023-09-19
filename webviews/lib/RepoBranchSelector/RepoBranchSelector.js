var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
import { useChoreoWebViewContext } from "../context/choreo-web-view-ctx";
const RepoBranchWrapper = styled.div `
    display  : flex;
    flex-direction: column;
    gap: 5px;
`;
const BranchSelectorContainer = styled.div `
    display  : flex;
    flex-direction: row;
    gap: 30px;
`;
const RefreshBtn = styled(VSCodeButton) `
    margin-top: auto;
    padding: 1px;
`;
function getDefaultBranch(branches, branch) {
    if (!branch) {
        if (branches.includes('main')) {
            return 'main';
        }
        else if (branches.includes('master')) {
            return 'master';
        }
        return branches[0];
    }
    return branches.includes(branch) ? branch : getDefaultBranch(branches);
}
export function RepoBranchSelector(props) {
    const { org, repo, branch, onBranchChange, credentialID, setLoadingBranches } = props;
    const { currentProjectOrg } = useChoreoWebViewContext();
    const repoId = `${org}/${repo}`;
    const { isFetching, data: repoBranches, refetch, isRefetching: isRefetchingBranches } = useQuery(['branchData', repoId, org, repo], () => __awaiter(this, void 0, void 0, function* () {
        try {
            return ChoreoWebViewAPI.getInstance()
                .getChoreoGithubAppClient()
                .getRepoBranches(currentProjectOrg === null || currentProjectOrg === void 0 ? void 0 : currentProjectOrg.id, org, repo, credentialID);
        }
        catch (error) {
            ChoreoWebViewAPI.getInstance().showErrorMsg("Error while fetching branches. Please authorize with GitHub.");
            throw error;
        }
    }), {
        enabled: org.length > 0 && repo.length > 0,
        onSuccess: (repoBranches) => {
            if (repoBranches) {
                const defaultBranch = getDefaultBranch(repoBranches, branch);
                onBranchChange(defaultBranch);
            }
        }
    });
    const handleBranchChange = (event) => {
        onBranchChange(event);
    };
    isFetching ? setLoadingBranches(true) : setLoadingBranches(false);
    return (React.createElement(RepoBranchWrapper, null,
        React.createElement("label", { htmlFor: "branch-drop-down" }, "Branch"),
        React.createElement(BranchSelectorContainer, null,
            React.createElement(AutoComplete, { items: repoBranches !== null && repoBranches !== void 0 ? repoBranches : [], selectedItem: branch, onChange: handleBranchChange }),
            React.createElement(RefreshBtn, { appearance: "icon", onClick: () => refetch(), title: "Refresh branch list", disabled: isRefetchingBranches, id: 'refresh-branch-btn' },
                React.createElement(Codicon, { name: "refresh" })))));
}
//# sourceMappingURL=RepoBranchSelector.js.map