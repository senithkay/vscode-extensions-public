import React from "react";

import { Checkbox, ListItem, ListItemText, Typography } from "@material-ui/core";
import { ParameterInfo } from "@wso2-enterprise/ballerina-low-code-edtior-commons";

import { useStatementEditorStyles, useStmtEditorHelperPanelStyles } from "../../styles";
// tslint:disable: jsx-no-multiline-js jsx-no-lambda
interface RequiredArgProps {
    param : ParameterInfo
    value : number
    checkedList : any[]
}
export function RequiredArg(props : RequiredArgProps){
    const { param, value, checkedList } = props;
    const statementEditorClasses = useStatementEditorStyles();
    const statementEditorHelperClasses = useStmtEditorHelperPanelStyles();


    return(
        <ListItem key={value} style={{ paddingTop: '0px', paddingBottom: '0px', flex: 'inherit' }}>
            <Checkbox
                classes={{
                    root : statementEditorClasses.disabledCheckbox,
                    checked : statementEditorClasses.checked
                }}
                checked={checkedList.indexOf(value) !== -1}
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
    );
}
