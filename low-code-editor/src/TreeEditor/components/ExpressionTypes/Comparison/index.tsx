// import React from "react";
// import { Comparison, Expression } from "../../../models/definitions";
// import { ExpressionComponent } from "../../Expression";
//
// interface ComparisionProps {
//     model: Expression
//     callback: (exp: string[]) => void
// }
//
// export function ComparisionC(props: ComparisionProps) {
//     const { model, callback } = props;
//     let lhs: any;
//     let rhs: any;
//
//     if (model.kind === "Comparison") {
//         const comparisonModel: Comparison = model.expressionType as Comparison;
//         lhs = <ExpressionComponent model={comparisonModel.lhsExp} callBack={callback} isRoot={false} />;
//         rhs = <ExpressionComponent model={comparisonModel.rhsExp} callBack={callback} isRoot={false} />;
//     }
//
//     const onClickWholeExpression = () => {
//         // callback(model);
//     };
//
//     return (
//         <div onClick={onClickWholeExpression}>
//             {lhs}
//
//             {rhs}
//         </div>
//     );
// }
