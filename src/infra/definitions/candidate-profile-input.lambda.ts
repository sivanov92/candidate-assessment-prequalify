import {Function} from "sst/constructs";
import {LambdaInvoke} from "aws-cdk-lib/aws-stepfunctions-tasks";

const candidateProfileInputLambda = new Function(this, "CandidateProfileInputLambda", {
    handler: "src/lambda/candidate-profile-input.handler",
    runtime: "nodejs14.x",
});

const candidateProfileInputLambdaInvoke = new LambdaInvoke(this, "CandidateProfileInputLambdaInvoke", {
    lambdaFunction: candidateProfileInputLambda,
    outputPath: "$.payload",
});

export { candidateProfileInputLambdaInvoke };