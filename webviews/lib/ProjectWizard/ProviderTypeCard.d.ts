import React from "react";
import { GitProvider } from "@wso2-enterprise/choreo-core";
export interface ProviderTypeCardProps {
    currentType: GitProvider;
    onChange: (type: GitProvider) => void;
    type: GitProvider;
    label: string;
}
export declare const ProviderTypeCard: React.FC<ProviderTypeCardProps>;
