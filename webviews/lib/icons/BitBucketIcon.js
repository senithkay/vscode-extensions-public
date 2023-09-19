/*
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import * as React from "react";
export const BitBucketIcon = (props) => {
    const { color = "var(--vscode-foreground)" } = props, rest = __rest(props, ["color"]);
    return (React.createElement("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: "auto", height: "100%", viewBox: "0 0 50 50", preserveAspectRatio: "xMidYMid", style: { transform: "scale(1.4)" }, fill: "none" }, rest),
        React.createElement("path", { fill: "url(#a)", d: "M 42.109375 19.113281 L 30.871094 19.113281 L 28.996094 30.167969 L 21.191406 30.167969 L 12.011719 41.09375 C 12.011719 41.09375 12.449219 41.46875 13.074219 41.46875 L 37.550781 41.46875 C 38.113281 41.46875 38.613281 41.03125 38.738281 40.46875 Z M 42.109375 19.113281 " }),
        React.createElement("path", { fill: color, d: "M 7.453125 7.8125 C 6.703125 7.8125 6.140625 8.5 6.265625 9.1875 L 11.324219 40.15625 C 11.386719 40.53125 11.574219 40.90625 11.886719 41.15625 C 11.886719 41.15625 12.324219 41.53125 12.949219 41.53125 L 22.441406 30.167969 L 21.128906 30.167969 L 19.066406 19.113281 L 42.109375 19.113281 L 43.734375 9.1875 C 43.859375 8.4375 43.296875 7.8125 42.546875 7.8125 Z M 7.453125 7.8125 " }),
        React.createElement("defs", null,
            React.createElement("linearGradient", { id: "a", x1: 27.898, x2: 16.618, y1: 15.387, y2: 23.023, gradientUnits: "userSpaceOnUse" },
                React.createElement("stop", { offset: 0.072, stopColor: color, stopOpacity: 0.4 }),
                React.createElement("stop", { offset: 1, stopColor: color })))));
};
//# sourceMappingURL=BitBucketIcon.js.map