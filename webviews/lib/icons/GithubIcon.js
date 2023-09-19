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
export const GithubIcon = (props) => {
    const { color = "var(--vscode-foreground)" } = props, rest = __rest(props, ["color"]);
    return (React.createElement("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: "auto", height: "100%", viewBox: "0 0 50 50", preserveAspectRatio: "xMidYMid" }, rest),
        React.createElement("path", { fill: color, d: "M 24.925781 0 C 11.140625 0 0 11.457031 0 25.632812 C 0 36.964844 7.140625 46.558594 17.042969 49.953125 C 18.28125 50.207031 18.734375 49.398438 18.734375 48.722656 C 18.734375 48.128906 18.695312 46.089844 18.695312 43.96875 C 11.761719 45.496094 10.316406 40.910156 10.316406 40.910156 C 9.203125 37.941406 7.550781 37.175781 7.550781 37.175781 C 5.28125 35.605469 7.71875 35.605469 7.71875 35.605469 C 10.234375 35.777344 11.554688 38.238281 11.554688 38.238281 C 13.78125 42.144531 17.375 41.039062 18.816406 40.359375 C 19.023438 38.707031 19.683594 37.558594 20.386719 36.921875 C 14.855469 36.328125 9.039062 34.121094 9.039062 24.277344 C 9.039062 21.472656 10.027344 19.183594 11.597656 17.402344 C 11.347656 16.765625 10.480469 14.132812 11.84375 10.609375 C 11.84375 10.609375 13.949219 9.929688 18.695312 13.242188 C 20.726562 12.679688 22.820312 12.394531 24.925781 12.390625 C 27.03125 12.390625 29.175781 12.691406 31.15625 13.242188 C 35.902344 9.929688 38.007812 10.609375 38.007812 10.609375 C 39.371094 14.132812 38.503906 16.765625 38.253906 17.402344 C 39.863281 19.183594 40.8125 21.472656 40.8125 24.277344 C 40.8125 34.121094 34.996094 36.285156 29.421875 36.921875 C 30.332031 37.730469 31.117188 39.257812 31.117188 41.675781 C 31.117188 45.113281 31.074219 47.871094 31.074219 48.722656 C 31.074219 49.398438 31.527344 50.207031 32.765625 49.953125 C 42.671875 46.554688 49.808594 36.964844 49.808594 25.632812 C 49.851562 11.457031 38.667969 0 24.925781 0 Z M 24.925781 0 " })));
};
//# sourceMappingURL=GithubIcon.js.map