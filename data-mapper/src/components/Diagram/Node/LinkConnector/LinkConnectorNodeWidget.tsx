import * as React from 'react';

import { createStyles, Theme,makeStyles } from "@material-ui/core/styles";
import CodeOutlinedIcon from '@material-ui/icons/CodeOutlined';
import { DiagramEngine } from '@projectstorm/react-diagrams';

import { DataMapperPortWidget } from '../../Port';
import { LinkConnectorNode } from './LinkConnectorNode';

const styles = makeStyles((theme: Theme) => createStyles({
	root: {
        verticalAlign: "middle",
        width: '100%',
        backgroundColor: "#fff",
        padding: "5px",
        display: "flex",
        flexDirection: "column",
        gap: "5px",
        color: "#74828F"
    },
    fromClause: {
        padding: "5px",
        fontFamily: "monospace"
    },
    mappingPane: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between"
    },
    header: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
    },
    icons: {
        padding: '8px',
        '&:hover': {
            backgroundColor: '#F0F1FB',
        }
    },
    expandIcon: {
        height: '15px',
        width: '15px',
        marginTop: '-7px'
    },
    buttonWrapper: {
        border: '1px solid #e6e7ec',
        borderRadius: '8px',
        position: "absolute",
        right: "35px"
    }
}),);

export interface LinkConnectorNodeWidgetProps{
	node: LinkConnectorNode;
	engine: DiagramEngine;
}

export function LinkConnectorNodeWidget (props: LinkConnectorNodeWidgetProps){
		const node = props.node;
		const classes = styles();
		const engine = props.engine;
        const hasError =node.hasError();

		const [editable, setEditable] = React.useState(false);
		const [str, setStr] = React.useState(node.value);


		return (
			<div className={classes.root}>
                <div className={classes.header}>
                    <DataMapperPortWidget engine={engine} port={node.inPort}/>
                    {editable &&
                        <input
                            size={str.length}
                            spellCheck={false}
                            style={{
                                padding: "5px",
                                fontFamily: "monospace",
                                zIndex: 1000,
                                border: "1px solid #5567D5",
                                maxWidth: "400px"
                            }}
                            autoFocus={true}
                            value={str}
                            onChange={(event) => {
                                const newVal = event.target.value;
                                setStr(newVal);
                                node.value = newVal;
                            }}
                            onKeyUp={(evt) => {
                                    if (evt.key === "Escape") {
                                        setEditable(false);
                                    }
                                    if (evt.key === "Enter") {
                                        node.updateSource();
                                    }
                                }
                            }
                            onBlur={() => setEditable(false)}
                        />
                    }
                    <span style={{display: "flex"}}>
					    <div>{!editable && <CodeOutlinedIcon onClick={() => setEditable(true)} style={{color: hasError && 'red'}} />}</div>
					</span>
                    <DataMapperPortWidget engine={engine} port={node.outPort}/>
                </div>
			</div>
		);
	
}

