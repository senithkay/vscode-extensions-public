/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */
// tslint:disable: jsx-no-multiline-js

import React, { useEffect, useState } from 'react';

import { Button } from "@material-ui/core";
import {
    CheckBoxGroup,
    FormTextInput
} from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";
import debounce from "lodash.debounce";

import { useStyles } from "./styles";

export interface PayloadEditorProps {
    requestName: string;
    headersName: string;
    callerName: string;
    requestSemDiag?: string;
    callerSemDiag?: string;
    headersSemDiag?: string;
    syntaxDiag?: string;
    readonly?: boolean;
    onChange: (requestName: string, headerName: string, callerName: string) => void
}

export function AdvancedParamEditor(props: PayloadEditorProps) {
    const { requestName, callerName, headersName, headersSemDiag, requestSemDiag, callerSemDiag, readonly,
            syntaxDiag, onChange } = props;

    const classes = useStyles();
    const [isMore, setIsMore] = useState<boolean>((requestName !== undefined) || (headersName !== undefined)
        || (callerName !== undefined));
    const [isRequestSelected, setIsRequestSelected] = useState<boolean>(requestName !== undefined);
    const [isCallerSelected, setIsCallerSelected] = useState<boolean>(callerName !== undefined);
    const [isHeadersSelected, setIsHeadersSelected] = useState<boolean>(headersName !== undefined);

    // States related to syntax diagnostics
    const [currentComponentName, setCurrentComponentName] = useState<string>("");

    const handleMoreSelect = () => {
        setIsMore(!isMore);
    };
    const handleRequestSelect = (text: string[]) => {
        setCurrentComponentName("ReqName");
        if (text) {
            if (text.length > 0) {
                setIsRequestSelected(true);
                onChange("request", headersName, callerName);
            } else {
                setIsRequestSelected(false);
                onChange("", headersName, callerName);
            }
        }
    }
    const handleCallerSelect = (text: string[]) => {
        setCurrentComponentName("CallerName");
        if (text) {
            if (text.length > 0) {
                setIsCallerSelected(true);
                onChange(requestName, headersName, "caller");
            } else {
                setIsCallerSelected(false);
                onChange(requestName, headersName, "");
            }
        }
    }
    const handleHeadersSelect = async (text: string[]) => {
        setCurrentComponentName("HeadersName");
        if (text.length > 0) {
            setIsHeadersSelected(true);
            onChange(requestName, "headers", callerName);
        } else {
            setIsHeadersSelected(false);
            onChange(requestName, "", callerName);
        }
    }
    const handleRequestChange = (text: string) => {
        setCurrentComponentName("ReqName");
        onChange(text, headersName, callerName);
    }
    const debouncedRequestChange = debounce(handleRequestChange, 800);
    const handleHeadersChange = (text: string) => {
        setCurrentComponentName("HeadersName");
        onChange(requestName, text, callerName);
    }
    const debouncedHeadersChange = debounce(handleHeadersChange, 800);
    const handleCallerChange = (text: string) => {
        setCurrentComponentName("CallerName");
        onChange(requestName, headersName, text);
    }
    const debouncedCallerChange = debounce(handleCallerChange, 800);
    const resetCurrentComponent = (text: string) => {
        setCurrentComponentName("");
    }

    useEffect(() => {
        setIsRequestSelected(requestName !== undefined);
        setIsHeadersSelected(headersName !== undefined);
        setIsCallerSelected(callerName !== undefined);
        if (requestName !== undefined || (headersName !== undefined) || (callerName !== undefined)) {
            // Setting more option if we have values in advanced params
            setIsMore(true);
        }
    }, [callerName, headersName, requestName]);

    return (
        <div>
            <Button className={classes.listOptionalBtn} onClick={handleMoreSelect}>
                {isMore ? "Hide" : "Show"}
            </Button>
            {isMore && (
                <div className={classes.advancedParamContent}>
                    <div className={classes.advancedItem}>
                        <CheckBoxGroup
                            values={["Add Request"]}
                            defaultValues={!isRequestSelected ? [] : ['Add Request']}
                            withMargins={false}
                            onChange={handleRequestSelect}
                        />
                        {isRequestSelected && (
                            <FormTextInput
                                label="Request Name"
                                dataTestId="request-name"
                                defaultValue={requestName}
                                onChange={debouncedRequestChange}
                                onBlur={resetCurrentComponent}
                                customProps={{
                                    isErrored: (syntaxDiag !== "" && currentComponentName === "ReqName")
                                        || (requestSemDiag !== "" && requestSemDiag !== undefined)
                                }}
                                errorMessage={((currentComponentName === "ReqName" && syntaxDiag ? syntaxDiag : "")
                                    || requestSemDiag)}
                                placeholder={"Enter Name"}
                                size="small"
                                disabled={(syntaxDiag && currentComponentName !== "ReqName") || readonly}
                            />
                        )}
                    </div>
                    <div className={classes.advancedItem}>
                        <CheckBoxGroup
                            values={["Add Caller"]}
                            defaultValues={!isCallerSelected ? [] : ['Add Caller']}
                            withMargins={false}
                            onChange={handleCallerSelect}
                        />
                        {isCallerSelected && (
                            <FormTextInput
                                label="Caller Name"
                                dataTestId="caller-name"
                                defaultValue={callerName}
                                onChange={debouncedCallerChange}
                                onBlur={resetCurrentComponent}
                                customProps={{
                                    isErrored: (syntaxDiag !== "" && currentComponentName === "CallerName")
                                        || (callerSemDiag !== "" && callerSemDiag !== undefined)
                                }}
                                errorMessage={((currentComponentName === "CallerName" && syntaxDiag ? syntaxDiag : "")
                                    || callerSemDiag)}
                                placeholder={"Enter Name"}
                                size="small"
                                disabled={(syntaxDiag && currentComponentName !== "CallerName") || readonly}
                            />
                        )}
                    </div>
                    <div className={classes.advancedItem}>
                        <CheckBoxGroup
                            values={["Get all Headers"]}
                            defaultValues={!isHeadersSelected ? [] : ['Get all Headers']}
                            withMargins={false}
                            onChange={handleHeadersSelect}
                        />
                        {isHeadersSelected && (
                            <FormTextInput
                                label="Headers Name"
                                dataTestId="headers-name"
                                defaultValue={headersName}
                                onChange={debouncedHeadersChange}
                                onBlur={resetCurrentComponent}
                                customProps={{
                                    isErrored: (syntaxDiag !== "" && currentComponentName === "HeadersName")
                                        || (headersSemDiag !== "" && headersSemDiag !== undefined)
                                }}
                                errorMessage={((currentComponentName === "HeadersName" && syntaxDiag ? syntaxDiag : "")
                                    || headersSemDiag)}
                                placeholder={"Enter Name"}
                                size="small"
                                disabled={(syntaxDiag && currentComponentName !== "HeadersName") || readonly}
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
