import {Function} from "sst/constructs";
import {LambdaInvoke} from "aws-cdk-lib/aws-stepfunctions-tasks";

const experienceCheckLambda = new Function(this, "ExperienceCheckLambda", {
    handler: "src/lambda/experience-check.handler",
    runtime: "nodejs14.x",
});

const experienceCheckLambdaInvoke = new LambdaInvoke(this, "ExperienceCheckLambdaInvoke", {
    lambdaFunction: experienceCheckLambda,
    outputPath: "$.payload",
});

export { experienceCheckLambdaInvoke };