// import React from "react";
// import { Expression } from "../../models/definitions";
// import { addExpression, addOperator } from "../../utils/utils";
//
// import '../MainContainer/styles.css';
//
// interface SuggestionsProps {
//     model: Expression
//     suggestions: string[],
//     operator: boolean,
//     callBack: (model: Expression) => void
// }
//
// export function Suggestions(props: SuggestionsProps) {
//     const { model, suggestions, operator, callBack } = props;
//
//     const onClickSuggestion = (kind: string, operator: boolean, model: Expression) => {
//         if (operator) {
//             addOperator(model, kind)
//         } else {
//             addExpression(model, kind);
//         }
//         callBack(model)
//
//     }
//
//     return (
//         <div className="App-suggestion-block">
//             {suggestions.map((suggetion, index) => (
//
//                 <button className="suggestion-buttons" key={index} onClick={() => onClickSuggestion(suggetion, operator, model)}>
//                     {/* {operator ? suggetion : suggetion.substring(0, suggetion.length - 1)} */}
//                     {suggetion.substring(0, suggetion.length - 1)}
//                 </button>
//             ))}
//         </div>
//     );
// }
