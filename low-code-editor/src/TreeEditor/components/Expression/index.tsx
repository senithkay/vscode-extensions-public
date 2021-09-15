// import React from "react";
// import { Expression } from "../../models/definitions";
// import { getExpressionTypeComponent, getSuggestionsBasedOnExpressionKind } from "../../utils";
// import * as c from "../../constants";
//
// interface ExpressionComponentProps {
//     model: Expression
//     callBack: (suggestions: string[], model: Expression, operator: boolean) => void
//     isRoot: boolean
// }
//
//
// export function ExpressionComponent(props: ExpressionComponentProps) {
//     const { model, callBack, isRoot } = props;
//
//     const component = getExpressionTypeComponent(model, callBack);
//
//     const onClickOnRootExpression = (model: Expression, e: any) => {
//         e.stopPropagation()
//         callBack(getSuggestionsBasedOnExpressionKind(c.DEFAULT_BOOL), model, false)
//     };
//
//     return (
//         <span>
//             {
//                 isRoot ?
//                     <span className="App-expression-block App-expression-block-disabled">
//                         {"if"}
//                     </span> : null
//             }
//             {
//                 isRoot ?
//                     <button className="template-button" onClick={(e) => onClickOnRootExpression(model, e)}>
//                         {component}
//                     </button> :
//                     <span>
//                         {component}
//                     </span>
//             }
//             {
//                 isRoot ?
//                     <span className="App-expression-block App-expression-block-disabled">
//                         &nbsp;{"{"}
//                         <br />
//                         &nbsp;&nbsp;&nbsp;{"..."}
//                         <br />
//                         {"} "}
//                         <button className="add-new-expression"> + </button>
//                         {" else {"}
//                         <br />
//                         &nbsp;&nbsp;&nbsp;{"..."}
//                         <br />
//                         {"}"}
//                     </span> : null
//             }
//         </span>
//     );
// }
