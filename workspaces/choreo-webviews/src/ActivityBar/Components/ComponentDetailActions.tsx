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
import React from "react";
import { Component } from "@wso2-enterprise/choreo-core";
import { VSCodeLink } from "@vscode/webview-ui-toolkit/react";
import styled from "@emotion/styled";
import { useComponentPush } from "../../hooks/use-component-push";
import { useComponentPullRepo } from "../../hooks/use-component-pull-repo";

const DisabledVSCodeLink = styled.div`
  padding: 1px;
  color: var(--foreground);
  opacity: 0.5;
`;

const LinkWithNoMargin = styled(VSCodeLink)`
    margin: -1px;
`;

export const ComponentDetailActions: React.FC<{
    component: Component;
    handleSourceControlClick: () => void;
    loading?: boolean;
}> = (props) => {
    const { component, loading, handleSourceControlClick } = props;
    const hasDirtyLocalRepo = component.hasDirtyLocalRepo || component.hasUnPushedLocalCommits;
    const { handlePushComponentClick, pushingSingleComponent } = useComponentPush(component);
    const { pullComponent, isPulling } = useComponentPullRepo(component);

    let visibleAction: "push" | "pull" | "sync" | undefined;
    if (hasDirtyLocalRepo) {
        visibleAction = "sync";
    } else if (component.isRemoteOnly && component.repository) {
        visibleAction = "pull";
    } else if (component.local) {
        visibleAction = "push";
    }

    return (
        <>
            {visibleAction === "sync" && (
                <LinkWithNoMargin onClick={handleSourceControlClick} title="Open source control view & sync changes">
                    Commit & Push
                </LinkWithNoMargin>
            )}
            {visibleAction === "pull" && (
                <>
                    {loading || isPulling ? (
                        <DisabledVSCodeLink>{isPulling ? "Pulling..." : "Pull Component"}</DisabledVSCodeLink>
                    ) : (
                        <LinkWithNoMargin
                            title="Pull code from remote repository"
                            onClick={() => {
                                pullComponent({
                                    repository: component.repository,
                                    branchName: component?.repository?.branchApp,
                                    componentId: component.id,
                                });
                            }}
                        >
                            Pull Component
                        </LinkWithNoMargin>
                    )}
                </>
            )}
            {visibleAction === "push" && (
                <>
                    {loading || pushingSingleComponent ? (
                        <DisabledVSCodeLink>{pushingSingleComponent ? "Pushing..." : "Push to Choreo"}</DisabledVSCodeLink>
                    ) : (
                        <LinkWithNoMargin
                            onClick={() => {
                                handlePushComponentClick(component.name);
                            }}
                            title="Push component to Choreo"
                        >
                            Push to Choreo
                        </LinkWithNoMargin>
                    )}
                </>
            )}
            {visibleAction === undefined && "-"}
        </>
    );
};
