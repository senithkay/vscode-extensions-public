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
import { VSCodeDropdown, VSCodeLink, VSCodeOption, VSCodeProgressRing } from "@vscode/webview-ui-toolkit/react";
import { CredentialData, FilteredCredentialData, GitProvider } from "@wso2-enterprise/choreo-client/lib/github/types";
import React, { useContext, useEffect, useState } from "react";
import { ChoreoWebViewAPI } from "../utilities/WebViewRpc";
import { useQuery } from "@tanstack/react-query";
import { ChoreoWebViewContext } from "../context/choreo-web-view-ctx";
import { Organization } from "@wso2-enterprise/choreo-core";

const BranchListContainer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    gap: 20px;
`;

const SmallProgressRing = styled(VSCodeProgressRing)`
    height: calc(var(--design-unit) * 4px);
    width: calc(var(--design-unit) * 4px);
`;

export interface BitbucketCredSelectorProps {
    org: Organization;
    selectedCred: FilteredCredentialData;
    onCredSelect: (cred: FilteredCredentialData) => void;
}

export function BitbucketCredSelector(props: BitbucketCredSelectorProps) {

    const { org, selectedCred, onCredSelect } = props;

    const { setBitbucketCredentialId } = useContext(ChoreoWebViewContext);
    const [credentials, setCredentials] = useState<FilteredCredentialData[]>([]);
    const { isLoading: isFetchingCredentials, data: gitCredentialsData } = useQuery({
        queryKey: [org],
        queryFn: async () => ChoreoWebViewAPI.getInstance().getChoreoGithubAppClient().getCredentials(org.uuid)
    });

    useEffect(() => {
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
            setCredentials(credentialNameArr);
        }
    }, [gitCredentialsData]);

    const handleBitbucketDropdownChange = (credName: string) => {
        let credId = '';
        if (credName) {
            credentials?.forEach(
                (credential: FilteredCredentialData) => {
                    if (credential.name === credName) {
                        credId = credential.id;
                    };
                }
            )

            onCredSelect({ id: credId, name: credName });
            setBitbucketCredentialId(credId);
        }
    };

    const handleConfigureNewCred = async () => {
        // open add credentials page in browser with vscode open external
        ChoreoWebViewAPI.getInstance().openExternal(`https://console.choreo.dev/`);
    };

    return (
        <>
            {isFetchingCredentials && <SmallProgressRing />}
            {!isFetchingCredentials && credentials.length === 0 &&
                <VSCodeLink onClick={handleConfigureNewCred}>Configure New Credential</VSCodeLink>
            }
            {!isFetchingCredentials &&
                (<>
                    <BranchListContainer>
                        Select Credential
                        <VSCodeDropdown
                            id="cred-drop-down"
                            value={selectedCred.name}
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
                    </BranchListContainer>
                </>)
            }
        </>
    );
}
