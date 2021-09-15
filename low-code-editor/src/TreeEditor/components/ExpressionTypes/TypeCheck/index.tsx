// import React from "react";
// import { Expression, TypeCheck } from "../../../models/definitions";
// import { getSuggestionsBasedOnExpressionKind, getTypesBasedOnExpressionKind } from "../../../utils";
// import { ExpressionComponent } from "../../Expression";
// import * as c from "../../../constants";
// import { TypesForExpressionKind } from "../../../utils/utils";
//
// interface TypeCheckProps {
//     model: Expression
//     callBack: (suggestions: string[], model: Expression, operator: boolean) => void
// }
//
// export function TypeCheckC(props: TypeCheckProps) {
//     const { model, callBack } = props;
//     let typeCheckExpression: any;
//     let typeDescriptor: any;
//     let typeCheckValueComponent: any;
//     let typeDescriptorComponent: any;
//
//     if (model.kind === c.TYPE_CHECK) {
//         const typeCheckModel: TypeCheck = model.expressionType as TypeCheck;
//         typeCheckExpression = typeCheckModel.value
//         typeDescriptor = typeCheckModel.typeDescriptor
//         typeCheckValueComponent = <ExpressionComponent model={typeCheckExpression} callBack={callBack} isRoot={false} />;
//         typeDescriptorComponent = typeCheckModel?.typeDescriptor ? typeCheckModel.typeDescriptor : "typeDescriptor";
//     }
//
//     const onClickOnExpression = (model: Expression, e: any) => {
//         e.stopPropagation()
//         callBack(getSuggestionsBasedOnExpressionKind(c.TYPE_CHECK), model, false)
//     };
//
//     const onClickTypeDescriptor = (e: any) => {
//         e.stopPropagation()
//         callBack(getTypesBasedOnExpressionKind(c.TYPE_CHECK), model, true)
//     }
//
//     return (
//         <span>
//             <button className="template-button" onClick={(e) => onClickOnExpression(typeCheckExpression, e)}>{typeCheckValueComponent}</button>
//             <span className="App-expression-block App-expression-block-disabled">
//                 &nbsp;&nbsp;is&nbsp;&nbsp;
//             </span>
//             <button className="template-button" onClick={(e) => onClickTypeDescriptor(e)}>{typeDescriptorComponent}</button>
//         </span>
//     );
// }
