import { RequestType } from "vscode-messenger-common";
import { BallerinaProjectComponents } from "../../core/extended-language-client";


export interface RPCInterface {
    getComponents(): Promise<BallerinaProjectComponents>;
}


const PRE_FIX = "overview/";

export const getComponents: RequestType<void,BallerinaProjectComponents> = { method: `${PRE_FIX}getComponents` };


