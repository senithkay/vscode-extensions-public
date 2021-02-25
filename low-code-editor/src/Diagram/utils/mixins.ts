import { STSymbolInfo } from "../../Definitions";
import { getAllVariablesForAi } from "../../Diagram/components/Portals/utils";

export function getAllVariables(symbolInfo: STSymbolInfo): string[] {
    const variableCollection: string[] = [];
    const variableInfo = getAllVariablesForAi(symbolInfo);
    Object.keys(variableInfo).map((variable) => {
        variableCollection.push(variable);
    });
    return variableCollection;
}
