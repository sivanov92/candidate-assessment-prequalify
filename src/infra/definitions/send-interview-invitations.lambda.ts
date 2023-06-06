import {Function} from "sst/constructs";
import {LambdaInvoke} from "aws-cdk-lib/aws-stepfunctions-tasks";

const sendInterviewInviteLambda = new Function(this, "SendInterviewInviteLambda", {
    handler: "src/lambda/send-interview-invitations.handler",
    runtime: "nodejs14.x",
});

const sendInterviewInviteLambdaInvoke = new LambdaInvoke(this, "SendInterviewInviteLambdaInvoke", {
    lambdaFunction: sendInterviewInviteLambda,
    outputPath: "$.payload",
});

export { sendInterviewInviteLambdaInvoke };