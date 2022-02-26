import { h, FunctionComponent } from "preact";
import { ShellOutput } from "./types";

export const Table: FunctionComponent<{ shellOutput: Readonly<ShellOutput> }> = ({ shellOutput }) => {
    const tableContentRegex = /^table key\(([a-zA-Z0-9, ]+)\) (\[.+\])$/;
    const match = shellOutput.shellValue.value.match(tableContentRegex)!;
    // const tableKeys = match[1].split(',');
    const tableContent = JSON.parse(match[2]);
    const getKeys = () => Object.keys(tableContent[0]);
    const getValue = (element: { [x: string]: any; }, key: string | number) => element[key] ? JSON.stringify(element[key], undefined, 2) : '';
    const renderHeader = () => {
        var keys = getKeys();
        return keys.map((key) => {
            return <th key={key}>{key.toUpperCase()}</th>;
        });
    }
    const renderBody = () => {
        var keys = getKeys();
        let body: h.JSX.Element[] = [];
        for (let index = 0; index < tableContent.length; index++) {
            body.push(
                <tr>{keys.map( key =>{return <td><pre style={'align:left'}>{getValue(tableContent[index], key)}</pre></td>})}</tr>
            );
        }
        return body;
    }
    const renderTable = () => {
        return <table>
                <thead>{renderHeader()}</thead>
                <tbody>{renderBody()}</tbody>
            </table>;
    };
    return <div>{renderTable()}</div>;
}