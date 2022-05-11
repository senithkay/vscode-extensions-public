import React, { useContext, useEffect } from "react";

import { Checkbox, List, ListItem, ListItemText, ListSubheader, Typography } from "@material-ui/core";
import { ParameterInfo } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { STKindChecker, STNode } from "@wso2-enterprise/syntax-tree";

import { SymbolParameterType } from "../../../constants";
import { StatementEditorContext } from "../../../store/statement-editor-context";
import { useStatementEditorStyles } from "../../styles";
import { NamedArgIncludedRecord } from "../NamedArgIncludedRecord";
import { ParameterList } from "../ParameterList";
// tslint:disable: jsx-no-multiline-js jsx-no-lambda
// interface ParameterSuggestionsProps {
//     paramsInModel?: STNode[]
// }
export function ParameterSuggestions(){
    // const { paramsInModel } = props;
    const {
        modelCtx: {
            currentModel,
            statementModel,
            updateModel,
            restArg
        },
        documentation
    } = useContext(StatementEditorContext);
    const statementEditorClasses = useStatementEditorStyles();

    const [checked, setChecked] = React.useState<any[]>([]);


    useEffect(() => {
        if (documentation && documentation.documentation?.parameters) {
            const newChecked = [...checked];

            const paramsInModel2: STNode[] = [];
            if (currentModel.model) {
                if (STKindChecker.isFunctionCall(currentModel.model)) {
                    currentModel.model.arguments.forEach((parameter: any) => {
                        if (!parameter.isToken) {
                            paramsInModel2.push(parameter);
                        }
                    });
                }
            }

            // Creating the parameter list with the arg position of the current function
            documentation.documentation.parameters.map((param: ParameterInfo, value: number) => {
                if (paramsInModel2.length > value) {
                   if (param.kind === SymbolParameterType.DEFAULTABLE) {
                        let defaultableParamAdded: boolean = false;
                        paramsInModel2.forEach((modelParam) => {
                            if (STKindChecker.isNamedArg(modelParam)) {
                                // Getting the exact position of the named arg
                                if (modelParam.argumentName.name.value === param.name) {
                                    const paramPosition = paramsInModel2.indexOf(modelParam);
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
            // setPlusButtonClicked(false);
        }
    }, []);

    const setCheckedList = (newChecked : []) => {
        setChecked(newChecked);
    }


    return(
        <>
            {documentation && !(documentation.documentation === undefined) ? (
                <List>
                    <ListItem>
                        <ListItemText primary={documentation.documentation.description}/>
                    </ListItem>
                    <ParameterList checkedList={checked} setCheckedList={setCheckedList} />
                    {documentation.documentation.returnValueDescription && (
                        <>
                            <hr className={statementEditorClasses.parameterSeparater}/>
                            <ListSubheader className={statementEditorClasses.parameterHeader}>
                                Return
                            </ListSubheader>
                            <ListItem>
                                <ListItemText primary={documentation.documentation.returnValueDescription}/>
                            </ListItem>
                        </>
                    )}
                </List>
            ) : (
                <div>
                    <p>No documentation available</p>
                </div>
            )}
        </>
    );
}
