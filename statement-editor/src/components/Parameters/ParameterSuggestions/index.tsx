import React, { useContext, useEffect } from "react";

import { List, ListItem, ListItemText, ListSubheader } from "@material-ui/core";
import { ParameterInfo } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { STKindChecker, STNode } from "@wso2-enterprise/syntax-tree";

import { SymbolParameterType } from "../../../constants";
import { StatementEditorContext } from "../../../store/statement-editor-context";
import { useStatementEditorStyles } from "../../styles";
import { ParameterList } from "../ParameterList";

// tslint:disable: jsx-no-multiline-js jsx-no-lambda
export function ParameterSuggestions(){
    const {
        modelCtx: {
            currentModel
        },
        documentation
    } = useContext(StatementEditorContext);
    const statementEditorClasses = useStatementEditorStyles();

    const [checked, setChecked] = React.useState<any[]>([]);


    useEffect(() => {
        if (currentModel.model && documentation && documentation.documentation?.parameters) {
            const newChecked : any[] = [];
            const paramsInModel: STNode[] = [];

            if (STKindChecker.isFunctionCall(currentModel.model)) {
                currentModel.model.arguments.forEach((parameter: any) => {
                    if (!parameter.isToken) {
                        paramsInModel.push(parameter);
                    }
                });
            }

            // Creating the parameter list with the arg position of the current function
            documentation.documentation.parameters.map((param: ParameterInfo, value: number) => {
                if (paramsInModel.length > value) {
                   if (param.kind === SymbolParameterType.DEFAULTABLE) {
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
                    } else {
                        newChecked.push(value);
                    }
                }
            });

            setChecked(newChecked);
        }
    }, [currentModel.model, documentation]);

    const setCheckedList = (newChecked : []) => {
        setChecked(newChecked);
    }


    return(
        <>
            {documentation && !(documentation.documentation === undefined) ? (
                <List className={statementEditorClasses.stmtEditorInnerWrapper}>
                    <ListItem style={{paddingLeft: '0px', paddingTop: '0px'}}>
                        <ListItemText primary={documentation.documentation.description}/>
                    </ListItem>
                    <ParameterList checkedList={checked} setCheckedList={setCheckedList} />
                    {documentation.documentation.returnValueDescription && (
                        <>
                            <hr className={statementEditorClasses.returnSeparator}/>
                            <ListSubheader className={statementEditorClasses.parameterHeader}>
                                Return
                            </ListSubheader>
                            <ListItem style={{paddingLeft: '0px'}}>
                                <ListItemText primary={documentation.documentation.returnValueDescription}/>
                            </ListItem>
                        </>
                    )}
                </List>
            ) : (
                <div className={statementEditorClasses.stmtEditorInnerWrapper}>
                    <p>Please select a function to see the parameter information</p>
                </div>
            )}
        </>
    );
}
