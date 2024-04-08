import React, { FC } from "react";
import { Button, RequiredFormInput } from "@wso2-enterprise/ui-toolkit";
import { ProgressIndicator } from "@wso2-enterprise/ui-toolkit";
import classNames from "classnames";
import {
    AccountActivityView
} from "@wso2-enterprise/choreo-core";

export const AccountView: FC<AccountActivityView> = () => {
    return (
        <div className="w-full">
            User Info
        </div>
    );
};
