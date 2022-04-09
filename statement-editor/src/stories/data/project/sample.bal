

import ballerina/io;

type Student record {
    string firstName;
    string lastName;
    int intakeYear;
    float score;
};

type Report record {
    string name;
    string degree;
    int expectedGradYear;
};

public function sample() {

    Student s1 = {firstName: "Alex", lastName: "George", intakeYear: 2020, score: 1.5};
    Student s2 = {firstName: "Ranjan", lastName: "Fonseka", intakeYear: 2020, score: 0.9};
    Student s3 = {firstName: "John", lastName: "David", intakeYear: 2022, score: 1.2};

    Student[] studentList = [s1, s2, s3];

    Report[] reportList = from var student in studentList

       where student.score >= 1.0

       let string degreeName = "Bachelor of Medicine",
       int graduationYear = calGraduationYear(student.intakeYear)

       select {
              name: student.firstName,
              degree: degreeName,
              expectedGradYear: graduationYear
       };

    foreach var report in reportList {
        io:println(report);
    }
}

function calGraduationYear(int year) returns int {
    return year + 5;
}