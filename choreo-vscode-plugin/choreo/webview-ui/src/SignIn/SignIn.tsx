import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { WebViewRpc } from "../utilities/WebViewRpc";

export function SignIn() {
    const onSignIn = () => {
        WebViewRpc.getInstance().triggerSignIn();
    };
    return (
        <>
            <VSCodeButton onClick={onSignIn}>Sign in</VSCodeButton>
        </>
    );
}