/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

export const API_DOCS_DRIFT_CHECK_TYPE = "CODE_AND_APIDOCS";
export const DOCUMENTATION_DRIFT_CHECK_TYPE = "CODE_AND_DOCUMENTATION";
export const API_DOCS_DRIFT_CHECK_ENDPOINT = `/driftcheck?driftType=${API_DOCS_DRIFT_CHECK_TYPE}`;
export const DOCUMENTATION_DRIFT_CHECK_ENDPOINT = `/driftcheck?driftType=${DOCUMENTATION_DRIFT_CHECK_TYPE}`;
export const DEVELOPER_OVERVIEW_FILENAME = "developer.md";
export const NATURAL_PROGRAMMING_PATH = "natural-programming";
export const DEVELOPER_OVERVIEW_RELATIVE_PATH = `${NATURAL_PROGRAMMING_PATH}/${DEVELOPER_OVERVIEW_FILENAME}`;
export const REQUIREMENT_DOC_PREFIX = "requirements.";
export const REQUIREMENT_TEXT_DOCUMENT = `${REQUIREMENT_DOC_PREFIX}txt`;
export const REQUIREMENT_MD_DOCUMENT = `${REQUIREMENT_DOC_PREFIX}md`;
export const README_FILE_NAME_LOWERCASE = "readme.md";
export const COMMAND_SHOW_TEXT = "extension.showTextOptions";
export const DIAGNOSTIC_ID = "NLE001";
