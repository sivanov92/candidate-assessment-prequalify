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

    constructor(scope, id, props) {
        super(scope, id, props);

        const fail = new Fail(this, "Fail", {
            cause: "Candidate does not meet requirements",
        });
        const succeed = new Succeed(this, "Successful Candidate");

        /**
         * The state machine will be triggered by API Gateway
         * The API Gateway will send the candidate profile as the input to the state machine
         * The state machine will then start with the initial state
         */
        const initialState = new Pass(this, "Initial state", {
            comment: "Start the candidate assessment",
            resultPath: "$.payload",
        });

        const transformExperienceData = this.createExperienceDataResolverLambda();
        const certificationsDataResolver = this.createCertificationsDataResolverLambda();
        const languageDataResolver = this.createLanguageDataResolverLambda();

        const experienceCheckChoiceState =new Choice(this, "ExperienceCheckChoiceState")
            .when(Condition.numberLessThan("$.experience", 5), fail);
        const languageCheckChoiceState = new Choice(this, "LanguageCheckChoiceState")
            .when(Condition.stringEquals("$.english", "yes"), checkExpectedSalaryLambdaInvoke)
            .otherwise(fail);

        const certificationsPassState = new Pass(this, "CertificationsPassState", {
            comment: "Check certifications",
            resultPath: "$.payload",
        });

        const candidateAssessmentDefinition =
             initialState
            .next(transformExperienceData)
            .next(experienceCheckChoiceState)

            .next(languageDataResolver)
            .next(languageCheckChoiceState)

            .next(certificationsDataResolver)
            .next(certificationsPassState) //TODO Change to choice state

            //SEND and wait for SNS notification

            .next(succeed);

        const stateMachine = new StateMachine(this, "CandidateAssessmentStateMachine", {
            definition: candidateAssessmentDefinition,
            timeout: Duration.minutes(5),
        });
    }

    /**
     * This method is used to create the increaseCandidateScoreLambda
     * The Lambda will be used to perform profile parsing and validation
     * Additionally, certifications will be calculated per technology
     *
     * @protected
     */
    protected createCertificationsDataResolverLambda(): LambdaInvoke {
        const certificationsDataResolverLambda = new Function(this, "CertificationsDataResolverLambda", {
            description: "Transform incoming candidate profile to the expected format regarding certifications",
            handler: "src/lambda/increase-candidate-score.handler",
            runtime: this.LAMBDA_RUNTIME,
        });

        return new LambdaInvoke(this, "CertificationsDataResolverLambdaInvoke", {
            lambdaFunction: certificationsDataResolverLambda,
            outputPath: "$.payload",
        });
    }

    /**
     * This method is used to create the experienceCheckLambda
     * The Lambda will be used to perform profile parsing and validation
     * Additionally, experience will be calculated per technology
     *
     * @protected
     */
    protected createExperienceDataResolverLambda(): LambdaInvoke {
        const experienceDataResolverLambda = new Function(this, "ExperienceDataResolverLambda", {
            description: "Transform incoming candidate profile to the expected format regarding experience",
            handler: "src/lambda/experience-check.handler",
            runtime: this.LAMBDA_RUNTIME,
        });

        return new LambdaInvoke(this, "ExperienceDataResolverLambdaInvoke", {
            lambdaFunction: experienceDataResolverLambda,
            outputPath: "$.payload",
        });
    }

    /**
     * This method is used to create the languageDataResolverLambda
     * The Lambda will be used to perform profile parsing and validation
     * Additionally, spoken languages data will be calculated
     *
     * @protected
     */
    protected createLanguageDataResolverLambda(): LambdaInvoke {
        const languageDataResolverLambda = new Function(this, "LanguageDataResolverLambda", {
            description: "Transform incoming candidate profile to the expected format regarding experience",
            handler: "src/lambda/language-check.handler",
            runtime: this.LAMBDA_RUNTIME,
        });

        return new LambdaInvoke(this, "LanguageDataResolverLambdaInvoke", {
            lambdaFunction: languageDataResolverLambda,
            outputPath: "$.payload",
        });
    }
}