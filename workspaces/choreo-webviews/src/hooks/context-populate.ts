/*
 *  Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
 * 
 *  This software is the property of WSO2 LLC. and its suppliers, if any.
 *  Dissemination of any information or reproduction of any material contained
 *  herein is strictly forbidden, unless permitted by WSO2 in accordance with
 *  the WSO2 Commercial License available at http://wso2.com/licenses.
 *  For specific language governing the permissions and limitations under
 *  this license, please see the license as well as any agreement you’ve
 *  entered into with WSO2 governing the purchase of this software and any
 *  associated services.
 */
import { ChoreoLoginStatus, Organization } from "@wso2-enterprise/choreo-core";
import { useState, useEffect } from "react";
import { IChoreoWebViewContext } from "../context/choreo-web-view-ctx";
import { ChoreoWebViewAPI } from "../utilities/WebViewRpc";

export function usePopulateContext(): IChoreoWebViewContext {

    const [loginStatusPending, setLoginStatusPending] = useState(true);
    const [loginStatus, setLoginStatus] = useState<ChoreoLoginStatus>("Initializing");
    const [fetchingOrgInfo, setFetchingOrgInfo] = useState(true);
    const [selectedOrg, setSelectedOrg] = useState<Organization | undefined>(undefined);
    const [userOrgs, setUserOrgs] = useState<Organization[] | undefined>(undefined);
    const [error, setError] = useState<Error | undefined>(undefined);
  
    useEffect(() => {
      const rpcInstance = ChoreoWebViewAPI.getInstance();
      const checkLoginStatus = async () => {
        try {
          const loginStatus = await rpcInstance.getLoginStatus();
          setLoginStatus(loginStatus);
        } catch (err: any) {
          setError(err);
        }
        setLoginStatusPending(false);
      }
      checkLoginStatus();
      rpcInstance.onLoginStatusChanged(setLoginStatus);
    }, []);

    useEffect(() => {
        const rpcInstance = ChoreoWebViewAPI.getInstance()
        const fetchOrgInfo = async () => {
            try {
              const currOrg = await rpcInstance.getCurrentOrg();
              const allOrgs = await rpcInstance.getAllOrgs();
              setSelectedOrg(currOrg);
              setUserOrgs(allOrgs);
            } catch (err: any) {
              setError(err)
            }
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
        userOrgs,
        error
    }
}
