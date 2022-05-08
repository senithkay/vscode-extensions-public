import React, { useContext } from "react";

import { List, ListItem, ListItemText } from "@material-ui/core";
import { ExpandMore } from "@material-ui/icons";

import { StatementEditorContext } from "../../../store/statement-editor-context";

export function InlineDocumentation(){

    const {
        documentation
    } = useContext(StatementEditorContext);

    return(

        <div style={{borderWidth: '2px', backgroundColor: 'white'}}>
            <List style={{padding: '0px'}}>
                <ListItem>
                    <ListItemText primary={documentation.documentation.description}/>
                    <ExpandMore/>
                </ListItem>
            </List>
        </div>
    );
}
