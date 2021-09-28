// import React from "react";
//
// import * as c from "../../../constants";
// import {Expression, StringTemplate} from "../../../models/definitions";
// import {getSuggestionsBasedOnExpressionKind} from "../../../utils";
// import {ExpressionComponent} from "../../Expression";
// import {statementEditorStyles} from "../../ViewContainer/styles";
//
// interface StringTemplateProps {
//     model: Expression
//     callBack: (suggestions: string[], model: Expression, operator: boolean) => void
// }
//
// export function StringTemplateC(props: StringTemplateProps) {
//     const overlayClasses = statementEditorStyles();
//     const {model, callBack} = props;
//     let expression: any;
//     let expressionComponent: any;
//
//     if (model.kind === c.STRING_TEMPLATE) {
//         const stringTemplateModel: StringTemplate = model.expressionType as StringTemplate;
//         expression = stringTemplateModel.exp
//         expressionComponent = <ExpressionComponent model={expression} callBack={callBack} isRoot={false}/>;
//     }
//
//     const onClickOnExpression = (model: Expression, e: any) => {
//         e.stopPropagation()
//         callBack(getSuggestionsBasedOnExpressionKind(c.STRING_TEMPLATE), model, false)
//     };
//
//     return (
//         <span>
//             <span
//                 className={`${overlayClasses.AppExpressionBlock} ${overlayClasses.AppExpressionBlockDisabled}`}
//             >
//                 &nbsp;&nbsp;string `&nbsp;&nbsp;
//             </span>
//             <input
//                 type="text"
//                 id="literal"
//                 name="literal"
//                 onClick={(e) => onClickOnExpression(expression, e)}
//                 className="literal-input"
//             />
//             <span
//                 className={`${overlayClasses.AppExpressionBlock} ${overlayClasses.AppExpressionBlockDisabled}`}
//             >
//                 &nbsp;&nbsp;`&nbsp;&nbsp;
//             </span>
//         </span>
//     );
// }
export {};
