/// <reference types="react" />
import { GitProvider, Organization } from "@wso2-enterprise/choreo-core";
import { FilteredCredentialData } from "@wso2-enterprise/choreo-client/lib/github/types";
export interface ConfigureRepoAccordionProps {
    selectedOrg: Organization;
    gitProvider: GitProvider;
    selectedCredential: FilteredCredentialData;
    selectedGHOrgName: string;
    setSelectedGHOrgName: (orgName: string) => void;
    selectedGHRepo: string;
    setSelectedGHRepo: (repoName: string) => void;
    validationInProgress: boolean;
    setValidationInProgress: (inProgress: boolean) => void;
    isBareRepo: boolean;
    setIsBareRepo: (isBareRepo: boolean) => void;
    selectedBranch: string;
    setSelectedBranch: (branch: string) => void;
    setErrorMsg: (msg: string) => void;
}
export declare function ConfigureRepoAccordion(props: ConfigureRepoAccordionProps): JSX.Element;
