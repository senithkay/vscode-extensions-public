interface PathSegment {
    id: number;
    isParam: boolean;
    type?: string;
    name: string;
    isLastSlash?: boolean;
}

interface Path {
    segments: PathSegment[];
}