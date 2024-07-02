import { ChildProcess } from "child_process";

export interface IMILangServer {
    start: () => void;
    shutdown: () => void;
    lsProcess?: ChildProcess;
}
