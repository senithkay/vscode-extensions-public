import { VSCodeDropdown, VSCodeOption, VSCodeProgressRing } from "@vscode/webview-ui-toolkit/react";
import { useOrgInfo } from "../hooks/org-info";

export function OrgSelector() {

    const { selectedOrg, userOrgs, fetchingOrgInfo } = useOrgInfo();

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
