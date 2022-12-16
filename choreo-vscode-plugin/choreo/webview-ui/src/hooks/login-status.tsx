import { useEffect, useState } from "react";
import { ChoreoLoginStatus, WebViewRpc } from "../utilities/WebViewRpc";

export function useLoginStatus() {

   const [loginStatusPending, setLoginStatusPending] = useState(true);
   const [loginStatus, setLoginStatus] = useState<ChoreoLoginStatus>("Initializing");

   useEffect(() => {
      const rpcInstance = WebViewRpc.getInstance();
      const checkLoginStatus = async () => {
         const loginStatus = await rpcInstance.getLoginStatus();
         setLoginStatus(loginStatus);
         setLoginStatusPending(false);
      }
      checkLoginStatus();
      rpcInstance.onLoginStatusChanged((newStatus) => setLoginStatus(newStatus));
   }, []);

   return { loginStatusPending, loginStatus };
}