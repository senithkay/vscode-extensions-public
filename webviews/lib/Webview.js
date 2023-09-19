/*
 *  Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
 *
 *  This software is the property of WSO2 LLC. and its suppliers, if any.
 *  Dissemination of any information or reproduction of any material contained
 *  herein is strictly forbidden, unless permitted by WSO2 in accordance with
 *  the WSO2 Commercial License available at http://wso2.com/licenses.
 *  For specific language governing the permissions and limitations under
 *  this license, please see the license as well as any agreement you’ve
 *  entered into with WSO2 governing the purchase of this software and any
 *  associated services.
 */
import React, { useEffect } from "react";
import { ConsoleAPI } from "./ConsoleAPI";
import { VSCodeTextField } from '@vscode/webview-ui-toolkit/react';
import styled from "@emotion/styled";
import ScrollToBottom from 'react-scroll-to-bottom';
import { css } from "@emotion/css";
import ReactJson from 'react-json-view';
const ConsoleWrapper = styled.div({
    padding: "10px 20px 20px 20px",
    color: "var(--vscode-editorCodeLens-foreground)"
});
const TestCommandWrapper = styled.div({});
const TestTitleWrapper = styled.div({
    marginBottom: "10px",
    marginTop: "20px"
});
const TestResultBlock = styled.div({
    marginBottom: "30px",
    marginTop: "10px"
});
const TestResultHeader = styled.div({});
const ROOT_CSS = css({
    height: '100vh',
});
const Tag = css({
    display: 'inline-block',
    textDecoration: 'bold',
    padding: "4px 10px"
});
const GetTag = css(Tag, {
    color: '#FFF',
    backgroundColor: '#3d7eff', // GET background color
});
const PutTag = css(Tag, {
    color: '#FFF',
    backgroundColor: '#49cc90', // UT background color
});
const PostTag = css(Tag, {
    color: '#FFF',
    backgroundColor: '#fca130', // POST background color
});
const DeleteTag = css(Tag, {
    color: '#FFF',
    backgroundColor: '#f93e3e', // DELETE background color
});
const PatchTag = css(Tag, {
    color: '#FFF',
    backgroundColor: '#986ee2', // PATCH background color
});
const Scenario = styled.div({
    paddingBottom: '5px',
    backgroundColor: 'var(--vscode-sideBar-background)',
    borderRadius: '4px',
    padding: '10px',
    marginBottom: '10px',
    borderColor: 'var(--vscode-sideBar-border)',
    cursor: "pointer",
    '&:hover': {
        backgroundColor: 'var(--vscode-list-hoverBackground)'
    }
});
const ScenarioTitle = styled.div({
    fontWeight: "bolder"
});
function getColorTheme() {
    const body = document.querySelector('body');
    if (body) {
        const classes = body.classList;
        if (classes.contains('vscode-dark')) {
            return "bright";
        }
        else if (classes.contains('vscode-light')) {
            return "bright:inverted";
        }
    }
    return "bright";
}
function Webview() {
    const [testInput, setTestInput] = React.useState("");
    const [state, setState] = React.useState("");
    const [logs, setLogs] = React.useState([]);
    const [queries, setQueries] = React.useState([]);
    useEffect(() => {
        ConsoleAPI.getInstance().onStateChanged((state) => {
            setState(state.state);
            setLogs(state.logs);
            setQueries(state.queries);
        });
    }, [state, logs]);
    const handleExecuteTest = (event) => {
        if (event.key === "Enter" && testInput !== "") {
            ConsoleAPI.getInstance().executeTest(testInput);
            setTestInput("");
        }
    };
    const handleScenarioTest = (query) => {
        ConsoleAPI.getInstance().executeTest(query);
    };
    const handleInputChange = (event) => {
        setTestInput(event.target.value);
    };
    useEffect(() => {
        console.log("trigger");
        // Set state when component loads
        ConsoleAPI.getInstance().getState()
            .then((newState) => {
            console.log(newState);
            setState(newState);
        });
    }, []);
    return (React.createElement(React.Fragment, null,
        React.createElement(ScrollToBottom, { className: ROOT_CSS },
            React.createElement(ConsoleWrapper, null,
                React.createElement("h2", null, "Test your APIs with natural language"),
                React.createElement(React.Fragment, null, queries && queries.length > 0 && state !== "loading" && React.createElement(React.Fragment, null,
                    React.createElement("p", null, "Click on the following scenarios to try out"),
                    queries.map((query, index) => {
                        return (React.createElement(React.Fragment, { key: index },
                            React.createElement(Scenario, { onClick: () => handleScenarioTest(query.query) },
                                React.createElement(ScenarioTitle, null, query.scenario),
                                React.createElement("div", null,
                                    " ",
                                    query.query))));
                    }),
                    logs && logs.length === 0 &&
                        React.createElement(React.Fragment, null,
                            React.createElement("p", null, "Or")))),
                logs.map((log) => {
                    if (log.type === "COMMAND") {
                        return React.createElement(TestTitleWrapper, null,
                            React.createElement("h3", null, log.command));
                    }
                    if (log.type === "RESULT") {
                        return React.createElement(TestResultBlock, null,
                            React.createElement(TestResultHeader, null,
                                React.createElement("div", { className: switchTagClass(log.request.method) }, log.request.method),
                                React.createElement("span", null,
                                    "\u00A0 \u00A0",
                                    log.request.path)),
                            log.request.inputs.requestBody &&
                                React.createElement(React.Fragment, null,
                                    React.createElement("h4", null, "Request"),
                                    React.createElement(ReactJson, { style: { backgroundColor: "none" }, src: log.request.inputs.requestBody, collapsed: true, collapseStringsAfterLength: 40, theme: getColorTheme() })),
                            React.createElement("h4", null,
                                "Response ",
                                log.output.code),
                            React.createElement(ReactJson, { style: { backgroundColor: "none" }, src: log.output.payload, collapsed: true, collapseStringsAfterLength: 40, theme: getColorTheme() }));
                    }
                    return null;
                }),
                state === "ready" &&
                    React.createElement(TestCommandWrapper, null,
                        React.createElement(VSCodeTextField, { value: testInput, onInput: handleInputChange, onKeyDown: handleExecuteTest, placeholder: "Type a command to test", style: { width: "100%" } })),
                state === "executing" &&
                    React.createElement("div", null, "Executing.... "),
                state === "error" &&
                    React.createElement("div", null, "An error occured please retry again "),
                state === "loading" &&
                    React.createElement("div", null, "Analysing OpenAPI, Please wait ...")))));
}
function switchTagClass(type) {
    switch (type) {
        case "GET":
            return GetTag;
        case "PUT":
            return PutTag;
        case "POST":
            return PostTag;
        case "DELETE":
            return DeleteTag;
        case "PATCH":
            return PatchTag;
        default:
            return "";
    }
}
export default Webview;
//# sourceMappingURL=Webview.js.map