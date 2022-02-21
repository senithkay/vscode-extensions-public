import ballerina/io;

public function testOtherStatementFunction() {

    int[5] intArray = [0, 1, 2, 3, 4];
    io:println("Print matching values");

    foreach var counter in intArray {

        match counter {
            0 => {
                io:println("value is: 0");
            }
            1 => {
                io:println("value is: 1");
            }
        }
    }

}
