import React, { FC, HTMLProps } from "react";
import classnames from 'classnames';
import { VSCodeLink } from "@vscode/webview-ui-toolkit/react";
import {getShortenedHash} from '../../utilities/helpers'
import { ChoreoWebViewAPI } from "../../utilities/WebViewRpc";

interface Props {
    className?: HTMLProps<HTMLElement>["className"];
    commitHash: string;
    commitMessage: string;
    repoPath: string;
}

export const CommitLink: FC<Props> = ({ className, commitHash, commitMessage, repoPath }) => {
    const openLink = ()=>{
        ChoreoWebViewAPI.getInstance().openExternal(`${repoPath}/commit/${commitHash}`);
    }
    return <VSCodeLink onClick={openLink} className={classnames('text-vsc-foreground',className)} title={`Open Commit (Commit Message: ${commitMessage})`}>{getShortenedHash(commitHash)}</VSCodeLink>
};
