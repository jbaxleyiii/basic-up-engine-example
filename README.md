# Engine + Lambda example

This is a simple GraphQL endpoint demoing using `Up` by Apex to deploy to AWS Lambda and using AWS Fargate to deploy Engine and link them together.

## Reproduction steps

1. `npm install` in this repo
2. Setup an IAM policy for up like [this](https://up.docs.apex.sh/#aws_credentials.iam_policy_for_up_cli)
3. run `npx up` in this directory to deploy and create a Lambda. The Lambda will be called `star-wars`.
4. Create a new service in [Engine](https://engine.apollographql.com/)
5. Create an IAM user and add the predefined AWSLambdaRole policy to it (this is overly wide policy here, could be more narrow). Create an access key ID and secret access key, which you'll use in the next step.
6. Create a config JSON like so with values from Engine, Lambda, and IAM credentials. The function ARN can be found at [the Lambda page for the function](https://console.aws.amazon.com/lambda/home?region=us-east-1#/functions/star-wars?tab=graph).
```json
{
  "apiKey": "<ENGINE_API_KEY>",
  "origins": [
    {
      "lambda": {
          "functionArn":"<LAMBDA_ARN>",
          "awsAccessKeyId":"<AWS_IAM_ID>",
          "awsSecretAccessKey":"<AWS_IAM_KEY>"
      }
    }
  ],
  "frontends": [
    {
      "host": "0.0.0.0",
      "port": 80,
      "endpoints": ["/graphql", "/staging/graphql", "/production/graphql"]
    }
  ]
}
```
7. Stringify this so it can be used with Fargate (*hint* in chrome you can run `copy(JSON.stringify(<the above json>))` to copy it to your clipboard). It is worth saving this somewhere for future ease of use.
8. Go to [this link](https://console.aws.amazon.com/ecs/home?region=us-east-1#/firstRun) to start using Fargate for a service
9. Choose `custom` and enter the following information:
    ```
    Container Name: Engine
    Image: gcr.io/mdg-public/engine:2018.02-50-gef2fc6d4e
    Port Mappings: 80 / TCP
    Advanced:
      Env Variables:
        ENGINE_CONFIG: <the stringified JSON from above>

    ```
    Then click Update.
10. Edit the task definition to set name to be engine-proxy and click next
11. Choose ALB (Application Load Balancer) and click next
12. Set cluster name to Engine and click next
13. Click create and wait until everything is ready
14. After the cluster is ready, click the service "Engine-service" and click into the target group link
15. Edit health check to be `/.well-known/apollo/engine-health`
16. Click back to Description and click the Load Balancer link
17. Copy the DNS name, and go to it in your web browser. You may get a "503 Service Temporarily Unavailable" error while the service is still starting up; if so, give it a few minutes.
18. Paste this query and hit go:
    ```graphql
    query Test {
      hero(episode:NEWHOPE){
        name
      }
    }
    ```
19. Profit (or replicate the above bugs)
