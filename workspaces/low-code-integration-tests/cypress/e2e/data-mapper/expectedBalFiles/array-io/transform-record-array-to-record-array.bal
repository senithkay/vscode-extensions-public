
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

function unsupportedTransform(Input|SecondInput input) returns map<int> => {};

function incompleteTransform() => {};

function transform(Input input, SecondInput secondInput) returns Output => {};

function inlineRecord2InlineRecord(record {int[] x;} input) returns record {int y;} => {};

function primitive2Primitive(string name) returns string => "";

function primitiveArray2PrimitiveArray(string[] names) returns string[] => [];

function record2PrimitiveArray(Input input) returns int[] => [];

function record2RecordArray(Input input) returns Output[] => [];

function recordArray2RecordArray(Input[] input) returns Output[] => from var inputItem in input
    select {
        st1: inputItem.st1 + inputItem.st2,
        d1: ,
        Items: from var ItemsItem in inputItem.Items
            select {
                Id: ItemsItem.Id,
                Confirmed:
            },
        stArr:
    };

function record2Record2DArray(Input input) returns Output[][] => [];
