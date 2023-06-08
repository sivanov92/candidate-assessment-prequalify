import {LambdaInvoke} from "aws-cdk-lib/aws-stepfunctions-tasks";
import {Function, Stack} from "sst/constructs";
import {Choice, Condition, Fail, Pass, StateMachine, Succeed} from "aws-cdk-lib/aws-stepfunctions";
import {Duration} from "aws-cdk-lib";

export class StateMachineStack extends Stack {
    private readonly LAMBDA_RUNTIME = "nodejs14.x";

    /**
     * Intentionally hardcoded position budget data!
     */
    private readonly POSITION_BUDGET_UPPER_LIMIT = 10000;
    private readonly POSITION_BUDGET_LOWER_LIMIT = 5000;

    private readonly POSITION_REQUIRED_EXPERIENCE = 5;
    
    constructor(scope, id, props) {
        super(scope, id, props);

        const fail = new Fail(this, "Fail", {
            cause: "Candidate does not meet requirements",
        });

        /**
         * This Lambda will be used to check if the candidate's expected salary is within the budget
         * If the candidate's expected salary is within the budget, the state machine will proceed to the next state
         * And calculate a simple score based on the candidate's profile
         * Otherwise, the state machine will fail
         */
        const succeed = new Succeed(this, "Successful Candidate", {
            outputPath: "$.score"
        });

        /**
         * The state machine will be triggered by API Gateway
         * The API Gateway will send the candidate profile as the input to the state machine
         * The state machine will then start with the initial state
         */
        const initialState = new Pass(this, "Initial state", {
            comment: "Start the candidate assessment",
            resultPath: "$.payload",
        });

        const parseProfileData = this.createProfileParseLambda();

        const experienceCheckChoiceState =new Choice(this, "ExperienceCheckChoiceState")
            .when(Condition.numberLessThan("$.experience", this.POSITION_REQUIRED_EXPERIENCE), fail);
        const languageCheckChoiceState = new Choice(this, "LanguageCheckChoiceState")
            .when(Condition.booleanEquals("$.english", true), succeed)
            .otherwise(fail);


        const candidateAssessmentDefinition =
             initialState
            .next(parseProfileData)
            .next(experienceCheckChoiceState)
            .next(languageCheckChoiceState)
            .next(succeed);

        const stateMachine = new StateMachine(this, "CandidateAssessmentStateMachine", {
            definition: candidateAssessmentDefinition,
            timeout: Duration.minutes(1),
        });
    }

    /**
     * This method is used to parse the candidate profile
     * into a format that can be used by the state machine
     *
     * @protected
     */
    protected createProfileParseLambda(): LambdaInvoke {
        const profileParseLambda = new Function(this, "ProfileParseLambda", {
            description: "This Lambda will be used to parse the candidate's profile",
            handler: "src/lambda/parse-profile.handler",
            runtime: this.LAMBDA_RUNTIME,
        });

        return new LambdaInvoke(this, "ProfileParseLambdaInvoke", {
            lambdaFunction: profileParseLambda,
            outputPath: "$.payload",
        });
    }
}