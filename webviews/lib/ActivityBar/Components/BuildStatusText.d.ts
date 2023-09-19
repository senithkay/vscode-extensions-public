import React from "react";
import { BuildStatus as BuildStatusType } from "@wso2-enterprise/choreo-core";
export declare const mapBuildStatus: (buildStatus: BuildStatusType) => {
    text: string;
    color: string;
};
export declare const BuildStatusText: React.FC<{
    buildStatus: BuildStatusType;
    handler: string;
    loading: boolean;
    localComponent: boolean;
}>;
