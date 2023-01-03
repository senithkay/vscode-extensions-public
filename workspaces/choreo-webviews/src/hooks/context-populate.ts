import { useState, useEffect } from "react";
import { IChoreoWebViewContext } from "../context/choreo-web-view-ctx";
import { ChoreoLoginStatus, Organization, WebViewRpc } from "../utilities/WebViewRpc";

export function usePopulateContext(): IChoreoWebViewContext {

    const [loginStatusPending, setLoginStatusPending] = useState(true);
    const [loginStatus, setLoginStatus] = useState<ChoreoLoginStatus>("Initializing");
    const [fetchingOrgInfo, setFetchingOrgInfo] = useState(true);
    const [selectedOrg, setSelectedOrg] = useState<Organization | undefined>(undefined);
    const [userOrgs, setUserOrgs] = useState<Organization[] | undefined>(undefined);
  
    useEffect(() => {
      const rpcInstance = WebViewRpc.getInstance();
      const checkLoginStatus = async () => {
        const loginStatus = await rpcInstance.getLoginStatus();
        setLoginStatus(loginStatus);
        setLoginStatusPending(false);
      }
      checkLoginStatus();
      rpcInstance.onLoginStatusChanged(setLoginStatus);
    }, []);

    useEffect(() => {
        const rpcInstance = WebViewRpc.getInstance()
        const fetchOrgInfo = async () => {
            const currOrg = await rpcInstance.getCurrentOrg();
            const allOrgs = await rpcInstance.getAllOrgs();
            setSelectedOrg(currOrg);
            setUserOrgs(allOrgs);
            setFetchingOrgInfo(false);
        }
        fetchOrgInfo();
        rpcInstance.onSelectedOrgChanged(setSelectedOrg);
    }, []);

    return {
        loginStatusPending,
        loginStatus,
        fetchingOrgInfo,
        selectedOrg,
        userOrgs
    }
}