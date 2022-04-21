/**
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

/* mime types */
export const MIME_TYPE_PLAIN_TEXT = "plain/text";
export const MIME_TYPE_TABLE = "ballerina-notebook/table-view";
export const MIME_TYPE_JSON = "ballerina-notebook/json-view";
export const MIME_TYPE_XML = "ballerina-notebook/xml-view";

/* themes */
export const JSON_LIGHT_THEME = "summerfruit:inverted";
export const JSON_DARK_THEME = "summerfruit";
export const XML_LIGHT_THEME = {
    "attributeKeyColor": "#b46900",
    "attributeValueColor": "#dd6900",
    "cdataColor": "#22a21f",
    "commentColor": "#aaa",
    "separatorColor": "#d43900",
    "tagColor": "#d43900",
    "textColor": "#000"
};
export const XML_DARK_THEME = {
    ...XML_LIGHT_THEME,
    "separatorColor": "#c95b32",
    "tagColor": "#c95b32",
    "textColor": "#fff"
};
