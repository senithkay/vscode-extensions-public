import React, { useContext } from "react";

import { List, ListItem, ListItemText } from "@material-ui/core";
import { ExpandMore } from "@material-ui/icons";

import { StatementEditorContext } from "../../../store/statement-editor-context";
import { useStatementEditorStyles } from "../../styles";

export interface InlineDocumentationProps {
    documentationHandler : () => void
}
export function InlineDocumentation(props: InlineDocumentationProps){

    const { documentationHandler} = props;
    const {
        documentation
    } = useContext(StatementEditorContext);
    const statementEditorClasses = useStatementEditorStyles();

    return(

        <div className={statementEditorClasses.documentationWrapper}>
            <List style={{padding: '0px'}}>
                <ListItem>
                    <ListItemText primary={documentation.documentation.description}/>
                    <ExpandMore onClick={documentationHandler}/>
                </ListItem>
            </List>
        </div>
    );
}
