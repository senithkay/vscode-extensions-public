export interface DMType {
    kind: TypeKind;
    typeName?: string;
    fieldName?: string;
    memberType?: DMType;
    defaultValue?: unknown;
    optional?: boolean;
    fields?: DMType[];
}

export enum TypeKind {
    Interface = 'interface',
    Array = 'array',
    String = 'string',
    Number = 'number',
    Boolean = 'boolean',
    Object = 'object',
    Unknown = 'unknown'
}
