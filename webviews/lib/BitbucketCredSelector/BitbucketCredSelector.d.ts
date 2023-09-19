/// <reference types="react" />
import { FilteredCredentialData } from "@wso2-enterprise/choreo-client/lib/github/types";
import { Organization } from "@wso2-enterprise/choreo-core";
export interface BitbucketCredSelectorProps {
    org: Organization;
    selectedCred: FilteredCredentialData;
    onCredSelect: (cred: FilteredCredentialData) => void;
}
export declare function BitbucketCredSelector(props: BitbucketCredSelectorProps): JSX.Element;
