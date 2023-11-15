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

import { join } from "path";

export const CHOREO_PROJECTS_PATH = join(__dirname, '..', '..', '..', '..','src', 'tests', 'e2e-tests', 'test-projects');

export const CELL_VIEW_COMMAND = 'Choreo: View Choreo Cell Diagram';
export const ADD_CHOREO_COMPONENT_COMMAND = 'Choreo: Create New Component';
export const SIGN_IN_COMMAND =  'Choreo: Sign In';
export const SIGN_OUT_COMMAND =  'Choreo: Sign Out';
export const SIGN_IN_WITH_AUTH_CODE = 'Sign In with Auth Code';
export const ADD_CHOREO_PROJECT_COMMAND = 'Choreo: Create New Project';
export const STAGE_CHANGES_COMMAND = 'Git: Stage All Changes';
export const GIT_REFRESH_COMMAND = 'Git: Refresh';
export const COMMIT_STAGED_COMMAND = 'Git: Commit Staged';
export const GIT_PUSH_COMMAND = 'Git: Push';
export const DELETE_PROJECT = "Choreo: Delete Choreo Project";
export const OPEN_CHOREO_PROJECT = "Choreo: Open Choreo Project";
export const ENABLE_DND_MODE = "Notifications: Toggle Do Not Disturb Mode";
