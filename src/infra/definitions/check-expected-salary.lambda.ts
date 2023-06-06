import {Function} from "sst/constructs";
import {LambdaInvoke} from "aws-cdk-lib/aws-stepfunctions-tasks";

const checkExpectedSalaryLambda = new Function(this, "CheckExpectedSalaryLambda", {
    handler: "src/lambda/check-expected-salary.handler",
    runtime: "nodejs14.x",
});

const checkExpectedSalaryLambdaInvoke = new LambdaInvoke(this, "CheckExpectedSalaryLambdaInvoke", {
    lambdaFunction: checkExpectedSalaryLambda,
    outputPath: "$.payload",
});


export { checkExpectedSalaryLambdaInvoke };