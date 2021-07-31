import { AppInfo } from "../../api/models";

export interface SecretResponse{
    obsId: string;
    projectSecret: string;
}

export interface AppsLinkDetails {
    app: AppInfo,
    secret?: string,
    commands?: string
}

export interface LinkerState {
    apps: {[id: string]: AppsLinkDetails}
}
