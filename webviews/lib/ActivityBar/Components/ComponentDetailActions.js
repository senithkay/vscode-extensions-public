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
import { VSCodeLink } from "@vscode/webview-ui-toolkit/react";
import styled from "@emotion/styled";
import { useComponentPush } from "../../hooks/use-component-push";
import { useComponentPullRepo } from "../../hooks/use-component-pull-repo";
const DisabledVSCodeLink = styled.div `
  padding: 1px;
  color: var(--foreground);
  opacity: 0.5;
`;
const LinkWithNoMargin = styled(VSCodeLink) `
    margin: -1px;
`;
export const ComponentDetailActions = (props) => {
    const { component, loading, handleSourceControlClick } = props;
    const hasDirtyLocalRepo = component.hasDirtyLocalRepo || component.hasUnPushedLocalCommits;
    const { handlePushComponentClick, pushingSingleComponent } = useComponentPush(component);
    const { pullComponent, isPulling } = useComponentPullRepo(component);
    let visibleAction;
    if (hasDirtyLocalRepo) {
        visibleAction = "sync";
    }
    else if (component.isRemoteOnly && component.repository) {
        visibleAction = "pull";
    }
    else if (component.local) {
        visibleAction = "push";
    }
    return (React.createElement(React.Fragment, null,
        visibleAction === "sync" && (React.createElement(LinkWithNoMargin, { onClick: handleSourceControlClick, title: "Open source control view & sync changes" }, "Commit & Push")),
        visibleAction === "pull" && (React.createElement(React.Fragment, null, loading || isPulling ? (React.createElement(DisabledVSCodeLink, null, isPulling ? "Pulling..." : "Pull Component")) : (React.createElement(LinkWithNoMargin, { title: "Pull code from remote repository", onClick: () => {
                var _a;
                pullComponent({
                    repository: component.repository,
                    branchName: (_a = component === null || component === void 0 ? void 0 : component.repository) === null || _a === void 0 ? void 0 : _a.branchApp,
                    componentId: component.id,
                });
            } }, "Pull Component")))),
        visibleAction === "push" && (React.createElement(React.Fragment, null, loading || pushingSingleComponent ? (React.createElement(DisabledVSCodeLink, null, pushingSingleComponent ? "Pushing..." : "Push to Choreo")) : (React.createElement(LinkWithNoMargin, { onClick: () => {
                handlePushComponentClick(component.name);
            }, title: "Push component to Choreo" }, "Push to Choreo")))),
        visibleAction === undefined && "-"));
};
//# sourceMappingURL=ComponentDetailActions.js.map