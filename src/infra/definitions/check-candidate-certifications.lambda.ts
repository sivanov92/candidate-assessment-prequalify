import {Function} from "sst/constructs";
import {LambdaInvoke} from "aws-cdk-lib/aws-stepfunctions-tasks";

const increaseCandidateScoreLambda = new Function(this, "IncreaseCandidateScoreLambda", {
    handler: "src/lambda/increase-candidate-score.handler",
    runtime: "nodejs14.x",
});

const increaseCandidateScoreLambdaInvoke = new LambdaInvoke(this, "IncreaseCandidateScoreLambdaInvoke", {
    lambdaFunction: increaseCandidateScoreLambda,
    outputPath: "$.payload",
});

export { increaseCandidateScoreLambdaInvoke };