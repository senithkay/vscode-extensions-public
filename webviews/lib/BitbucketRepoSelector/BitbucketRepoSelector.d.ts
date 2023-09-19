/// <reference types="react" />
import { FilteredCredentialData } from "@wso2-enterprise/choreo-client/lib/github/types";
export interface BitbucketRepoSelectorProps {
    selectedCred: FilteredCredentialData;
    selectedRepo?: {
        org: string;
        repo: string;
        branch: string;
    };
    onRepoSelect: (org?: string, repo?: string, branch?: string) => void;
    refreshRepoList: boolean;
    setLoadingRepos: (loading: boolean) => void;
    setLoadingBranches: (loading: boolean) => void;
}
export declare function BitbucketRepoSelector(props: BitbucketRepoSelectorProps): JSX.Element;
