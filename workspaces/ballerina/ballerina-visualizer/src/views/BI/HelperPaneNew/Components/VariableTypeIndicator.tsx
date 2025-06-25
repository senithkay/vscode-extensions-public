import { pad } from "lodash";

const getTypeColor = (type: string, isRow: boolean): string => {
    if (!isRow) {
        return '#CCCCCC'; 
    }
    switch (type) {
        case 'int':
            return '#007ACC';
        case 'string':
            return '#33FF57';
        case 'boolean':
            return '#3357FF'; 
        case 'float':
            return '#F0E68C';
        default:
            return '#CCCCCC'; 
    }
}

type VariableTypeIndifcatorProps = {
    type: string;
    isRow?: boolean;
}
export const VariableTypeIndifcator = ({type, isRow = true}: VariableTypeIndifcatorProps) => {
    return (
        <div style={{color: getTypeColor(type, isRow), fontWeight: 'bold'}}>
            <span>{`${type} :`}</span>
        </div>
    );
}   