/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect } from "react";
import { ConsoleAPI, StateChangeEvent, TestCommand, TestResult, Queries } from "./ConsoleAPI";
import { VSCodeButton, VSCodeTextField } from '@vscode/webview-ui-toolkit/react';
import { } from '@vscode/webview-ui-toolkit';
import styled from "@emotion/styled";
import ScrollToBottom from 'react-scroll-to-bottom';
import { css } from "@emotion/css";
import ReactJson, { ThemeKeys } from 'react-json-view'

const ConsoleWrapper = styled.div({
    padding: "10px 20px 30px 20px",
    color: "var(--vscode-editorCodeLens-foreground)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
});

const Headline = styled.div({
    display: "flex",
    alignItems: "center"
});

const TestCommandWrapper = styled.div({
});

const TestTitleWrapper = styled.div({
    marginBottom: "10px",
    marginTop: "20px"
});

const TestResultBlock = styled.div({
    marginBottom: "30px",
    marginTop: "10px"
});

const TestResultHeader = styled.div({

});


const ROOT_CSS = css({
    height: '100vh',
});

const Tag = css({
    display: 'inline-block',
    textDecoration: 'bold',
    padding: "4px 10px"
});

const GetTag = css(Tag, {
    color: '#FFF', // GET color
    backgroundColor: '#3d7eff', // GET background color
});

const PutTag = css(Tag, {
    color: '#FFF', // UT color
    backgroundColor: '#49cc90', // UT background color
});

const PostTag = css(Tag, {
    color: '#FFF', // POST color
    backgroundColor: '#fca130', // POST background color
});

const DeleteTag = css(Tag, {
    color: '#FFF', // DELETE color
    backgroundColor: '#f93e3e', // DELETE background color
});

const PatchTag = css(Tag, {
    color: '#FFF', // PATCH color
    backgroundColor: '#986ee2', // PATCH background color
});

const Scenario = styled.div({
    paddingBottom: '5px',
    backgroundColor: 'var(--vscode-sideBar-background)', // Card background color
    borderRadius: '4px', // Card border radius
    padding: '10px', // Card padding
    marginBottom: '10px', // Card margin bottom
    borderColor: 'var(--vscode-sideBar-border)', // Card border color
    cursor: "pointer",
    '&:hover': {
        backgroundColor: 'var(--vscode-list-hoverBackground)'
    }

});

const ScenarioTitle = styled.div({
    fontWeight: "bolder"
});

const ClearBtn = styled(VSCodeButton)`
    margin-left: auto;
    display: flex;
    justify-content: center;
    height: 10px;
    width: 10px;
    padding: 5px;
`;

function getColorTheme(): ThemeKeys {
    const body = document.querySelector('body');
    if (body) {
        const classes = body.classList;
        if (classes.contains('vscode-dark')) {
            return "bright";
        } else if (classes.contains('vscode-light')) {
            return "bright:inverted";
        }
    }
    return "bright";
}



function Webview() {
    const [testInput, setTestInput] = React.useState("");
    const [state, setState] = React.useState("");
    const [logs, setLogs] = React.useState<(TestCommand | TestResult)[]>([]);
    const [queries, setQueries] = React.useState<Queries[]>([]);

    useEffect(() => {
        ConsoleAPI.getInstance().onStateChanged((state: StateChangeEvent) => {
            setState(state.state);
            setLogs(state.logs);
            setQueries(state.queries);
        });
    }, [state, logs]);

    const handleExecuteTest = (event: any) => {
        if (event.key === "Enter" && testInput !== "") {
            ConsoleAPI.getInstance().executeTest(testInput);
            setTestInput("");
        }
    };

    const handleScenarioTest = (query: string) => {
        ConsoleAPI.getInstance().executeTest(query);
    }

    const handleInputChange = (event: any) => {
        setTestInput(event.target.value);
    };

    const clearLogs = () => {
        ConsoleAPI.getInstance().clearTestLogs();
    }

    useEffect(() => {
        console.log("trigger");
        // Set state when component loads
        ConsoleAPI.getInstance().getState()
            .then((newState: string) => {
                console.log(newState);
                setState(newState);
            });
    }, []);

    return (<>
        <ScrollToBottom className={ROOT_CSS}>
            <ConsoleWrapper>
                <Headline>
                    <h2>Test your APIs with natural language</h2>
                    {state !== "loading" &&
                        <>
                            <ClearBtn
                                appearance="icon"
                                onClick={() => clearLogs()}
                                title="Clear logs"
                                disabled={(!logs.length) || (state === "executing")}
                                id='clear-btn'
                            >
                                <i className="codicon codicon-clear-all" aria-hidden="true"></i>
                            </ClearBtn>
                        </>
                    }
                </Headline>
                <>
                    {queries && queries.length > 0 && state !== "loading" && <>
                        <p>Click on the following scenarios to try out</p>
                        {queries.map((query, index) => {
                            return (
                                <React.Fragment key={index}>
                                    <Scenario onClick={() => handleScenarioTest(query.query)}>
                                        <ScenarioTitle>{query.scenario}</ScenarioTitle>
                                        <div> {query.query}</div>
                                    </Scenario>
                                </React.Fragment>
                            );
                        })}
                        {logs && logs.length === 0 &&
                            <>
                                <p>Or</p>
                            </>
                        }
                    </>
                    }
                </>
                {logs.map((log) => {
                    if (log.type === "COMMAND") {
                        return <TestTitleWrapper>
                            <h3>{log.command}</h3>
                        </TestTitleWrapper>;
                    }
                    if (log.type === "RESULT") {
                        return <TestResultBlock>
                            <TestResultHeader>
                                <div className={switchTagClass(log.request.method)}>{log.request.method}</div>
                                <span>&nbsp; &nbsp;{log.request.path}</span>
                            </TestResultHeader>
                            {log.request.inputs.requestBody &&
                                <>
                                    <h4>Request</h4>
                                    <ReactJson
                                        style={{ backgroundColor: "none" }}
                                        src={log.request.inputs.requestBody}
                                        collapsed
                                        collapseStringsAfterLength={40}
                                        theme={getColorTheme()} />
                                </>
                            }
                            <h4>Response {log.output.code}</h4>
                            <ReactJson
                                style={{ backgroundColor: "none" }}
                                src={log.output.payload}
                                collapsed
                                collapseStringsAfterLength={40}
                                theme={getColorTheme()} />
                        </TestResultBlock>;
                    }
                    return null;
                })}
                {state === "ready" &&
                    <TestCommandWrapper>
                        <VSCodeTextField
                            value={testInput}
                            onInput={handleInputChange}
                            onKeyDown={handleExecuteTest}
                            placeholder="Type a command to test"
                            style={{ width: "100%" }}></VSCodeTextField>
                    </TestCommandWrapper>
                }
                {state === "executing" &&
                    <div>Executing.... </div>}
                {state === "error" &&
                    <div>An error occured please retry again </div>}
                {state === "loading" &&
                    <div>Analysing OpenAPI, Please wait ...</div>}
            </ConsoleWrapper>
        </ScrollToBottom>
    </>
    );
}

function switchTagClass(type: string) {
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