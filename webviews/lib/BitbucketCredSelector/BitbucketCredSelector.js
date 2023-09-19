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
import styled from "@emotion/styled";
import { VSCodeButton, VSCodeDropdown, VSCodeLink, VSCodeOption } from "@vscode/webview-ui-toolkit/react";
import React from "react";
import { ChoreoWebViewAPI } from "../utilities/WebViewRpc";
import { useQuery } from "@tanstack/react-query";
import { GitProvider } from "@wso2-enterprise/choreo-core";
import { Codicon } from "../Codicon/Codicon";
import { ProgressIndicator } from "../ActivityBar/Components/ProgressIndicator";
const BranchListContainer = styled.div `
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    gap: 20px;
`;
const RefreshBtn = styled(VSCodeButton) `
    margin-top: auto;
    padding: 1px;
`;
const CredSelectorActions = styled.div `
    display  : flex;
    flex-direction: row;
    padding: 20px 0;
`;
export function BitbucketCredSelector(props) {
    const { org, selectedCred, onCredSelect } = props;
    const { isLoading: isFetchingCredentials, data: credentials, refetch, isRefetching } = useQuery({
        queryKey: ['git-bitbucket-credentials', org.uuid],
        queryFn: () => __awaiter(this, void 0, void 0, function* () {
            const gitCredentialsData = yield ChoreoWebViewAPI.getInstance().getChoreoGithubAppClient().getCredentials(org.uuid, org.id);
            return gitCredentialsData;
        }),
        select: (gitCredentialsData) => {
            const credentialNameArr = [];
            if (gitCredentialsData && gitCredentialsData.length > 0) {
                gitCredentialsData === null || gitCredentialsData === void 0 ? void 0 : gitCredentialsData.forEach((cred) => {
                    if (cred.type === GitProvider.BITBUCKET) {
                        const i = {
                            id: cred.id,
                            name: cred.name
                        };
                        credentialNameArr.push(i);
                    }
                });
            }
            return credentialNameArr;
        }
    });
    const handleBitbucketDropdownChange = (credName) => {
        let credId = '';
        if (credName) {
            credentials === null || credentials === void 0 ? void 0 : credentials.forEach((credential) => {
                if (credential.name === credName) {
                    credId = credential.id;
                }
            });
            onCredSelect({ id: credId, name: credName });
        }
    };
    const handleConfigureNewCred = () => __awaiter(this, void 0, void 0, function* () {
        // open add credentials page in browser with vscode open external
        const consoleUrl = yield ChoreoWebViewAPI.getInstance().getConsoleUrl();
        ChoreoWebViewAPI.getInstance().openExternal(`${consoleUrl}/organizations/${org.handle}/settings/credentials`);
    });
    const showProgressBar = isFetchingCredentials || isRefetching;
    return (React.createElement(React.Fragment, null,
        !isFetchingCredentials && credentials.length === 0 &&
            React.createElement(CredSelectorActions, null,
                React.createElement("span", null,
                    "No Credentials available. Please ",
                    React.createElement(VSCodeLink, { onClick: handleConfigureNewCred }, "Configure New Credential"),
                    " in bitbucket.")),
        !isFetchingCredentials &&
            (React.createElement(React.Fragment, null,
                React.createElement(BranchListContainer, null,
                    "Select Credential",
                    React.createElement(VSCodeDropdown, { id: "cred-drop-down", value: selectedCred.name, onChange: (e) => {
                            handleBitbucketDropdownChange(e.target.value);
                        } },
                        React.createElement(VSCodeOption, { key: '', value: '', id: `cred-item-null` }, ''),
                        credentials.map((credential) => (React.createElement(VSCodeOption, { key: credential.id, value: credential.name, id: `cred-item-${credential.name}` }, credential.name)))),
                    React.createElement(RefreshBtn, { appearance: "icon", onClick: () => refetch(), title: "Refresh credentials", disabled: isRefetching, id: 'refresh-credentials-btn' },
                        React.createElement(Codicon, { name: "refresh" }))))),
        showProgressBar && React.createElement(ProgressIndicator, null)));
}
//# sourceMappingURL=BitbucketCredSelector.js.map