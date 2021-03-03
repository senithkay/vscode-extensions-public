import { STNode } from "@ballerina/syntax-tree";

import { LogMessage, TestCaseFile, TestCaseInfo } from "../../api/models";

export interface TestCaseState {
    isTestCasesListLoading: boolean;
    isTestCaseFetchLoading: boolean;
    isTestCaseDeleteLoading: boolean,
    isTestCaseCreateLoading: boolean;
    isTestCaseCodeChangeInProgress: boolean;
    isTestCaseFileSaveInProgress: boolean;
    isWaitingOnWorkspace: boolean;
    isTestCaseFileLoading: boolean;
    testCaseListRowsPerPage: number,
    testCaseListPageNumber: number,
    testCaseList: TestCaseInfo[];
    createdTestCase?: TestCaseInfo
    currentTestCaseFile?: TestCaseFile;
    currentTestCase?: TestCaseInfo;
    err?: any;
    showTestCasesButtonLoader: boolean;
    isTestCasesRunInProgress: boolean;
    testCasesLogs?: LogMessage[];
    isLoadingTestCasesRuntimeData: boolean;
    isTestCaseSTLoading: boolean;
    isClearingStore: boolean;
    ast?: STNode;
}
