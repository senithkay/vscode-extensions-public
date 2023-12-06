


export interface EggplantModel {
    nodes: Node[];
}

export interface Node {
    name: string;
    links: Link[];
}

export interface Link {
    name: string;
}