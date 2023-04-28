/*
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */
import { INPUT_FIELD_FILTER_LABEL, OUTPUT_FIELD_FILTER_LABEL } from "./SearchBox";

enum SearchType {
    INPUT,
    OUTPUT,
}

export interface SearchTerm {
    searchText: string;
    searchType: SearchType;
    isLabelAvailable: boolean;
}

export function getInputOutputSearchTerms(searchTerm: string): [SearchTerm, SearchTerm] {
    const inputFilter = INPUT_FIELD_FILTER_LABEL;
    const outputFilter = OUTPUT_FIELD_FILTER_LABEL;
    const searchSegments = searchTerm.split(" ");

    const inputSearchTerm = searchSegments.find(segment => segment.startsWith(inputFilter));
    const outputSearchTerm = searchSegments.find(segment => segment.startsWith(outputFilter));

    const searchTerms = searchSegments.filter(segment =>
        !segment.startsWith(inputFilter) && !segment.startsWith(outputFilter));
    const searchTermItem: SearchTerm = {
        searchText: searchTerms.join(" "),
        searchType: undefined,
        isLabelAvailable: false
    };

    return [
        inputSearchTerm ? {
            searchText: inputSearchTerm.substring(inputFilter.length),
            searchType: SearchType.INPUT,
            isLabelAvailable: true
        } : {...searchTermItem, searchType: SearchType.INPUT},
        outputSearchTerm ? {
            searchText: outputSearchTerm.substring(outputFilter.length),
            searchType: SearchType.OUTPUT,
            isLabelAvailable: true
        } : {...searchTermItem, searchType: SearchType.OUTPUT}
    ];
}


// export function getInputOutputSearchTerms(searchTerm: string): [SearchTerm, SearchTerm] {
//     const searchSegments = searchTerm.split(" ", 2);
//
//     if (searchSegments.length === 2
//         && !searchSegments.some(segment =>
//             segment.startsWith(INPUT_FIELD_FILTER_LABEL) || segment.startsWith(OUTPUT_FIELD_FILTER_LABEL))) {
//         const searchTermItem: SearchTerm = {
//             searchText: searchTerm,
//             searchType: undefined,
//             isLabelAvailable: false
//         }
//         return [{...searchTermItem, searchType: SearchType.INPUT}, {...searchTermItem, searchType: SearchType.OUTPUT}];
//     }
//
//     let inputSearchTerm: SearchTerm;
//     let outputSearchTerm: SearchTerm;
//
//     for (const segment of searchSegments) {
//         if (segment.startsWith(INPUT_FIELD_FILTER_LABEL)) {
//             inputSearchTerm = {
//                 searchText: segment.substring(INPUT_FIELD_FILTER_LABEL.length),
//                 searchType: SearchType.INPUT,
//                 isLabelAvailable: true
//             }
//         } else if (segment.startsWith(OUTPUT_FIELD_FILTER_LABEL)) {
//             outputSearchTerm = {
//                 searchText: segment.substring(OUTPUT_FIELD_FILTER_LABEL.length),
//                 searchType: SearchType.OUTPUT,
//                 isLabelAvailable: true
//             }
//         } else {
//             inputSearchTerm = inputSearchTerm && inputSearchTerm.isLabelAvailable ? inputSearchTerm : {
//                 searchText: segment,
//                 searchType: SearchType.INPUT,
//                 isLabelAvailable: false
//             };
//             outputSearchTerm = outputSearchTerm && outputSearchTerm.isLabelAvailable ? outputSearchTerm : {
//                 searchText: segment,
//                 searchType: SearchType.OUTPUT,
//                 isLabelAvailable: false
//             };
//         }
//     }
//     return [inputSearchTerm, outputSearchTerm];
// }
