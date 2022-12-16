import { VSCodeDropdown, VSCodeOption } from "@vscode/webview-ui-toolkit/react";
import { useLoginStatus } from "../hooks/login-status";
import { useOrgInfo } from "../hooks/org-info";

export function OrgSelector() {

    const  { loginStatusPending, loginStatus } = useLoginStatus();
    const { selectedOrg, userOrgs } = useOrgInfo();

    return (
        <>
            Login pending: {loginStatusPending ? "checking" : "done"}
            Login status : {loginStatus}
            Selected Org: {selectedOrg?.handle}
            <label htmlFor="org-dropdown" >Select Organization</label>
            <VSCodeDropdown id="org-dropdown">
                <VSCodeOption>Test</VSCodeOption>
                <VSCodeOption>Test1</VSCodeOption>
                <VSCodeOption>Test2</VSCodeOption>

            </VSCodeDropdown>
        </>
    )
}
