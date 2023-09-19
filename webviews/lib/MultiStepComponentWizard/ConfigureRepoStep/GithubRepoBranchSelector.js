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
import { VSCodeDropdown, VSCodeLink, VSCodeOption, VSCodeProgressRing } from "@vscode/webview-ui-toolkit/react";
import { ChoreoWebViewAPI } from "../../utilities/WebViewRpc";
import { useQuery } from "@tanstack/react-query";
import { useChoreoWebViewContext } from "../../context/choreo-web-view-ctx";
const GhRepoBranhSelectorContainer = styled.div `
    display  : flex;
    flex-direction: column;
    gap: 5px;
    width: 200px;
`;
const BranchListContainer = styled.div `
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    gap: 20px;
`;
const SmallProgressRing = styled(VSCodeProgressRing) `
    height: calc(var(--design-unit) * 4px);
    width: calc(var(--design-unit) * 4px);
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
export function GithubRepoBranchSelector(props) {
    const { formData, onFormDataChange } = props;
    const { currentProjectOrg } = useChoreoWebViewContext();
    const { org, repo, branch, credentialID } = (formData === null || formData === void 0 ? void 0 : formData.repository) || {};
    const repoId = `${org}/${repo}`;
    const { isLoading: updatingBranchList, data: repoBranches, refetch, isRefetching: isRefetchingBranches } = useQuery(['branchData', repoId, org, repo], () => __awaiter(this, void 0, void 0, function* () {
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
        enabled: !!org && !!repo,
        onSuccess: (repoBranches) => {
            if (repoBranches) {
                const defaultBranch = getDefaultBranch(repoBranches, branch);
                onFormDataChange((prevFormData) => (Object.assign(Object.assign({}, prevFormData), { repository: Object.assign(Object.assign({}, prevFormData.repository), { branch: defaultBranch }) })));
            }
        }
    });
    const handleBranchChange = (event) => {
        onFormDataChange(prevFormData => (Object.assign(Object.assign({}, prevFormData), { repository: Object.assign(Object.assign({}, prevFormData.repository), { branch: event.target.value }) })));
    };
    return (React.createElement(GhRepoBranhSelectorContainer, null,
        React.createElement("label", { htmlFor: "branch-drop-down" }, "Branch"),
        !updatingBranchList && repoBranches && repoBranches.length > 0 && (React.createElement(React.Fragment, null,
            React.createElement(BranchListContainer, null,
                React.createElement(VSCodeDropdown, { id: "branch-drop-down", value: branch, onChange: handleBranchChange }, repoBranches.map((branch) => (React.createElement(VSCodeOption, { key: branch, value: branch }, branch)))),
                !isRefetchingBranches && React.createElement(VSCodeLink, { onClick: () => refetch() }, "Refresh"),
                isRefetchingBranches && React.createElement(SmallProgressRing, null)))),
        updatingBranchList && org && repo && React.createElement("span", null, "Updating branch list...")));
}
//# sourceMappingURL=GithubRepoBranchSelector.js.map