
type Input record {
    string str1;
    string str2;
    decimal dec1;
};

type OutputType1 record {
    string|OutputType2 unionVal1;
    string|OutputType2 unionVal2;
};

type OutputType2 record {
    decimal dec1;
};

type UnionOutput OutputType1|OutputType2;

function transformUnionRecord(Input input) returns UnionOutput|error => {
    unionVal1: input.str1 + input.str2,
    unionVal2:
{
        dec1: input.dec1
    }
};
