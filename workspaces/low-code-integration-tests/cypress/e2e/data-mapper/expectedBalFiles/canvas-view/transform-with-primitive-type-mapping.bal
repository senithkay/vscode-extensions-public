
type Input record {
    string st1;
    string st2;
    string st3;
    int int1;
    record {
        string Id;
        int count;
        boolean Confirmed;
    }[] Items;
};

type SecondInput record {
    string st1;
};

type UpdatedInput record {
    string st1;
};

type Output record {
    string st1;
    decimal d1?;
    record {
        string Id;
        boolean Confirmed;
    }[] Items;
    string[] stArr;
};

type UpdatedOutput record {
    string st1;
};

const NAME = "sampleName";
final SecondInput moduleLevelRecord = {
    st1: "sampleText"
};

function unsupportedTransform(Input|SecondInput input) returns map<int> => {};

function incompleteTransform() => {};

function transform(Input input, SecondInput secondInput) returns Output => {};

function inlineRecord2InlineRecord(record {int[] x;} input) returns record {int y;} => {};

function primitive2Primitive(string name) returns string => name;

function primitiveArray2PrimitiveArray(string[] names) returns string[] => [];

function record2PrimitiveArray(Input input) returns int[] => [];

function record2RecordArray(Input input) returns Output[] => [];

function recordArray2RecordArray(Input[] input) returns Output[] => [];

function record2Record2DArray(Input input) returns Output[][] => [];

function localVar2Record(Input input) returns Output => let string strValue1 = "sampleText", SecondInput secondInput = {
        st1: "sampleText"
    }
    in {};
