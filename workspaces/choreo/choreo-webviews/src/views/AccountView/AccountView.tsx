import React, { FC } from "react";
import { AccountActivityViewProps, CommandIds } from "@wso2-enterprise/choreo-core";
import { useAuthContext } from "../../context/choreo-auth-ctx";
import { VSCodeLink } from "@vscode/webview-ui-toolkit/react";
import { ChoreoWebViewAPI } from "../../utilities/WebViewRpc";

export const AccountView: FC<AccountActivityViewProps> = () => {
    const { userInfo } = useAuthContext();

    const onSignOut = () => {
        ChoreoWebViewAPI.getInstance().triggerCmd(CommandIds.SignOut);
    };
    
    return (
        <div className="w-full flex gap-3 items-center px-6 py-2 mt-2">
            {userInfo?.userProfilePictureUrl && (
                <img className="rounded opacity-80" src={userInfo?.userProfilePictureUrl} width="60px" height="60px" />
            )}
            <div className="flex flex-col gap-0.5">
                <h3 className="font-bold line-clamp-1">{userInfo.displayName}</h3>
                <p>{userInfo.userEmail}</p>
                <VSCodeLink onClick={onSignOut} className="text-xs">Sign Out</VSCodeLink>
            </div>
        </div>
    );
};
