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

// Authentication
export const SIGN_IN_START_EVENT = 'vscode-signing-in-start';
export const SIGN_IN_CANCEL_EVENT = 'vscode-signing-in-cancel';
export const SIGN_IN_SUCCESS_EVENT = 'vscode-signing-in-success';
export const SIGN_IN_FAILURE_EVENT = 'vscode-signing-in-failure';

export const SIGN_OUT_START_EVENT = 'vscode-signing-out-start';
export const SIGN_OUT_CANCEL_EVENT = 'vscode-signing-out-cancel';
export const SIGN_OUT_SUCCESS_EVENT = 'vscode-signing-out-success';
export const SIGN_OUT_FAILURE_EVENT = 'vscode-signing-out-failure';

export const SIGN_IN_FROM_EXISITING_SESSION_START_EVENT = 'vscode-signing-in-from-existing-session-start';
export const SIGN_IN_FROM_EXISITING_SESSION_CANCEL_EVENT = 'vscode-signing-in-from-existing-session-cancel';
export const SIGN_IN_FROM_EXISITING_SESSION_SUCCESS_EVENT = 'vscode-signing-in-from-existing-session-success';
export const SIGN_IN_FROM_EXISITING_SESSION_FAILURE_EVENT = 'vscode-signing-in-from-existing-session-failure';

// Component Creation
export const CREATE_COMPONENT_START_EVENT = 'vscode-create-component-start';
export const CREATE_COMPONENT_CANCEL_EVENT = 'vscode-create-component-cancel';
export const CREATE_COMPONENT_SUCCESS_EVENT = 'vscode-create-component-success';
export const CREATE_COMPONENT_FAILURE_EVENT = 'vscode-create-component-failure';

// Component Deletion
export const DELETE_COMPONENT_START_EVENT = 'vscode-delete-component-start';
export const DELETE_COMPONENT_CANCEL_EVENT = 'vscode-delete-component-cancel';
export const DELETE_COMPONENT_SUCCESS_EVENT = 'vscode-delete-component-success';
export const DELETE_COMPONENT_FAILURE_EVENT = 'vscode-delete-component-failure';

// Project Creation
export const CREATE_PROJECT_START_EVENT = 'vscode-create-project-start';
export const CREATE_PROJECT_CANCEL_EVENT = 'vscode-create-project-cancel';
export const CREATE_PROJECT_SUCCESS_EVENT = 'vscode-create-project-success';
export const CREATE_PROJECT_FAILURE_EVENT = 'vscode-create-project-failure';

// Open Project
export const OPEN_WORKSPACE_PROJECT_OVERVIEW_PAGE_START_EVENT = 'vscode-open-workspace-project-overview-page-start';
export const OPEN_WORKSPACE_PROJECT_OVERVIEW_PAGE_CANCEL_EVENT = 'vscode-open-workspace-project-overview-page-cancel';
export const OPEN_WORKSPACE_PROJECT_OVERVIEW_PAGE_SUCCESS_EVENT = 'vscode-open-workspace-project-overview-page-success';
export const OPEN_WORKSPACE_PROJECT_OVERVIEW_PAGE_FAILURE_EVENT = 'vscode-open-workspace-project-overview-page-failure';

export const OPEN_READ_ONLY_PROJECT_OVERVIEW_PAGE = 'vscode-open-read-only-project-overview-page';

// Overview Events
export const OPEN_READ_ONLY_ARCHITECTURE_DIAGRAM_EVENT = 'vscode-open-read-only-architecture-diagram';
export const OPEN_EDITABLE_ARCHITECTURE_DIAGRAM_EVENT = 'vscode-open-editable-architecture-diagram';
export const OPEN_UPGRADE_PLAN_PAGE_EVENT = 'vscode-open-upgrade-plan-page';
export const OPEN_CONSOLE_PROJECT_OVERVIEW_PAGE_EVENT = 'vscode-open-console-project-overview-page';
export const OPEN_CONSOLE_COMPONENT_OVERVIEW_PAGE_EVENT = 'vscode-open-console-component-overview-page';
export const OPEN_GITHUB_REPO_PAGE_EVENT = 'vscode-open-github-repo-page';
export const OPEN_SOURCE_CONTROL_VIEW_EVENT = 'vscode-open-source-control-view';
export const OPEN_CLONED_PROJECT_EVENT = 'vscode-open-cloned-project';
export const PUSH_COMPONENT_TO_CHOREO_EVENT = 'vscode-push-component-to-choreo';
export const PUSH_ALL_COMPONENTS_TO_CHOREO_EVENT = 'vscode-push-all-components-to-choreo';
export const OPEN_COMPONENT_CREATION_FROM_OVERVIEW_PAGE_EVENT = 'vscode-open-component-creation-from-overview-page';
export const CLONE_COMPONENT_FROM_OVERVIEW_PAGE_EVENT = 'vscode-clone-component-from-overview-page';
export const DELETE_COMPONENT_FROM_OVERVIEW_PAGE_EVENT = 'vscode-delete-component-from-overview-page';
export const PULL_REMOTE_COMPONENT_FROM_OVERVIEW_PAGE_EVENT = 'vscode-pull-remote-component-from-overview-page';

// Clone new repo to project
export const CLONE_PROJECT_START_EVENT = 'vscode-clone-project-start';
export const CLONE_PROJECT_CANCEL_EVENT = 'vscode-clone-project-cancel';
export const CLONE_PROJECT_SUCCESS_EVENT = 'vscode-clone-project-success';
export const CLONE_PROJECT_FAILURE_EVENT = 'vscode-clone-project-failure';

// Clone project
export const CLONE_NEW_REPO_TO_PROJECT_START_EVENT = 'vscode-clone-new-repo-to-project-start';
export const CLONE_NEW_REPO_TO_PROJECT_CANCEL_EVENT = 'vscode-clone-new-repo-to-project-cancel';
export const CLONE_NEW_REPO_TO_PROJECT_SUCCESS_EVENT = 'vscode-clone-new-repo-to-project-success';
export const CLONE_NEW_REPO_TO_PROJECT_FAILURE_EVENT = 'vscode-clone-new-repo-to-project-failure';

// Tree View Events
export const REFRESH_PROJECTS_EVENT = 'vscode-refresh-projects';
export const SWITCH_ORGANIZATION_EVENT = 'vscode-switch-organization';

// Common Error Event
export const ERROR_OCCURRED_EVENT = 'vscode-error-occurred';

