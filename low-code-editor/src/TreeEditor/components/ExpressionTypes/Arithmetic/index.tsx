// import React from "react";
// import { Arithmetic, Expression } from "../../../models/definitions";
// import { getSuggestionsBasedOnExpressionKind } from "../../../utils";
// import { getOperatorSuggestions } from "../../../utils";
// import { ExpressionComponent } from "../../Expression";
// import * as c from "../../../constants";
//
// interface ArithmeticProps {
//     model: Expression
//     callBack: (suggestions: string[], model: Expression, operator: boolean) => void
// }
// export function ArithmeticC(props: ArithmeticProps) {
//     const { model, callBack } = props;
//     let lhsExpression: any;
//     let rhsExpression: any;
//     let lhs: any;
//     let rhs: any;
//     let arithmeticModel: Arithmetic;
//     let operator: any;
//
//     if (model.kind === c.ARITHMETIC) {
//         arithmeticModel = model.expressionType as Arithmetic;
//         lhsExpression = arithmeticModel.lhsOperand
//         rhsExpression = arithmeticModel.rhsOperand
//         operator = arithmeticModel.operator
//         lhs = <ExpressionComponent model={lhsExpression} callBack={callBack} isRoot={false} />;
//         rhs = <ExpressionComponent model={rhsExpression} callBack={callBack} isRoot={false} />;
//     }
//
//
//     const onClickOperator = (e: any) => {
//         e.stopPropagation()
//         callBack(getOperatorSuggestions(c.ARITHMETIC), model, true)
//     }
//
//     const onClickOnExpression = (model: Expression, e: any) => {
//         e.stopPropagation()
//         callBack(getSuggestionsBasedOnExpressionKind(c.ARITHMETIC), model, false)
//     };
//
//     return (
//         <span>
//             {/* {"("} */}
//             <button className="template-button" onClick={(e) => onClickOnExpression(lhsExpression, e)}>{lhs}</button>
//             {/* <span className="template-button" onClick={(e)=>onClickOnExpression(lhsExpression, e)}>{lhs}</span> */}
//             <span className="App-expression-block App-expression-block-element">
//                 <button className="template-button" onClick={(e) => onClickOperator(e)}>{operator ? operator : "operator"}</button>
//             </span>
//             <button className="template-button" onClick={(e) => onClickOnExpression(rhsExpression, e)}>{rhs}</button>
//             {/* <span className="template-button" onClick={(e)=>onClickOnExpression(rhsExpression, e)}>{rhs}</span> */}
//             {/* {")"} */}
//         </span>
//     );
// }
