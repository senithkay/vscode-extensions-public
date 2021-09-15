// import React from "react";
// import { Expression, Equality, Conditional } from "../../../models/definitions";
// import { getSuggestionsBasedOnExpressionKind } from "../../../utils";
// import { ExpressionComponent } from "../../Expression";
// import * as c from "../../../constants";
//
// interface ConditionalProps {
//     model: Expression
//     callBack: (suggestions: string[], model: Expression) => void
// }
//
// export function ConditionalC(props: ConditionalProps) {
//     const { model, callBack } = props;
//     let conditionExpression: any;
//     let trueExpression: any;
//     let falseExpression: any;
//     let conditionExpressionComponent: any;
//     let trueExpressionComponent: any;
//     let falseExpressionComponent: any;
//
//     if (model.kind === c.CONDITIONAL) {
//         const conditionalModel: Conditional = model.expressionType as Conditional;
//         conditionExpression = conditionalModel.condition
//         trueExpression = conditionalModel.trueExpr
//         falseExpression = conditionalModel.falseExpr
//         conditionExpressionComponent = <ExpressionComponent model={conditionExpression} callBack={callBack} isRoot={false} />;
//         trueExpressionComponent = <ExpressionComponent model={trueExpression} callBack={callBack} isRoot={false} />;
//         falseExpressionComponent = <ExpressionComponent model={falseExpression} callBack={callBack} isRoot={false} />;
//     }
//
//     const onClickOnExpression = (model: Expression, e: any) => {
//         e.stopPropagation()
//         callBack(getSuggestionsBasedOnExpressionKind(c.CONDITIONAL), model)
//     };
//
//     return (
//         <span>
//             <button className="template-button" onClick={(e) => onClickOnExpression(conditionExpression, e)}>{conditionExpressionComponent}</button>
//             <span className="App-expression-block App-expression-block-disabled">
//                 &nbsp;&nbsp;?&nbsp;&nbsp;
//             </span>
//             <button className="template-button" onClick={(e) => onClickOnExpression(trueExpression, e)}>{trueExpressionComponent}</button>
//             <span className="App-expression-block App-expression-block-disabled">
//                 &nbsp;&nbsp;:&nbsp;&nbsp;
//             </span>
//             <button className="template-button" onClick={(e) => onClickOnExpression(falseExpression, e)}>{falseExpressionComponent}</button>
//         </span>
//     );
// }
