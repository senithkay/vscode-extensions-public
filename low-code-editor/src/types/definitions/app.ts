import { AppInfo, ApplicationFile, AppRuntimeInfo, DeployLogMessage, DeployLogs, LogMessage } from "../../api/models";

// TODO: Duplicate entry found. Fix
export interface AppViewState {
    isWaitingOnWorkspace: boolean;
    isCodeChangeInProgress: boolean;
    isAppLoading: boolean;
    isFileLoading: boolean;
    isFileSaveInProgress: boolean;
    currentApp?: AppInfo;
    currentFile?: ApplicationFile;
    err?: any;
    showTestButtonLoader: boolean,
    isDeployed: boolean,
    isTestRunInProgress: boolean,
    isUnDeployInProgress: boolean,
    isDeployInProgress: boolean,
    isLoadingRuntimeData: boolean,
    runtimeData?: AppRuntimeInfo,
    testLogs?: LogMessage[],
    observeId?: string;
    version?: string;
    logPanelSize: number;
    selectedTab?: string;
    isDeployLogDownloading: boolean,
    deployLogDownload?: DeployLogs
    prodLogs?: LogMessage[],
    deployLogs?: DeployLogMessage[],
    deployLogNotFound: boolean;
    currentResource?: any;
}
