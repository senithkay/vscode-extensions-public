/// <reference types="react" />
export interface GithubRepoSelectorProps {
    selectedRepo?: {
        org: string;
        repo: string;
        branch: string;
    };
    onRepoSelect: (org?: string, repo?: string, branch?: string) => void;
    setLoadingRepos: (loading: boolean) => void;
    setLoadingBranches: (loading: boolean) => void;
}
export declare function GithubRepoSelector(props: GithubRepoSelectorProps): JSX.Element;
