import React, { FC, HTMLProps } from "react";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { CommandIds } from "@wso2-enterprise/choreo-core";
import { ChoreoWebViewAPI } from "../../utilities/WebViewRpc";
import classNames from "classnames";

interface Props {
    className?: HTMLProps<HTMLElement>["className"];
}

export const SignInView: FC<Props> = ({ className }) => {
    return (
        <div className={classNames("w-full flex flex-col px-6 py-2 gap-[10px]", className)}>
            <p>Sign in to Choreo to get started.</p>
            <VSCodeButton
                className="w-full max-w-80 self-center sm:self-start"
                onClick={() => ChoreoWebViewAPI.getInstance().triggerCmd(CommandIds.SignIn)}
            >
                Sign In
            </VSCodeButton>
        </div>
    );
};
