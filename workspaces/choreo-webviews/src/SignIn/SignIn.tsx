import styled from "@emotion/styled";
import { VSCodeButton, VSCodeProgressRing } from "@vscode/webview-ui-toolkit/react";
import { useContext } from "react";
import { ChoreoWebViewContext } from "../context/choreo-web-view-ctx";
import { WebViewRpc } from "../utilities/WebViewRpc";

const Container = styled.div`
    width: 100%;
    display  : flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 20px;
`;

export function SignIn() {
    const { loginStatus, loginStatusPending } = useContext(ChoreoWebViewContext);

    const onSignIn = () => {
        WebViewRpc.getInstance().triggerSignIn();
    };
    return (
        <Container>
            {(loginStatusPending || loginStatus === "LoggingIn" || loginStatus === "Initializing") && (
                <>
                    <label>{'Waiting for Choreo sign-in...'}</label>
                    <VSCodeProgressRing />
                </>
            )}
            {!loginStatusPending && loginStatus === "LoggedOut" && (
                <>
                    <label>{'Sign in to Choreo...'}</label>
                    <VSCodeButton onClick={onSignIn}>Sign in</VSCodeButton>
                </>
            )}
        </Container>
    );
}