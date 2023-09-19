import React from "react";
import { Deployment } from "@wso2-enterprise/choreo-core";
export declare const DeploymentStatusText: React.FC<{
    localComponent: boolean;
    deployment: Deployment;
    loading: boolean;
    handler: string;
}>;
