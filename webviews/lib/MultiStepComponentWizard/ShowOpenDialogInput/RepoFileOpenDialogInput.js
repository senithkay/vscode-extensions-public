var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
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
import { VSCodeLink } from "@vscode/webview-ui-toolkit/react";
import { ChoreoWebViewAPI } from "../../utilities/WebViewRpc";
const Container = styled.span `
    margin-left: 10px;
`;
export const RepoFileOpenDialogInput = (props) => {
    const { label, onOpen, repo, path } = props, restProps = __rest(props, ["label", "onOpen", "repo", "path"]);
    const handleClick = () => __awaiter(void 0, void 0, void 0, function* () {
        const repoPath = yield ChoreoWebViewAPI.getInstance().getChoreoProjectManager().getRepoPath(repo);
        const defaultUri = `file://${repoPath}/`;
        const paths = yield ChoreoWebViewAPI.getInstance().showOpenDialog(Object.assign(Object.assign({}, restProps), { defaultUri }));
        if (paths && paths.length > 0) {
            if (!paths[0].startsWith(repoPath)) {
                ChoreoWebViewAPI.getInstance().showErrorMsg("Selected path is not inside the repository.");
                return;
            }
            let subPath = paths[0].replace(repoPath, "");
            // need to remove the first slash if it exists, for both windows and unix
            if (subPath.startsWith("/") || subPath.startsWith("\\")) {
                subPath = subPath.substring(1);
            }
            onOpen(subPath);
        }
    });
    return React.createElement(Container, null,
        React.createElement(VSCodeLink, { onClick: handleClick },
            React.createElement("i", { className: `codicon codicon-folder-opened`, style: { verticalAlign: "bottom", marginRight: "5px" } }),
            label));
};
//# sourceMappingURL=RepoFileOpenDialogInput.js.map