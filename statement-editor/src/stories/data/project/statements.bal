import ballerina/io;
import ballerina/http;
import ballerina/lang.'int as int0;
import ballerina/lang.'xml as xmllib;
import ballerina/log;

xmlns "http://ballerina.com/aa" as ns0;

type Group record {
    readonly int id;
    readonly string name;
    readonly string age;
    readonly string area;
    readonly string status;
};

type Scope record {
    int entryId;
};

type Person record {
    readonly string name;
    int age;
    float salary;
    int heigt?;
};

type SampleRecord record {
    string var1;
};

class Worker {
    string fName = "";
}

class Employee {
    int id;
    string fName;
    string lName;

    function init(int n, string fn, string ln) {
        self.id = n;
        self.fName = fn;
        self.lName = ln;
    }

    function func() {
        self.id += 1;
    }

}

type Student record {
    string name;
};

type Product record {
    string Name;
    int Id;
    int Quantity;
    string ShoppingCardId;
    string Category;
};

type ProductAmount record {
    string ShoppingCardId;
    string Name;
    float TotalAmount;
};

type PriceInfo record {
    int Id;
    float Price;
};

type ErrorDetail1 record {
    string message?;
    error cause?;
    string info;
    int code;
};

type Address [int, string...];

type ResourceNotFound error<ErrorDetail1>;

table<PriceInfo> priceInfoTable = loadPriceInfo();

const LENGTH = 10;

int count = 0;

function localInitVarDeclStmt() {

    int i = 10;
    @tainted
    string str = "abc";
    final float f = 1.2;
}

function localNoInitVarDeclStmt() {

    int i;
    final xml<xml:Element> x;
    @tainted
    final string str;
}

function typeDescriptor() {

    // nil-type-descriptor
    null ignore1;
    () ignore2;

    // boolean-type-descriptor
    boolean isOk;

    // int-type-descriptor
    int i;

    // floating-point-type-descriptor
    float f;
    decimal d;

    // string-type-descriptor
    string str;

    // xml-type-descriptor
    xml x1;
    xml<xml:Element> x2;
    xml:Text x3;
    xml<xml<xml:Comment>> x4;

    // array-type-descriptor
    float[] fArray;
    decimal[10] dArray;
    boolean[LENGTH] bArray;
    string[*] sArray = [];

    // tuple-type-descriptor
    [int] t1;
    [int, string, float[]] t2;
    [int, string, float[], boolean...] t3;
    [int...] t4;
    [int, string, [boolean, [int, float]]] t5;

    // map-type-descriptor
    map<string> m;

    // record-type-descriptor (inclusive-record-type-descriptor )
    record {} ri1;
    record {readonly int count;} ri2;
    record {int count?;} ri3;
    record {int count = 10;} ri4;
    record {int count; string[] names;} ri5;
    record {*Student;} ri6;
    record {*http:Bucket;} ri7;
    record {*Group; *Scope; *http:Bucket;} ri8;

    // record-type-descriptor (exclusive-record-type-descriptor )
    record {||} re1;
    record {|readonly int count;|} re2;
    record {|int count?;|} re3;
    record {|int count = 10;|} re4;
    record {|int count; string[] names;|} re5;
    record {|*Student;|} re6;
    record {|*http:Bucket;|} re7;
    record {|*Group; *Scope; *http:Bucket;|} re8;
    record {|Group...; |} re9;
    record {|int count = 10;Group...; |} re10;
    record {|*Student;Group...; |} re11;

    // table-type-descriptor
    table<Group> tb1;
    table<map<string>> tb2;
    table<record {||}> tb3;
    table<Group> key() tb4;
    table<Group> key(age) tb5;
    table<Group> key(age, area, status) tb6;
    table<Group> key<string> tb7;
    table<Group> key<record {int x;}> tb8;

    // error-type-descriptor
    error e1;
    error<ErrorDetail1> e2;

    // function-type-descriptor
    function f1;
    isolated function f2;
    transactional function (string) f3;
    transactional isolated function (string) f4;
    isolated function (string) f5;
    isolated transactional function (string) f6;
    function () f7;
    function (string) f8;
    function (int, string) f9;
    function (int i, string) f10;
    function (int i, string s) f11;
    function (int i, string = "") f12;
    function (int i, string s = "") f13;
    function (int i, string = <>) f14;
    function (int i, string s = <>) f15;
    function (int i, string s = <>, boolean b = false) f16;
    function (int i, boolean b = false, int s = getSum()) f17;
    function (int i, boolean b, *Group r, string...) f18;
    function (int i, boolean b, *Group r, string... s) f19;
    function (int i, *Group r) f20;
    function (*Group r, int... i) f21;
    function (int i, string s = "") returns () f22;
    function (int i, string s = "") returns Group f23;

    // object-type-descriptorobject {} ob1;
    isolated object {} ob2;
    isolated client object {} ob3;
    isolated service object {} ob4;
    client isolated object {} ob5;
    object {string name;} ob6;
    object {public string name;} ob7;
    object {
        @deprecated
        public string name;
    } ob8;
    object {
        function getName();
    } ob9;
    object {
        isolated function 'join();
    } ob10;
    object {
        @deprecated
        public isolated transactional function getName(int id);
    } ob11;
    client object {
        remote function getName();
    } ob12;
    service object {
        remote isolated function getName();
    } ob13;
    client object {
        isolated transactional remote function getName();
    } ob14;
    service object {
        isolated remote transactional function getName();
    } ob15;
    client object {
        transactional remote isolated function getName();
    } ob16;
    service object {
        transactional remote function getName();
    } ob17;
    service object {*http:RequestInterceptor;} ob18;

    // future-type-descriptor
    future ft1;
    future<string> ft2;

    // typedesc-type-descriptor
    typedesc td1;
    typedesc<string> td2;

    // handle-type-descriptor
    handle h;

    // stream-type-descriptor
    stream<int> st1;
    stream<int, string> st2;

    // other-type-descriptor
    Group g;
    http:HttpCacheConfig cc;
    () n;
    false fls;
    10 dt;
    1.5 fp;
    "literal" l;
    any a;
    readonly ro;
    distinct error di;
    string|() un;
    Person & readonly interSec;
    string? so;
    anydata ad;
    json j;
    byte bt;

    // inferable-type-descriptor
    var v = 10;
}

function bindingPattern() {

    Address b = [44, "Tomk Road", "Tennessee"];
    Person person = {
        name: "Marsh",
        age: 20,
        salary: 10.0
    };

    // Capture
    int count = 10;

    // Wildcard
    int _ = 10;

    // List
    int[] [] = [1, 2];
    [int, string] [var1, var2] = [1, "a"];
    [int, int, int...] [_, var11, ...items] = [0, 1];
    [int...] [...allScores] = [1, 2, 3];
    [[string, int], float] [[a1, a2], a3] = [["text", 4], 89.9];
    var [n, ...path] = b;

    // Mapping
    Person {name: firstName, age: personAge, ...otherDetails} = person;
    Person {name, age} = person;

    // Error
    var error(err2) = error("");
    error error ResourceNotFound(errMsg1) = error("sample error1", info = "error info", code = 0);
    error error ResourceNotFound(errMsg2, errCause2) = error("sample error2", info = "error info", code = 0);
    error error ResourceNotFound() = error("sample error3", info = "error info", code = 0);
    error error ResourceNotFound(_, info = errInfo1) = error("sample error3", info = "error info", code = 0);
    error error ResourceNotFound(errMsg4, errCause4, info = errInfo2, code = errCode) = error("sample error4", info = "error info", code = 0);
    error error ResourceNotFound(errMsg5, errCause5, ...fields1) = error("sample error4", info = "error info", code = 0);
    error error ResourceNotFound(...fields2) = error("sample error4", info = "error info", code = 0);
}

function literal() {

    // nil-literal
    var x = ();
    var y = null;

    // boolean-literal
    var bo1 = true;
    var bo2 = false;

    // numeric-literal
    // int-literal
    var i1 = 0;
    var i2 = 2;
    var i3 = 20;
    var i4 = 0x0c;
    var i5 = 0X9E1F0;

    // floating-point-literal
    var f1 = 123e9;
    var f2 = 0e-34;
    var f3 = 5E+034F;
    var f4 = 23E+0d;
    var f5 = 123.9;
    var f6 = .9123;
    var f7 = .9123E3;
    var f8 = .9123E+3D;
    var f9 = 8.9123f;

    var f10 = 0x3DDp9;
    var f11 = 0X39FP+09;
    var f12 = 0x3DD.1EAD;
    var f13 = 0x3DD.DAC;
    var f14 = 0X.EAD;

    // string-literal
    var s1 = "";
    var s2 = "\tabc\"\\\r\n";

    // byte-array-literal
    var b1 = base16 ` C 4 `;
    var b2 = base64 ` Q r 9 + / 0 W E `;
    var b3 = base64 ` Q r 9 + A B C = `;
    var b4 = base64 ` Q r 9 + A B = = `;
}

function stringTemplateExpr() {

    int studentAge = 10;
    int amount = 100;

    var s1 = string ``;
    var s2 = string `sample text`;
    var s3 = string `age: ${studentAge}`;
    var s4 = string `salary: $${amount}`;
    var s5 = string `$$$`;
}

function xmlTemplateExpr() {

    int studentAge = 10;
    int amount = 100;

    var x1 = xml ``;
    var x2 = xml `<p> sample text </p>`;
    var x3 = xml `<age> ${studentAge} </age>`;
    var x4 = xml `<data> salary: $${amount} </data>`;
    var x5 = xml `$$$`;
}

function rawTemplateExpr() {

    int studentAge = 10;
    int amount = 100;

    var r1 = ``;
    var r2 = `sample text`;
    var r3 = `age: ${studentAge}`;
    var r4 = `salary: $${amount}`;
    var r5 = `$$$`;
}

//error function
function structuralConstructorExpr() {

    int id = 0;
    string name = "abc";

    // List
    var l1 = [];
    var l2 = ["a", "b", "c"];

    // Table
    var t1 = table [
            {id: 1, name: "a"},
            {id: 2, name: "b"}
        ];
    var t2 = table key(id) [{id: 1, name: "a"}];
    var t3 = table key(id, name) [
            {id: 1, name: "a"},
            {id: 2, name: "b"}
        ];

    // Map
    var m1 = {};
    var m2 = {id: 1, readonly "name": "a"};
    var m3 = {readonly id, name: "a"};
    var m4 = {id, [name] : "a"};
    var m5 = {lastName: "a", ...m2};
    var m6 = {...m2};
}

function objectConstructorExpr() {

    object {} ob1 = object {};
    object {} ob2 = isolated object {};
    object {} ob3 = @display {label: "object"} service isolated object {};
    object {} ob4 = service object {string name = "";};
    object {} ob5 = client object {private string name;};
    object {} ob6 = object {
        @deprecated
        public final string name = "";
    };
    object {} ob7 = object {public string name = "a";};
    object {} ob8 = isolated object http:LoadBalancerRule {
        public isolated function getNextClient((http:Client?)[] loadBalanceCallerActionsArray) returns http:Client|http:ClientError {
            return error("");
        }
    };
    object {} ob9 = object {
        public isolated function getName(int id) returns string {
            return "";
        }
    };
    object {} ob10 = client object {
        remote function getName() {
        }
    };
    object {} ob11 = service object {
        resource isolated function getName .(int id) {
        }
    };
    object {} ob12 = service object {
        resource transactional function getName org/dept/[int id]/[string... name]() {
        }
    };
}

function newExpr() {

    var _ = new stream<int, error>();
    var _ = new http:Headers();
    Employee p = new Employee(5, "John", "Doe");
    Worker w = new Employee(5, "John", "Doe");
    Worker p2 = new;
}

function variableReferenceExpr() {

    int index = 1;
    int 'key = 10;

    int i1 = index;
    int i2 = 'key;
    int i3 = http:STATUS_ACCEPTED;
    xmlns "http://example.com" as ex;
    string exdoc = ex:doc;
}

function fieldAccessExpr() {

    Person person = {
        name: "Marsh",
        age: 20,
        salary: 10.0
    };

    int age = person.age;
}

function optionalFieldAccessExpr() {

    Person person = {
        heigt: 180,
        name: "Marsh",
        age: 20,
        salary: 10.0
    };

    int? height = person?.heigt;
}

function xmlAttributeAccessExpr() {

    xmllib:Element x1 = <xmllib:Element>xml `<ns0:book ns0:status="available" count="5"/>`;

    string|error status = x1.ns0:status;
    string|error count = x1.count;
    // var discount = x1?.count;  // error: jVM generation is not supported for type other
}

function annotAccessExpr() {

    _ = StrandData.@strand;
}

function memberAccessExpr() {

    string[] fruits = ["apple"];
    table<Group> key(id) t1 = table [
            {
                id: 1,
                name: "a",
                area: "area1",
                age: "10",
                status: ""
            },
            {
                id: 2,
                name: "b",
                area: "area2",
                age: "20",
                status: ""
            }
        ];

    string fruit = fruits[0];
    Group? g = t1[0];
}


function functionCallExpr() {

    int[] n = [10, 20, 30];
    int count = 10;

    int sum1 = getSum(1, 3);
    int sum2 = getSum(1, n2 = 3);
    int sum3 = getSum(count, 3, ...n);
    int|error i = int0:fromString("1");
}

function methodCallExpr() {

    string[] s = ["a", "b", "c"];

    int l = s.length();
    string s2 = ",".'join(...s);

    io:println(l);
    io:println(s2);
}

function errorConstructorExpr() {

    error e1 = error("sample error1");
    error e2 = error("sample error2", e1);
    error e3 = error("sample error3", message = e2);
    error e4 = error("sample error4", message = e2, cause = e3);
    error e5 = error ResourceNotFound("sample error5", code = 0, info = "");
}

function anonymousFunctionExpr() {

    var anonFunction1 = function(int total, int i) returns int {
        return total + i;
    };
    var anonFunction2 = isolated function(int total, int i) returns int {
        return total + i;
    };
    transactional function (string n) returns (int) anonFunction3 = transactional function(string name) returns int => name.length();
    function (string, string) returns (string) anonFunction4 = (fName, lName) => fName + lName;

    io:println(anonFunction4("aaabb", "xyz"));
}

function letExpr() {

    Person person = {
        name: "Marsh",
        age: 20,
        salary: 10.0
    };

    int a = let @tainted
        int b = 1
        in b * 2;
    string greeting = let string hello = "Hello ", string ballerina = "Ballerina!"
        in hello + ballerina;
    int length = let var num = 10, var txt = "four"
        in num + txt.length();
    int age = let Person {
                    name: firstName,
                    age: personAge,
                    ...otherDetails
                } = person
        in personAge;

    io:println("age: ", age);
}

function typeCastExpr() {

    float height = 175.4;
    int i1 = <int>height;
    int i2 = <@untainted int>height;
    float i3 = <@untainted>height;

    io:println(i3);
}

function typeofExpr() {

    Student student = {
        name: ""
    };

    var t = typeof student;

    io:println(t);
}

function unaryLogicalExpr() {

    boolean b = !false;
}

function nilLiftedExpr() {

    // unary-numeric-expr
    int i1 = +10;
    int i2 = -10;
    int i3 = ~i1;

    // multiplicative-expr
    int i4 = i1 * 10;
    int i5 = i2 / i3;
    int i6 = i4 % i1;

    // additive-expr
    int i7 = i1 + 10;
    int i8 = i2 - i3;

    // shift-expr
    int i9 = i1 << 2;
    int i10 = i2 >> i3;
    int0:Unsigned8 i11 = <int:Unsigned8>i4 >> 3;
    int i12 = i10 >>> 3;

    // binary-bitwise-expr
    int i13 = i1 & 2;
    int i14 = i1 ^ i2;
    int i15 = i1 | i2;
}

function rangeExpr() {

    object {
        public isolated function iterator() returns object {
            public isolated function next() returns record {|int value;|}?;
        };
    } i = 1 ... 200;
    var v = 1 ..< 200;
}

function relationalExpr() {

    boolean b1 = 1 < 2;
    boolean b2 = count > 2;
    boolean b3 = 100 <= count;
    boolean b4 = 1 >= count;
}

function isExpr() {

    boolean b1 = "" is string;
    boolean b2 = count !is int;
}

function equalityExpr() {

    boolean b1 = "" == "a";
    boolean b2 = count != 100;
    boolean b3 = [1, 2] === [1, 2];
    boolean b4 = {a: 1} !== {a: 2};
}

function logicalExpr() {

    boolean b1 = true && count > 10;
    boolean b2 = count > 0 || LENGTH > 0;
}

function conditionalExpr() {

    string? x = ();
    string output = x is string ? "value is string: " + x : "value is nil";
    string elvisOutput = x ?: "value is nil";
    @tainted
    int i;
}

function checkingExpr() returns error? {

    int x1 = check int0:fromString("10");
    int x2 = checkpanic int0:fromString("num");
}

function trapExpr() {

    int|error result = trap 1 / 0;
}

function queryExpr() returns error? {

    Product[] products = [
        {
            Category: "Books",
            Quantity: 10,
            Id: 1,
            ShoppingCardId: "S1",
            Name: "B"
        },
        {
            Category: "Papers",
            Quantity: 100,
            Id: 2,
            ShoppingCardId: "S2",
            Name: "P"
        }
    ];

    table<Person> key(name) employees = table [
            {name: "John", age: 20, salary: 100},
            {name: "Fred", age: 30, salary: 2000}
        ];

    ProductAmount[] output = from var product in products
        where product.Category == "Grocery"
        join var priceInfo in priceInfoTable
                                    on product.Id equals priceInfo.Id
        order by product.Name ascending
        select {
            ShoppingCardId: product.ShoppingCardId,
            Name: product.Name,
            TotalAmount: <float>product.Quantity * priceInfo.Price
        };

    var highPaidEmployees = check table key(name) from var e in employees
        where e.salary >= 1000.0
        select e;

    var reportList = stream from var e in employees
        where e.salary >= 10.0
        let string degreeName = "Bachelor of Medicine",
                            int graduationYear = 2022
        select {
            name: e.name,
            degree: degreeName,
            expectedGradYear: graduationYear
        };
}

function xmlNavigateExpr() {

    xml bookXML = xml `<book>
            <name>Sherlock Holmes</name>
            <author>
                <fname title="Sir">Arthur</fname>
                <mname>Conan</mname>
                <lname>Doyle</lname>
            </author>
            <bar:year xmlns:bar="http://ballerina.com/a">2019</bar:year>
            <!--Price: $10-->
            </book>`;
    xml seq = bookXML/*;
    xml<xml:Element> name = seq.<name>;
    xml<xml:Element> all = seq.<*>;
    xml<xml:Element> info = seq.<bar|name>;
    xml<xml:Element> year = seq.<ns0:year>;
    var fNameElement = bookXML/<author>/<fname>;
    var mNameElement = bookXML/**/<mname>;
    // string mName = bookXML/**/<mname>.get(0).toString(); //method invocations are not yet supported within XML navigation expressions
}

function transactionalExpr() {

    _ = transactional ? io:println("Calling from a transactional context") : io:println("");
}

function xmlnsDeclStmt() {

    xmlns "http://example.com" as eg;
    xmlns "http://example.com";
}

function assignmentStmt() {

    Scope s = {entryId: 0};
    int[] arr = [1, 2];

    count = 10;
    s.entryId = 10;
    arr[0] = 10;

}

function compoundAssignmentStmt() {

    Scope s = {entryId: 0};
    int[] arr = [1, 2];

    count += 10;
    s.entryId *= 10;
    arr[0] <<= 2;

}

function destructuringAssignmentStmt() {

    int n1;
    int n2;
    int[] n;
    string fName;
    float sal;
    Person person = {
        name: "",
        salary: 0.0,
        age: 0
    };
    record { int age;} r = {
        age: 10
    };
    int[] codes;
    string errMsg;

    _ = getSum(1, 2, 3);
    [n1, n2] = [2, 5];
    [...n] = [2, 5];
    {name: fName} = person;
    {name: fName, salary: sal, ...r} = person;
    error ResourceNotFound(errMsg) = error("");
}

function callStmt() returns error? {

    _ = getSum(10, 20, 30);
    _ = "abc".length();
    int x1 = check int0:fromString("10");
    int x2 = checkpanic int0:fromString("10");
}

function ifElseStmt() {

    if true {
    }

    if count > 2 {
        count += 1;
    }

    if (LENGTH < count) {
        count += 1;
    } else {
        count -= 1;
    }

    if count > 0 {
        count += 1;
    } else if LENGTH is int {
        count -= 1;
    }

    if (count > 0) {
        count += 1;
    } else if (LENGTH > 0) {
        count -= 1;
    } else if (LENGTH < 0) {
        count *= 2;
    } else {
        count -= 10;
    }

}

function doStmt() {
    do {
        count += 3;
    }
}

function matchStmt() {
    string[] animals = ["Cat", "Canine", "Mouse", "Horse"];
    [string, int]|[float, string, boolean]|float a = ["Hello", 12];
    SampleRecord rec = {var1: "Hello", "var2": 150};
    error err = error("Generic Error", message = "Failed");

    foreach string animal in animals {
        match animal {
            "Mouse" => {
                io:println("Mouse");
            }
            "Dog"|"Canine" => {
                io:println("Dog");
            }
            "Cat"|"Feline" => {
                io:println("Cat");
            }

            _ => {
                io:println("Match All");
            }
        }
    }

    match a {

        var [s, i, b] => {
            io:println(`Matched with three vars : ${a}`);
        }

        var [s, i] => {
            io:println(`Matched with two vars :  ${a}`);
        }

        var f if f is float => {
            io:println(`Matched with single float var : ${a}`);
        }
    }

    match rec {

        var {var1, var2, var3} => {
            io:println("Matched with three vars : ", var1, ", ", var2, ", ", var3);
        }

        var {var1, var2} => {
            io:println("Matched with two vars : ", var1, ", ", var2);
        }

        var {var1} => {
            io:println("Matched with single var : ", var1);
        }
    }

    match err {

        var error(reason, message = message) => {
            io:println(`Matched an error value : reason: ${reason}, message: ${message}`);
        }

        var error(reason, message = message, ...rest) => {
            io:println(`Matched an error value : reason: ${reason}, rest detail: ${rest}`);
        }
    }
}

function foreachStmt() {

    foreach int i in 1 ... 10 {
        count += i;
    }
}

function whileStmt() {

    while count > 10 {
        count += 1;
    }
}

function lockStmt() {

    lock {
        count += 1;
    }
}

function continueStmt() {

    while count > 10 {
        if count != 5 {
            continue;
        } else {
            io:println(count);
        }
        count += 1;
    }
}

function breakStmt() {

    while count > 10 {
        if count != 5 {
            break;
        } else {
            io:println(count);
        }
        count += 1;
    }
}

function stmtWithOnFail() {

    while count > 10 {
        count += check int0:fromString("10");
    } on fail error e {
        log:printError("error", e);
    }
}

function retryStmt() returns error? {

    retry {
        count += 1;
    }

    retry transaction {
        _ = check int0:fromHexString("1");
        check commit;
    }
}

function transactionStmt() returns error? {

    transaction {
        doStage1();
        error? err = doStage2();
        check commit;
    }
}

function retryTransactionStmt() returns error? {

    retry transaction {
        _ = check int0:fromHexString("1");
        check commit;
    }
}

function rollbackStmt() returns error? {

    transaction {
        doStage1();
        error? err = doStage2();
        if (err is error) {
            rollback;
        } else {
            check commit;
        }
    }
}

function panicStmt() returns error? {

    panic error("some error");
}

function returnStmt() returns int|() {

    if (count > 0) {
        return count;
    }
    return;
}

function forkStmt() {

    fork {
        worker w1 returns [int, string] {
            return [count, "abc"];
        }

        @strand
        worker w2 returns float {
            return 10.23;
        }
    }
}

public function main() {

}

function getSum(int n1, int n2, int... n) returns int {

    return n1 + n2 + n.reduce(function(int total, int i) returns int {
        return total + i;
    }, 0);
}

function doStage1() {
    io:println("Stage1 completed");
}

function doStage2(boolean isError = false) returns error? {
    io:println("Stage2 completed");

    if (isError) {
        return error("sample error");
    }
}

function loadPriceInfo() returns table<PriceInfo> {
    table<PriceInfo> productDetails = table [
            {Id: 2345, Price: 120.00},
            {Id: 3256, Price: 23.00}
        ];
    return productDetails;
}
