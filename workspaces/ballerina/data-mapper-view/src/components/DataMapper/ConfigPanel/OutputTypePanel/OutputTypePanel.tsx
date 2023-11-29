export {}
// /**
//  * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
//  *
//  * This software is the property of WSO2 LLC. and its suppliers, if any.
//  * Dissemination of any information or reproduction of any material contained
//  * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
//  * You may not alter or remove any copyright or other notice from copies of this content.
//  */
// // tslint:disable: jsx-no-multiline-js
// // tslint:disable: jsx-no-lambda
// import React from "react";

// import styled from "@emotion/styled";
// import { Box } from "@material-ui/core";
// import DeleteOutLineIcon from "@material-ui/icons/DeleteOutline";
// import EditIcon from "@material-ui/icons/Edit";
// import { ButtonWithIcon, WarningBanner } from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";

// import { Title } from "../DataMapperConfigPanel";
// import { InputParamEditor } from "../InputParamsPanel/InputParamEditor";
// import { DataMapperOutputParam } from "../InputParamsPanel/types";
// import { RecordButtonGroup } from "../RecordButtonGroup";
// import { CompletionResponseWithModule, TypeBrowser } from "../TypeBrowser";
// import { getTypeIncompatibilityMsg } from "../utils";

// export interface OutputConfigWidgetProps {
//     outputType: DataMapperOutputParam;
//     fetchingCompletions: boolean;
//     completions: CompletionResponseWithModule[]
//     showOutputType: boolean;
//     isArraySupported: boolean;
//     handleShowOutputType: () => void;
//     handleHideOutputType: () => void;
//     handleOutputTypeChange: (type: string, isArray: boolean) => void;
//     handleShowRecordEditor: () => void;
//     handleOutputDeleteClick: () => void;
// }

// export function OutputTypePanel(props: OutputConfigWidgetProps) {
//     const {
//         outputType,
//         fetchingCompletions,
//         completions,
//         showOutputType,
//         isArraySupported,
//         handleShowOutputType,
//         handleHideOutputType,
//         handleOutputTypeChange,
//         handleShowRecordEditor,
//         handleOutputDeleteClick
//     } = props;

//     const typeIncompatibilityMsg = outputType.isUnsupported
//         && getTypeIncompatibilityMsg(outputType.typeNature, outputType.type, "output");
//     const typeUnsupportedBanner = outputType.isUnsupported && (
//         <Warning
//             testId="unsupported-output-banner"
//             message={typeIncompatibilityMsg}
//         />
//     );

//     const label = (
//         <>
//             <TypeName isInvalid={outputType.isUnsupported}>{outputType.isArray ? `${outputType.type}[]` : outputType.type}</TypeName>
//         </>
//     );

//     return (
//         <OutputTypeConfigPanel data-testid='dm-output'>
//             <Title>Output Type</Title>
//             {(!outputType.type || showOutputType) ? (
//                 <>
//                     {showOutputType ? (
//                         <InputParamEditor
//                             param={{ ...outputType, name: "" }}
//                             hideName={true}
//                             onUpdate={(_, param) => {
//                                 handleOutputTypeChange(param.type, param.isArray);
//                                 handleHideOutputType();
//                             }}
//                             onCancel={handleHideOutputType}
//                             completions={completions}
//                             loadingCompletions={fetchingCompletions}
//                             isArraySupported={isArraySupported}
//                         />
//                     ) :
//                         <RecordButtonGroup openRecordEditor={handleShowRecordEditor} showTypeList={handleShowOutputType} />
//                     }

//                 </>
//             ) : (
//                 <>
//                     <OutputTypeContainer isInvalid={outputType.isUnsupported}>
//                         <ClickToEditContainer isInvalid={outputType.isUnsupported} onClick={!outputType.isUnsupported && handleShowOutputType}>
//                             {label}
//                         </ClickToEditContainer>
//                         {/* <TypeName>{outputType?.isArray ? `${outputType.type}[]` : outputType.type}</TypeName> */}
//                         <Box component="span" display="flex">
//                             {!outputType.isUnsupported && (
//                                 <EditButton
//                                     onClick={handleShowOutputType}
//                                     icon={<EditIcon fontSize="small" />}
//                                     dataTestId={`data-mapper-config-edit-output`}
//                                 />
//                             )}
//                             <DeleteButton
//                                 onClick={handleOutputDeleteClick}
//                                 icon={<DeleteOutLineIcon fontSize="small" />}
//                                 dataTestId="data-mapper-config-delete-output"
//                             />
//                         </Box>
//                     </OutputTypeContainer>
//                     {outputType.type && outputType.isUnsupported && typeUnsupportedBanner}
//                 </>
//             )}
//         </OutputTypeConfigPanel>
//     );
// }

// const ClickToEditContainer = styled.div(({ isInvalid }: { isInvalid?: boolean }) => ({
//     cursor: isInvalid ? 'auto' : 'pointer',
//     width: '100%'
// }));

// const OutputTypeContainer = styled.div(({ isInvalid }: { isInvalid?: boolean }) => ({
//     background: "white",
//     padding: 10,
//     borderRadius: 5,
//     border: "1px solid #dee0e7",
//     color: `${isInvalid ? '#fe523c' : 'inherit'}`,
//     margin: "1rem 0 0.25rem",
//     justifyContent: "space-between",
//     display: "flex",
//     width: "100%",
//     alignItems: "center",
// }));

// const OutputTypeConfigPanel = styled.div`
//     width: 100%;
// `;

// const Warning = styled(WarningBanner)`
//     border-width: 1px !important;
//     width: unset;
//     margin: 5px 0;
// `

// const DeleteButton = styled(ButtonWithIcon)`
//     padding: 0;
//     color: #fe523c;
// `;

// const TypeName = styled.span(({ isInvalid }: { isInvalid?: boolean }) => ({
//     fontWeight: 500,
//     color: `${isInvalid ? '#fe523c' : 'inherit'}`,
// }));

// const EditButton = styled(ButtonWithIcon)`
//     padding: 0;
//     margin-right: 5px;
//     color: #36B475;
// `;
