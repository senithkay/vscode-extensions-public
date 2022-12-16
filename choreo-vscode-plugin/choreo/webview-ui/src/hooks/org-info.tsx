import { useEffect, useState } from "react";
import { Organization, WebViewRpc } from "../utilities/WebViewRpc";

export function useOrgInfo() {
    const [selectedOrg, setSelectedOrg] = useState<Organization|undefined>(undefined);
    const [userOrgs, setUserOrgs] = useState<Organization[]|undefined>(undefined);


    useEffect(() => {
        const rpcInstance = WebViewRpc.getInstance()
        const fetchOrgInfo =async () => {
            const currOrg = await rpcInstance.getCurrentOrg();
            const allOrgs = await rpcInstance.getAllOrgs();
            setSelectedOrg(currOrg);
            setUserOrgs(allOrgs);
        }
        fetchOrgInfo();
        rpcInstance.onSelectedOrgChanged((newOrg) => {
            setSelectedOrg(newOrg);
        });

    }, [])
    
    return { selectedOrg, userOrgs };
}