// import React from "react";
// import { Relational, Expression } from "../../../models/definitions";
// import { getOperatorSuggestions, getSuggestionsBasedOnExpressionKind } from "../../../utils";
// import { ExpressionComponent } from "../../Expression";
// import * as c from "../../../constants";
//
// interface RelationalProps {
//     model: Expression
//     callBack: (suggestions: string[], model: Expression, operator: boolean) => void
// }
//
// export function RelationalC(props: RelationalProps) {
//     const { model, callBack } = props;
//     let lhsExpression: any;
//     let rhsExpression: any;
//     let lhs: any;
//     let rhs: any;
//     let operator: any;
//
//     if (model.kind === c.RELATIONAL) {
//         const relationalModel: Relational = model.expressionType as Relational;
//         lhsExpression = relationalModel.lhsExp
//         rhsExpression = relationalModel.rhsExp
//         operator = relationalModel.operator
//         lhs = <ExpressionComponent model={lhsExpression} callBack={callBack} isRoot={false} />;
//         rhs = <ExpressionComponent model={rhsExpression} callBack={callBack} isRoot={false} />;
//     }
//
//     const onClickOperator = (e: any) => {
//         e.stopPropagation()
//         callBack(getOperatorSuggestions(c.RELATIONAL), model, true)
//     }
//
//     const onClickOnExpression = (model: Expression, e: any) => {
//         e.stopPropagation()
//         callBack(getSuggestionsBasedOnExpressionKind(c.RELATIONAL), model, false)
//     };
//
//     return (
//         <span>
//             <button className="template-button" onClick={(e) => onClickOnExpression(lhsExpression, e)}>{lhs}</button>
//             {/* <span className="template-button" onClick={(e)=>onClickOnExpression(lhsExpression, e)}>{lhs}</span> */}
//             <span className="App-expression-block App-expression-block-element">
//                 <button className="template-button" onClick={(e) => onClickOperator(e)}>{operator ? operator : "operator"}</button>
//             </span>
//             <button className="template-button" onClick={(e) => onClickOnExpression(rhsExpression, e)}>{rhs}</button>
//             {/* <span className="template-button" onClick={(e)=>onClickOnExpression(rhsExpression, e)}>{rhs}</span> */}
//         </span>
//     );
// }
