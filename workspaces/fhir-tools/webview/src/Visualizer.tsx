/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, {useEffect} from "react";
import { Loading } from "./Components/Loading";
import { Retry } from "./Components/Retry";
import { FHIROutput } from "./Components/FHIROutput";
import { WebViewRPC, StateChangeEvent } from "./WebViewRPC";

export function Webview() {
    const [state, setState] = React.useState('initialize');
    const [theme, setTheme] = React.useState('dark');
    const [errorMessage, setErrorMessage] = React.useState<string>("");
    const [outputData, setOutputData] = React.useState<string>("");

    useEffect(() => {
        WebViewRPC.getInstance().onStateChanged((stateChangeEvent: StateChangeEvent) => {
            if (stateChangeEvent.state === 'themeChanged' && state === 'DisplayOutput'){
                setTheme(stateChangeEvent.theme);
                return;
            } else{
                console.log('Current State: '+state);
                setState(stateChangeEvent.state);
                setTheme(stateChangeEvent.theme);
                setErrorMessage(stateChangeEvent.errorMessage || "");
                setOutputData(stateChangeEvent.outputData || "");
            }
        });
    }, [state, theme, errorMessage, outputData]);

    return (
        <>
            {(() => {
                switch (state) {
                    case 'initialize':
                        return <Loading />;
                    case 'Loading':
                        return <Loading />;
                    case 'DisplayOutput':
                        return <FHIROutput code={outputData} theme={theme} />;
                    case 'Error':
                        return <Retry errorMessage={errorMessage} />;
                    default:
                        console.error('Invalid state: '+state);
                        return <Loading />;
                }
            })()}
        </>
    );
};
