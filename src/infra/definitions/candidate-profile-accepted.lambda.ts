import {LambdaInvoke} from "aws-cdk-lib/aws-stepfunctions-tasks";
import { Function } from "sst/constructs";

const candidateProfileAcceptedLambda = new Function(this, "candidateProfileAcceptedLambda", {
    handler: "src/lambda/candidate-profile-accepted.handler",
    runtime: "nodejs14.x",
});

const candidateProfileAcceptedLambdaInvoke = new LambdaInvoke(this, "candidateProfileAcceptedLambdaInvoke", {
    lambdaFunction: candidateProfileAcceptedLambda,
    outputPath: "$.payload",
});

export { candidateProfileAcceptedLambdaInvoke };

