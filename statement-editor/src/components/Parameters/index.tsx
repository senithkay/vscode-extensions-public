import React, { useContext, useEffect } from "react";

import {
    Checkbox,
    IconButton,
    List,
    ListItem,
    ListItemText,
    ListSubheader,
    Typography
} from "@material-ui/core";
import { AddCircleOutline } from "@material-ui/icons";
import { ParameterInfo } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { NamedArg, STKindChecker, STNode } from "@wso2-enterprise/syntax-tree";

import { EXPR_CONSTRUCTOR, SymbolParameterType } from "../../constants";
import { StatementEditorContext } from "../../store/statement-editor-context";
import { keywords } from "../../utils/statement-modifications";
import { useStatementEditorStyles, useStmtEditorHelperPanelStyles } from "../styles";

import { NamedArgIncludedRecord } from "./NamedArgIncludedRecord";



// tslint:disable: jsx-no-multiline-js jsx-no-lambda
export function Parameters() {
    const statementEditorClasses = useStatementEditorStyles();
    const statementEditorHelperClasses = useStmtEditorHelperPanelStyles();
    const {
        modelCtx: {
            currentModel,
            updateModel,
            restArg
        },
        documentation
    } = useContext(StatementEditorContext);

    const [checked, setChecked] = React.useState([]);
    const [plusButtonClick, setPlusButtonClicked] = React.useState(false);

    let includedRecordHeader: boolean = false;
    let isNewRecordBtnClicked : boolean = false;

    // const[includedInputAdded, setIncludedInput] = React.useState(false);

    const modelParamList = (): STNode[] => {
        const paramList: STNode[] = [];
        if (currentModel.model) {
            if (STKindChecker.isFunctionCall(currentModel.model)) {
                currentModel.model.arguments.forEach((parameter: any) => {
                    if (!parameter.isToken) {
                        paramList.push(parameter);
                    }
                });
            }
        }
        return paramList;
    }


    const handleToggle = (value: number, param?: ParameterInfo) => () => {
        const currentIndex = checked.indexOf(value);
        const newChecked = [...checked];

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
                updateModel(content, currentModel.model.position);
                if (param.kind === SymbolParameterType.REST){
                    restArg(true);
                }
            }
        } else {
            newChecked.splice(currentIndex, 1);
            if (STKindChecker.isFunctionCall(currentModel.model)) {
                const paramsList = currentModel.model.arguments;
                paramsList.length > 1 ? paramsList.splice((currentIndex * 2) - 1, 2) : paramsList.splice(currentIndex, 1);

                let funcParams: string = "";
                paramsList.forEach((parameter: any) => {
                    funcParams = funcParams + (parameter.isToken ? parameter.value : parameter.source);
                });

                const content: string = currentModel.model.functionName.source + "(" + funcParams + ")";
                updateModel(content, currentModel.model.position);
            }
        }

        setChecked(newChecked);
    };


    useEffect(() => {
        if (documentation && documentation.documentation?.parameters) {
            const newChecked = [...checked];

            // Creating the parameter list with the arg position of the current function
            documentation.documentation.parameters.map((param: ParameterInfo, value: number) => {
                if (modelParamList().length > value) {
                    const paramsInModel = modelParamList();
                    if (param.kind === SymbolParameterType.REST) {
                        newChecked.push(value);
                    } else if (param.kind === SymbolParameterType.REQUIRED) {
                        newChecked.push(value);
                    } else if (param.kind === SymbolParameterType.DEFAULTABLE) {
                        let defaultableParamAdded: boolean = false;
                        paramsInModel.forEach((modelParam) => {
                            if (STKindChecker.isNamedArg(modelParam)) {
                                // Getting the exact position of the named arg
                                if (modelParam.argumentName.name.value === param.name) {
                                    const paramPosition = paramsInModel.indexOf(modelParam);
                                    newChecked.push(paramPosition);
                                    defaultableParamAdded = true;
                                }
                            }
                        });
                        if (!defaultableParamAdded){
                            newChecked.push(value);
                        }
                    } else if (param.kind === SymbolParameterType.INCLUDED_RECORD){
                        newChecked.push(value);
                    }
                }
            });

            setChecked(newChecked);
            setPlusButtonClicked(false);
        }
    }, []);

    // To disable the plus icon of included records when the allowed number of arguments are added according to the function signature
    const isAllowedIncludedArgsAdded = () : boolean => {
        const listIncludedParams: number[] = [];
        let isIncluded : boolean = false;
        documentation.documentation.parameters.map((docParam: ParameterInfo, value: number) => {
            if (docParam.kind === SymbolParameterType.INCLUDED_RECORD) {
                listIncludedParams.push(value);
            }
        });
        listIncludedParams.some((value => {
                isIncluded = checked.includes(value);
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
        const argList = modelParamList();
        return (
            <>
                {checked.indexOf(value) !== -1 && (
                    <ListItem>
                        <Checkbox
                            classes={{
                            root : statementEditorClasses.parameterCheckbox,
                            checked : statementEditorClasses.checked
                        }}
                            style={{ flex: 'inherit' }}
                            checked={checked.indexOf(value) !== -1}
                            onClick={handleToggle(value, param)}
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
        const newChecked = [...checked];
        const currentIndex = checked.indexOf(value);
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
                setChecked(newChecked);
                setPlusButtonClicked(false);
            }
        }
    }

    return (
        <>
            {documentation && !(documentation.documentation === undefined) && (
                <List>
                    <ListItem>
                        <ListItemText primary={documentation.documentation.description}/>
                    </ListItem>
                    {!!documentation.documentation.parameters?.length && (
                        <>
                            <ListSubheader>
                                Parameter
                            </ListSubheader>
                            {documentation.documentation.parameters.map((param: ParameterInfo, value: number) => (
                                    <>

                                        {param.kind === SymbolParameterType.REQUIRED ? (
                                            <ListItem key={value} style={{ paddingTop: '0px', paddingBottom: '0px', flex: 'inherit' }}>
                                                <Checkbox
                                                    classes={{
                                                    root : statementEditorClasses.disabledCheckbox,
                                                    checked : statementEditorClasses.checked
                                                }}
                                                    checked={checked.indexOf(value) !== -1}
                                                    disabled={true}
                                                />
                                                <ListItemText
                                                    style={{ flex: 'inherit' }}
                                                    primary={param.name}
                                                />
                                                <ListItemText
                                                    style={{ marginLeft: '8px', marginRight: '8px', flex: 'inherit'}}
                                                    primary={(
                                                        <Typography className={statementEditorHelperClasses.suggestionDataType}>
                                                            {param.type}
                                                        </Typography>
                                                    )}
                                                />
                                                <ListItemText
                                                    style={{ flex: 'inherit' }}
                                                    primary={" : " + param.description}
                                                />
                                            </ListItem>
                                        ) : (
                                            <>
                                                {param.kind === SymbolParameterType.INCLUDED_RECORD ? (
                                                    <>
                                                        {addIncludedRecordHeader(param, value)}
                                                        {addIncludedRecords(param, value)}
                                                        {/*{!isNewRecordBtnClicked && (
                                                            <NamedArgIncludedRecord
                                                                isNewRecord={plusButtonClick}
                                                                value={value}
                                                                addIncludedRecordToModel={addIncludedRecordToModel}
                                                            />
                                                        )}*/}
                                                        {(checked.indexOf(value) === -1 && !isNewRecordBtnClicked) && (
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
                                                                    checked={checked.indexOf(value) !== -1}
                                                                    onClick={handleToggle(value, param)}
                                                                />
                                                                <ListItemText
                                                                    style={{ flex: 'inherit' }}
                                                                    primary={param.name}
                                                                />
                                                                <ListItemText
                                                                    style={{ marginLeft: '8px', marginRight: '8px', flex: 'inherit'}}
                                                                    primary={(
                                                                        <Typography className={statementEditorHelperClasses.suggestionDataType}>
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
                    {documentation.documentation.returnValueDescription && (
                        <>
                            <ListSubheader>
                                Return
                            </ListSubheader>
                            <ListItem>
                                <ListItemText primary={documentation.documentation.returnValueDescription}/>
                            </ListItem>
                        </>
                    )}
                </List>
            )}
        </>
    );
}
