// /*
//  * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
//  *
//  * This software is the property of WSO2 Inc. and its suppliers, if any.
//  * Dissemination of any information or reproduction of any material contained
//  * herein is strictly forbidden, unless permitted by WSO2 in accordance with
//  * the WSO2 Commercial License available at http://wso2.com/licenses.
//  * For specific language governing the permissions and limitations under
//  * this license, please see the license as well as any agreement you’ve
//  * entered into with WSO2 governing the purchase of this software and any
//  * associated services.
//  */
// // tslint:disable: jsx-no-multiline-js jsx-no-lambda
// import React, { useContext, useState } from "react";
//
// import { LibraryKind } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
//
// import { StatementEditorContext } from "../../../store/statement-editor-context";
// import SelectDropdown from "../../Dropdown";
// import { useStatementEditorStyles } from "../../styles";
//
// const ALL_LIBS = "All"
// const LANGUAGE_LIBS = "Language"
// const STANDARD_LIBS = "Standard"
//
// export function LibraryTypeSelector() {
//     const statementEditorClasses = useStatementEditorStyles();
//     const stmtCtx = useContext(StatementEditorContext);
//     const {
//         library: {
//             getLibrariesList
//         }
//     } = stmtCtx;
//
//     const [libraries, setLibraries] = useState([]);
//
//     const onLibTypeSelection = async (value: string) => {
//         let response;
//         if (value === LANGUAGE_LIBS) {
//             response = await getLibrariesList(LibraryKind.langLib);
//         } else if (value === STANDARD_LIBS) {
//             response = await getLibrariesList(LibraryKind.stdLib);
//         } else {
//             response = await getLibrariesList();
//         }
//
//         if (response) {
//             setLibraries(response.librariesList);
//         }
//     };
//
//     return (
//         <div className={statementEditorClasses.libraryDropdown}>
//             <SelectDropdown
//                 values={[ALL_LIBS, LANGUAGE_LIBS, STANDARD_LIBS]}
//                 defaultValue={ALL_LIBS}
//                 onSelection={onLibTypeSelection}
//             />
//         </div>
//     );
// }
