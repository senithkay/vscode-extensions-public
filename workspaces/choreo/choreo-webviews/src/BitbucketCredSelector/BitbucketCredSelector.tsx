/*
 *  Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
 * 
 *  This software is the property of WSO2 LLC. and its suppliers, if any.
 *  Dissemination of any information or reproduction of any material contained
 *  herein is strictly forbidden, unless permitted by WSO2 in accordance with
 *  the WSO2 Commercial License available at http://wso2.com/licenses.
 *  For specific language governing the permissions and limitations under
 *  this license, please see the license as well as any agreement you’ve
 *  entered into with WSO2 governing the purchase of this software and any
 *  associated services.
 */
import styled from "@emotion/styled";
import { VSCodeButton, VSCodeDropdown, VSCodeLink, VSCodeOption } from "@vscode/webview-ui-toolkit/react";
import { CredentialData, FilteredCredentialData } from "@wso2-enterprise/choreo-client/lib/github/types";
import React from "react";
import { ChoreoWebViewAPI } from "../utilities/WebViewRpc";
import { useQuery } from "@tanstack/react-query";
import { GitProvider, Organization } from "@wso2-enterprise/choreo-core";
import { Codicon } from "../Codicon/Codicon";
import { ProgressIndicator } from "@wso2-enterprise/ui-toolkit";

const BranchListContainer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    gap: 20px;
`;

const RefreshBtn = styled(VSCodeButton)`
    margin-top: auto;
    padding: 1px;
`;

const CredSelectorActions = styled.div`
    display  : flex;
    flex-direction: row;
    padding: 20px 0;
`;

export interface BitbucketCredSelectorProps {
    org: Organization;
    selectedCredID: string;
    onCredSelect: (cred: FilteredCredentialData) => void;
}

export function BitbucketCredSelector(props: BitbucketCredSelectorProps) {

    const { org, selectedCredID, onCredSelect } = props;

    const { isLoading: isFetchingCredentials, data: credentials, refetch, isRefetching } = useQuery({
        queryKey: ['git-bitbucket-credentials', org.uuid],
        queryFn: async () => {
            const gitCredentialsData = await ChoreoWebViewAPI.getInstance().getChoreoGithubAppClient().getCredentials(org.uuid, org.id);
            return gitCredentialsData;
        },
        select: (gitCredentialsData) => {
            const credentialNameArr: FilteredCredentialData[] = [];
            if (gitCredentialsData && gitCredentialsData.length > 0) {
                gitCredentialsData?.forEach(
                    (cred: CredentialData) => {
                        if (cred.type === GitProvider.BITBUCKET) {
                            const i: FilteredCredentialData = {
                                id: cred.id,
                                name: cred.name
                            };
                            credentialNameArr.push(i);
                        }
                    }
                );
            }
            return credentialNameArr;
        }
    });

    const selectedCredName = credentials?.find(cred => cred.id === selectedCredID)?.name;

    const handleBitbucketDropdownChange = (credName: string) => {
        let credId = '';
        if (credName) {
            credentials?.forEach(
                (credential: FilteredCredentialData) => {
                    if (credential.name === credName) {
                        credId = credential.id;
                    }
                }
            )

            onCredSelect({ id: credId, name: credName });
        }
    };

    const handleConfigureNewCred = async () => {
        // open add credentials page in browser with vscode open external
        const consoleUrl = await ChoreoWebViewAPI.getInstance().getConsoleUrl();
        ChoreoWebViewAPI.getInstance().openExternal(`${consoleUrl}/organizations/${org.handle}/settings/credentials`);
    };

    const showProgressBar = isFetchingCredentials || isRefetching;

    return (
        <>
            {!isFetchingCredentials && credentials.length === 0 &&
            <CredSelectorActions>
                <span>No Credentials available. Please <VSCodeLink onClick={handleConfigureNewCred}>Configure New Credential</VSCodeLink> in bitbucket.</span>
            </CredSelectorActions>
            }
            {!isFetchingCredentials &&
                (<>
                    <BranchListContainer>
                        Select Credential
                        <VSCodeDropdown
                            id="cred-drop-down"
                            value={selectedCredName}
                            onChange={(e: any) => {
                                handleBitbucketDropdownChange(e.target.value)
                            }}>
                            <VSCodeOption
                                key={''}
                                value={''}
                                id={`cred-item-null`}
                            >
                                {''}
                            </VSCodeOption>
                            {credentials.map((credential) => (
                                <VSCodeOption
                                    key={credential.id}
                                    value={credential.name}
                                    id={`cred-item-${credential.name}`}
                                >
                                    {credential.name}
                                </VSCodeOption>
                            ))}
                        </VSCodeDropdown>
                        <RefreshBtn
                            appearance="icon"
                            onClick={() => refetch()}
                            title="Refresh credentials"
                            disabled={isRefetching}
                            id='refresh-credentials-btn'
                        >
                            <Codicon name="refresh" />
                        </RefreshBtn>
                    </BranchListContainer>
                </>)
            }
            {showProgressBar && <ProgressIndicator />}
        </>
    );
}
