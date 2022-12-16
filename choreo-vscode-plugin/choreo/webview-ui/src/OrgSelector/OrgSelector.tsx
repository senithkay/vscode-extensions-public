import { VSCodeDropdown, VSCodeOption, VSCodeProgressRing } from "@vscode/webview-ui-toolkit/react";
import { useContext } from "react";
import { ChoreoWebViewContext } from "../context/choreo-web-view-ctx";

export function OrgSelector() {

    const { selectedOrg, userOrgs, fetchingOrgInfo } = useContext(ChoreoWebViewContext);

    return (
        <>
            <label htmlFor="org-dropdown" >Select Organization</label>
            {fetchingOrgInfo && <VSCodeProgressRing />}
            {!fetchingOrgInfo && (
                <VSCodeDropdown id="org-dropdown">
                    {userOrgs?.map((org) => (<VSCodeOption selected={selectedOrg?.id === org.id}>{org.name}</VSCodeOption>))}
                </VSCodeDropdown>
            )}
        </>
    )
}
