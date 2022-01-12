/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */
import {
    LibraryInfo,
    LibrarySearchResponse,
    ModuleProperty
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";

export function filterByKeyword(libraryData: LibrarySearchResponse , searchTxt: string): LibrarySearchResponse {
    const filteredModuleList = getFilteredModulesList(libraryData.modules, searchTxt);
    const filteredFunctionsList = getFilteredModulePropertiesList(libraryData.functions, searchTxt);
    const filteredClassesList = getFilteredModulePropertiesList(libraryData.classes, searchTxt);
    const filteredObjTypesList = getFilteredModulePropertiesList(libraryData.objectTypes, searchTxt);
    const filteredRecordsList = getFilteredModulePropertiesList(libraryData.records, searchTxt);
    const filteredConstantsList = getFilteredModulePropertiesList(libraryData.constants, searchTxt);
    const filteredErrorsList = getFilteredModulePropertiesList(libraryData.errors, searchTxt);
    const filteredTypesList = getFilteredModulePropertiesList(libraryData.types, searchTxt);
    const filteredClientsList = getFilteredModulePropertiesList(libraryData.clients, searchTxt);
    const filteredListenersList = getFilteredModulePropertiesList(libraryData.listeners, searchTxt);
    const filteredAnnotationsList = getFilteredModulePropertiesList(libraryData.annotations, searchTxt);
    const filteredEnumsList = getFilteredModulePropertiesList(libraryData.enums, searchTxt);

    return {
        modules: filteredModuleList,
        classes: filteredClassesList,
        functions: filteredFunctionsList,
        records: filteredRecordsList,
        constants: filteredConstantsList,
        errors: filteredErrorsList,
        types: filteredTypesList,
        clients: filteredClientsList,
        listeners: filteredListenersList,
        annotations: filteredAnnotationsList,
        objectTypes: filteredObjTypesList,
        enums: filteredEnumsList
    };
}

function getFilteredModulesList(libraryInfo: LibraryInfo[], searchTxt: string): LibraryInfo[] {
    return libraryInfo.filter((item) => {
        const lc = item.id.toLowerCase();
        const filter = searchTxt.toLowerCase();
        return lc.includes(filter);
    });
}

function getFilteredModulePropertiesList(libraryData: ModuleProperty[], searchTxt: string): ModuleProperty[] {
    return libraryData.filter((item) => {
        const lc = item.id.toLowerCase();
        const filter = searchTxt.toLowerCase();
        return lc.includes(filter);
    });
}
