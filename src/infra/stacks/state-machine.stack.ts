import { LambdaInvoke } from "aws-cdk-lib/aws-stepfunctions-tasks";
import {Function, Stack} from "sst/constructs";
import {Choice, Condition, Fail, StateMachine, Succeed} from "aws-cdk-lib/aws-stepfunctions";
import {Duration} from "aws-cdk-lib";
import {
    candidateProfileAcceptedLambdaInvoke,
    candidateProfileInputLambdaInvoke,
    checkExpectedSalaryLambdaInvoke,
    experienceCheckLambdaInvoke,
    increaseCandidateScoreLambdaInvoke,
    sendInterviewInviteLambdaInvoke
} from "../definitions";

export class StateMachineStack extends Stack {
    constructor(scope, id, props) {
        super(scope, id, props);

        const fail = new Fail(this, "Fail", {
            cause: "Candidate does not meet requirements",
        });

        const stateMachineDefinition = candidateProfileInputLambdaInvoke
            .next(experienceCheckLambdaInvoke)
            .next(
                new Choice(this, "Is Experience Greater Than 5 Years?")
                    .when(Condition.numberLessThan("$.experience", 5), fail)
            )
            .next(new Choice(this, "Does candidate speak english?")
                .when(Condition.stringEquals("$.english", "yes"), checkExpectedSalaryLambdaInvoke)
                  .otherwise(fail)
            )
            .next(increaseCandidateScoreLambdaInvoke)
            .next(sendInterviewInviteLambdaInvoke)
            .next(candidateProfileAcceptedLambdaInvoke)
            .next(new Succeed(this, "Succeed"));


        const stateMachine = new StateMachine(this, "StateMachine", {
            definition: stateMachineDefinition,
            timeout: Duration.minutes(5),
        });
    }
}