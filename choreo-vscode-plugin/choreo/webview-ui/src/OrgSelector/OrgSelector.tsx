import { VSCodeDropdown, VSCodeOption } from "@vscode/webview-ui-toolkit/react";
import { useEffect, useState } from "react";
import { ChoreoLoginStatus, WebViewRpc } from "../utilities/WebViewRpc";

export function OrgSelector() {

    const [loginStatusPending, setLoginStatusPending] = useState(true);
    const [loginStatus, setLoginStatus] = useState<ChoreoLoginStatus>("Initializing");


    useEffect(() => {
        const checkLoginStatus = async () => {
            const loginStatus = await WebViewRpc.getInstance().getLoginStatus();
            setLoginStatus(loginStatus);
            setLoginStatusPending(false);
            console.log("received")
        }
        checkLoginStatus();
    }, []);

    return (
        <>
            Login pending: {loginStatusPending ? "checking" : "done"}
            Login status : {loginStatus}
            <label htmlFor="org-dropdown" >Select Organization</label>
            <VSCodeDropdown id="org-dropdown">
                <VSCodeOption>Test</VSCodeOption>
                <VSCodeOption>Test1</VSCodeOption>
                <VSCodeOption>Test2</VSCodeOption>

            </VSCodeDropdown>
        </>
    )
}