/*
 *  Copyright (c) 2024, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
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
import {
    LibraryKind,
    LibraryDocResponse,
    LibrarySearchResponse,
    LibraryDataResponse,
    LibraryDataRequest
} from "../../extension-interfaces/library-browser-types";

export interface LibraryBrowserAPI {
    getLibrariesList: (params?: LibraryKind) => Promise<LibraryDocResponse | undefined>;
    getLibrariesData: () => Promise<LibrarySearchResponse | undefined>;
    getLibraryData: (params: LibraryDataRequest) => Promise<LibraryDataResponse | undefined>;
}
