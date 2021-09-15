// import React from "react";
// import { Expression, StringTemplate } from "../../../models/definitions";
// import { getSuggestionsBasedOnExpressionKind } from "../../../utils";
// import { ExpressionComponent } from "../../Expression";
// import * as c from "../../../constants";
//
// interface StringTemplateProps {
//     model: Expression
//     callBack: (suggestions: string[], model: Expression, operator:boolean) => void
// }
//
// export function StringTemplateC(props: StringTemplateProps) {
//     const { model, callBack } = props;
//     let expression: any;
//     let expressionComponent: any;
//
//     if (model.kind === c.STRING_TEMPLATE ) {
//         const stringTemplateModel: StringTemplate = model.expressionType as StringTemplate;
//         expression = stringTemplateModel.exp
//         expressionComponent = <ExpressionComponent model={expression} callBack={callBack} isRoot={false} />;
//     }
//
//     const onClickOnExpression = (model: Expression, e: any) => {
//         e.stopPropagation()
//         callBack(getSuggestionsBasedOnExpressionKind(c.STRING_TEMPLATE), model,false)
//     };
//
//     return (
//         <span>
//             <span className="App-expression-block App-expression-block-disabled">
//                 &nbsp;&nbsp;string `&nbsp;&nbsp;
//             </span>
//             <input type="text" id="literal" name="literal" onClick={(e) => onClickOnExpression(expression, e)} className="literal-input"></input>
//             <span className="App-expression-block App-expression-block-disabled">
//                 &nbsp;&nbsp;`&nbsp;&nbsp;
//             </span>
//         </span>
//     );
// }
