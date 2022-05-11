import React, { useContext, useEffect } from "react";

import { Checkbox, IconButton, ListItem, ListItemText, ListSubheader, Typography } from "@material-ui/core";
import { AddCircleOutline } from "@material-ui/icons";
import { ParameterInfo } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { NamedArg, STKindChecker, STNode } from "@wso2-enterprise/syntax-tree";

import { EXPR_CONSTRUCTOR, SymbolParameterType } from "../../../constants";
import { StatementEditorContext } from "../../../store/statement-editor-context";
import { keywords } from "../../../utils/statement-modifications";
import { useStatementEditorStyles } from "../../styles";
import { NamedArgIncludedRecord } from "../NamedArgIncludedRecord";
import { RequiredArg } from "../RequiredArg";
// tslint:disable: jsx-no-multiline-js jsx-no-lambda
export interface ParameterListProps {
    checkedList : any[]
    setCheckedList : (list : any[]) => void
    paramsInModel?: STNode[]
}
export function ParameterList(props: ParameterListProps) {
    const { checkedList, setCheckedList } = props;
    const statementEditorClasses = useStatementEditorStyles();
    const {
        modelCtx: {
            currentModel,
            statementModel,
            updateModel,
            restArg
        },
        documentation
    } = useContext(StatementEditorContext);
    let includedRecordHeader: boolean = false;
    let isNewRecordBtnClicked : boolean = false;
    const stmodel = statementModel;
    const [plusButtonClick, setPlusButtonClicked] = React.useState(false);
    /*const paramsInModel2: STNode[] = [];
    useEffect(() => {
        if (currentModel.model) {
            if (STKindChecker.isFunctionCall(currentModel.model)) {
                currentModel.model.arguments.forEach((parameter: any) => {
                    if (!parameter.isToken) {
                        paramsInModel2.push(parameter);
                    }
                });
            }
        }
    }, [currentModel.model]);*/

    const handleCheckboxClick = (value: number, param?: ParameterInfo) => () => {
        const currentIndex = checkedList.indexOf(value);
        const newChecked = [...checkedList];

        if (currentIndex === -1) {
            newChecked.push(value);

            if (STKindChecker.isFunctionCall(currentModel.model)) {
                let funcParams: string = "";
                currentModel.model.arguments.forEach((parameter: any) => {
                    funcParams = funcParams + (parameter.isToken ? parameter.value : parameter.source);
                });

                if (param.kind === SymbolParameterType.DEFAULTABLE){
                    funcParams = funcParams + ", " +
                        (keywords.includes(param.name) ? `'${param.name} = ${EXPR_CONSTRUCTOR}` : `${param.name} = ${EXPR_CONSTRUCTOR}`);
                } else if (param.kind === SymbolParameterType.REST){
                    funcParams = funcParams + ", " + `${EXPR_CONSTRUCTOR}`;
                } else {
                    funcParams = funcParams + ", " + param.name;
                }

                const content: string = currentModel.model.functionName.source + "(" + funcParams + ")";
                if (param.kind === SymbolParameterType.REST){
                    restArg(true);
                }
                updateModel(content, currentModel.model.position);
            }
        } else {
            newChecked.splice(currentIndex, 1);
            if (STKindChecker.isFunctionCall(currentModel.model)) {
                const paramsList = currentModel.model.arguments;
                // removing the param and the comma infront of it
                paramsList.length > 1 ? paramsList.splice((currentIndex * 2) - 1, 2) : paramsList.splice(currentIndex, 1);

                let funcParams: string = "";
                paramsList.forEach((parameter: any) => {
                    funcParams = funcParams + (parameter.isToken ? parameter.value : parameter.source);
                });

                const content: string = currentModel.model.functionName.source + "(" + funcParams + ")";
                updateModel(content, currentModel.model.position);
            }
        }

        setCheckedList(newChecked);
    };

    const isAllowedIncludedArgsAdded = () : boolean => {
        const listIncludedParams: number[] = [];
        let isIncluded : boolean = false;
        documentation.documentation.parameters.map((docParam: ParameterInfo, value: number) => {
            if (docParam.kind === SymbolParameterType.INCLUDED_RECORD) {
                listIncludedParams.push(value);
            }
        });
        listIncludedParams.some((value => {
                isIncluded = checkedList.includes(value);
                if (!isIncluded){
                    return false;
                }
            }
        ))
        return isIncluded;
    }


    const addIncludedRecordHeader = (param: ParameterInfo, value: number) => {
        return(
            <>
                {!includedRecordHeader && (
                    <ListItem key={value} style={{ paddingTop: '0px', paddingBottom: '0px', alignItems: 'flex-start'}}>
                        <ListItemText style={{ flex: 'inherit', marginLeft: '9px' }} primary={"Add Named Argument"}/>
                        <IconButton style={{ paddingTop: '5px' }} onClick={handlePlusButton()} disabled={isAllowedIncludedArgsAdded()}>
                            <AddCircleOutline/>
                        </IconButton>
                    </ListItem>
                )}
                {includedRecordHeader = true}
            </>
        );
    }


    const handlePlusButton = () => () => {
        setPlusButtonClicked(true);
    }

    const addIncludedRecords = (param: ParameterInfo, value: number) => {

        const argList: STNode[] = [];
        if (currentModel.model) {
            if (STKindChecker.isFunctionCall(currentModel.model)) {
                currentModel.model.arguments.forEach((parameter: any) => {
                    if (!parameter.isToken) {
                        argList.push(parameter);
                    }
                });
            }
        }
        return (
            <>
                {checkedList.indexOf(value) !== -1 && (
                    <ListItem>
                        <Checkbox
                            classes={{
                                root : statementEditorClasses.parameterCheckbox,
                                checked : statementEditorClasses.checked
                            }}
                            style={{ flex: 'inherit' }}
                            checked={checkedList.indexOf(value) !== -1}
                            onClick={handleCheckboxClick(value, param)}
                        />
                        <ListItemText
                            style={{ flex: 'inherit' }}
                            primary={(argList[value] && STKindChecker.isNamedArg(argList[value])) ? (argList[value] as NamedArg).argumentName.source : param.name}
                        />
                    </ListItem>
                )}
            </>
        );
    }

    const addIncludedRecordToModel = (userInput: string, value: number) => {
        const newChecked = [...checkedList];
        const currentIndex = checkedList.indexOf(value);
        if (currentIndex === -1) {
            // isNewRecordBtnClicked = true;
            if (STKindChecker.isFunctionCall(currentModel.model)) {
                newChecked.push(value);
                let funcParams: string = "";
                currentModel.model.arguments.forEach((parameter: any) => {
                    funcParams = funcParams + (parameter.isToken ? parameter.value : parameter.source);
                });
                funcParams = funcParams + ", " + `${userInput} = ${EXPR_CONSTRUCTOR}`;
                const content: string = currentModel.model.functionName.source + "(" + funcParams + ")";
                updateModel(content, currentModel.model.position);
                setCheckedList(newChecked);
                setPlusButtonClicked(false);
            }
        }
    }

    return (
        <>
            {!!documentation.documentation.parameters?.length && (
                <>
                    <ListSubheader className={statementEditorClasses.parameterHeader}>
                        Parameter
                    </ListSubheader>
                    {documentation.documentation.parameters.map((param: ParameterInfo, value: number) => (
                            <>

                                {param.kind === SymbolParameterType.REQUIRED ? (
                                    <RequiredArg param={param} value={value} checkedList={checkedList}/>
                                ) : (
                                    <>
                                        {param.kind === SymbolParameterType.INCLUDED_RECORD ? (
                                            <>
                                                {addIncludedRecordHeader(param, value)}
                                                {addIncludedRecords(param, value)}
                                                {(checkedList.indexOf(value) === -1 && !isNewRecordBtnClicked) && (
                                                    <>
                                                        <NamedArgIncludedRecord
                                                            isNewRecord={plusButtonClick}
                                                            value={value}
                                                            addIncludedRecordToModel={addIncludedRecordToModel}
                                                        />
                                                        {isNewRecordBtnClicked = true}
                                                    </>
                                                )}
                                                {/*{isNewRecordBtnClicked = true}*/}
                                            </>
                                        ) : (
                                            <>
                                                {param.kind !== SymbolParameterType.INCLUDED_RECORD && (
                                                    <ListItem key={value} style={{ paddingTop: '0px', paddingBottom: '0px' }}>
                                                        <Checkbox
                                                            classes={{
                                                                root : statementEditorClasses.parameterCheckbox,
                                                                checked : statementEditorClasses.checked
                                                            }}
                                                            checked={checkedList.indexOf(value) !== -1}
                                                            onClick={handleCheckboxClick(value, param)}
                                                        />
                                                        <ListItemText
                                                            style={{ flex: 'inherit' }}
                                                            primary={param.name}
                                                        />
                                                        <ListItemText
                                                            style={{ marginLeft: '8px', marginRight: '8px', flex: 'inherit'}}
                                                            primary={(
                                                                <Typography className={statementEditorClasses.suggestionDataType}>
                                                                    {param.type}
                                                                </Typography>
                                                            )}
                                                        />
                                                        <ListItemText
                                                            style={{ flex: 'inherit' }}
                                                            primary={" : " + param.description}
                                                        />
                                                    </ListItem>
                                                )}
                                            </>
                                        )}
                                    </>
                                )}
                            </>
                        )
                    )}
                </>
            )}
        </>
    );
}

