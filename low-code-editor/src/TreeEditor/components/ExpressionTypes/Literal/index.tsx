// import React from "react";
// import { Expression, Literal } from "../../../models/definitions";
// import { getSuggestionsBasedOnExpressionKind } from "../../../utils";
// import * as c from "../../../constants";
//
// interface LiteralProps {
//     model: Expression
//     callBack: (suggestions: string[], model: Expression) => void
// }
//
// export function LiteralC(props: LiteralProps) {
//     const { model, callBack } = props;
//     let value: any;
//
//     const onClickOnExpression = (e: any) => {
//         e.stopPropagation()
//         callBack(getSuggestionsBasedOnExpressionKind(c.LITERAL), model)
//     };
//
//     if (model.kind === c.LITERAL) {
//         const literalModel: Literal = model.expressionType as Literal;
//         value = literalModel?.value ? literalModel.value : "expression";
//     }
//
//     return (
//         <span className="App-expression-block App-expression-block-element">
//             <input type="text" id="literal" name="literal" onClick={(e) => onClickOnExpression(e)} className="literal-input"></input>
//             {/* <button className="template-button" onClick={(e) => onClickOnExpression(e)}>
//                 {value}
//             </button> */}
//         </span>
//     );
// }
