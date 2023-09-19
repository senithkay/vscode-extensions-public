import React from "react";
import { ComponentCreateMode } from "@wso2-enterprise/choreo-core";
export declare const Main: React.FC<any>;
interface ChoreoWebviewProps {
    type: string;
    projectId?: string;
    orgName?: string;
    choreoUrl?: string;
    componentCreateMode?: ComponentCreateMode;
}
declare function ChoreoWebview(props: ChoreoWebviewProps): JSX.Element;
export default ChoreoWebview;
