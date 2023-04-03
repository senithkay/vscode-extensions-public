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
import { OpenDialogOptions } from "@wso2-enterprise/choreo-core";
import styled from "@emotion/styled";
import { VSCodeLink } from "@vscode/webview-ui-toolkit/react";
import { ChoreoWebViewAPI } from "../../utilities/WebViewRpc";
import { Codicon } from "../../Codicon/Codicon";

const Container =  styled.span`
    margin-left: 10px;
`;

export interface ShowOpenDialogInputProps extends Omit<OpenDialogOptions, "defaultUri"> {
    label: string;
    repo: string;
    path: string;
    onOpen: (path: string) => void;
}

export const RepoFileOpenDialogInput = (props: ShowOpenDialogInputProps) => {
    const { label, onOpen, repo, path, ...restProps } = props;

    const handleClick = async () => {
        const repoPath = await ChoreoWebViewAPI.getInstance().getChoreoProjectManager().getRepoPath(repo);
        const defaultUri = `file://${repoPath}/`;
        const paths = await  ChoreoWebViewAPI.getInstance().showOpenDialog({
            ...restProps,
            defaultUri
        });
        if (paths && paths.length > 0) {
            if (!paths[0].startsWith(repoPath)) {
                ChoreoWebViewAPI.getInstance().showErrorMsg("Selected path is not inside the repository.");
                return;
            }
            const subPath = paths[0].replace(repoPath, "");
            onOpen(subPath);
        }
    };

    return <Container>
        <VSCodeLink onClick={handleClick}>
            <i className={`codicon codicon-folder-opened`} style={{ verticalAlign: "bottom", marginRight: "5px"}} />
            {label}
        </VSCodeLink>
    </Container>

};
