/// <reference types="react" />
export interface RepoBranchSelectorProps {
    org: string;
    repo: string;
    branch: string;
    onBranchChange: (branch: string) => void;
    credentialID: string;
    setLoadingBranches: (loading: boolean) => void;
}
export declare function RepoBranchSelector(props: RepoBranchSelectorProps): JSX.Element;
