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

import React, { useEffect, useRef } from "react";
import { ConsoleAPI, TestCommand, TestResult, Queries } from "../ConsoleAPI";
import { VSCodeButton, VSCodeTextField, VSCodeProgressRing } from '@vscode/webview-ui-toolkit/react';
import { } from '@vscode/webview-ui-toolkit';
import styled from "@emotion/styled";
import Welcome from './Welcome';
import { Codicon } from '../Codicon/Codicon';
import ScrollToBottom from "react-scroll-to-bottom";
import { css } from "@emotion/css";
import TestResultView from "./TestResultView";


const Command = styled.div({
    backgroundColor: "var(--vscode-chat-requestBackground)",
    borderBottom: "1px solid var(--vscode-chat-requestBorder)",
    borderTop: "1px solid var(--vscode-chat-requestBorder)",
    padding: "0 20px"
});

const Layout = styled.div({
    position: "relative",
    color: "var(--vscode-editorCodeLens-foreground)",
    height: "100vh",
    overflow: "auto"
});

const CommandPanel = styled.div({
    display: "flex",
    flexDirection: "column",
    borderTop: "1px solid var(--vscode-panel-border)",
    padding: "15px",
});

const DisplayPanel = styled.div({
    height: "calc(100% - 90px)",
    overflow: "auto",
});

const FlexRow = styled.div({
    display: "flex",
    flexDirection: "row",
});

const SmallProgressRing = styled(VSCodeProgressRing)`
    height: calc(var(--design-unit) * 3px);
    width: calc(var(--design-unit) * 3px);
    margin-top: auto;
    padding: 4px;
`;

const StatusMessage = styled.div({
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: "6px",
    padding: "10px",
    marginLeft: "8px"
});

const ROOT_CSS = css({
    height: "100%",
});

const APIChat = (props: {
    state: string,
    logs: (TestCommand | TestResult)[],
    queries: Queries[]
    showAuthForm: () => void;
}) => {

    const [testInput, setTestInput] = React.useState("");


    const handleExecuteTest = (event: any, state: string) => {
        if (state === "ready") {
            if (event.key === "Enter" && testInput !== "") {
                ConsoleAPI.getInstance().executeTest(testInput);
                setTestInput("");
            }
        }
    };

    const handleExecuteButton = () => {
        ConsoleAPI.getInstance().executeTest(testInput);
        setTestInput("");
    }

    const handleScenarioTest = (query: string) => {
        ConsoleAPI.getInstance().executeTest(query);
    }

    const handleInputChange = (event: any) => {
        setTestInput(event.target.value);
    };

    const inputReference = useRef(null);

    useEffect(() => {
        // ignore following tyescript error
        // @ts-ignore
        inputReference.current.focus();
    }, []);

    return (
        <Layout>
            <DisplayPanel>
                <ScrollToBottom className={ROOT_CSS}>
                    <>
                        <Welcome state={props.state} queries={props.queries} handleScenarioTest={handleScenarioTest} />
                        {props.logs.map((log) => {
                            if (log.type === "COMMAND") {
                                return <Command>
                                    <p><Codicon name="beaker" />&nbsp; {log.command}</p>
                                </Command>;
                            }
                            if (log.type === "RESULT") {
                                return <TestResultView log={log} />
                            }
                            return null;
                        })
                        }
                    </>
                    {props.state === "executing.initExecution" && (
                        <StatusMessage>
                            <SmallProgressRing />
                            <div>Executing initExecution...</div>
                        </StatusMessage>
                    )}
                    {props.state === "executing.fetchRequest" && (
                        <StatusMessage>
                            <SmallProgressRing />
                            <div>Executing fetchRequest...</div>
                        </StatusMessage>
                    )}
                    {props.state === "executing.executeRequest" && (
                        <StatusMessage>
                            <SmallProgressRing />
                            <div>Executing executeRequest...</div>
                        </StatusMessage>
                    )}
                    {props.state === "executing.processRequest" && (
                        <StatusMessage>
                            <SmallProgressRing />
                            <div>Executing processRequest...</div>
                        </StatusMessage>
                    )}
                    {props.state === "executing.end" && (
                        <StatusMessage>
                            <SmallProgressRing />
                            <div>Executing end...</div>
                        </StatusMessage>
                    )}
                </ScrollToBottom>
            </DisplayPanel>
            <CommandPanel>
                <FlexRow>
                    <VSCodeTextField
                        value={testInput}
                        onInput={handleInputChange}
                        onKeyDown={(event) => handleExecuteTest(event, props.state)}
                        placeholder="Type a command to test"
                        innerHTML="true"
                        style={{ width: "calc(100% - 35px)" }}
                        ref={inputReference}
                    >
                    </VSCodeTextField>
                    <VSCodeButton
                        appearance="secondary"
                        disabled={props.state !== "ready"}
                        onClick={handleExecuteButton}
                        style={{ width: "35px" }}>
                        <span className="codicon codicon-send"></span>
                    </VSCodeButton>
                </FlexRow>
                <FlexRow style={{ marginTop: "10px" }}>
                    <VSCodeButton style={{ marginRight: "20px" }} appearance="icon"><Codicon name="link" /> &nbsp;Change Endpoint</VSCodeButton>
                    <VSCodeButton appearance="icon" onClick={props.showAuthForm}><Codicon name="lock" /> &nbsp; Authenticate</VSCodeButton>
                </FlexRow>
            </CommandPanel>
        </Layout>
    );
}

export default APIChat;
