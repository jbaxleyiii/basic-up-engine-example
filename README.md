# Engine + Lambda example

This is a simple GraphQL endpoint demoing using `Up` by Apex to deploy to AWS Lambda and using AWS Fargate to deploy Engine and link them together.

## Caveats

- Engine does not currently support non GraphQL requests with Lambda. This means using GraphiQL or an auth check for private caching are not possible as they aren't GraphQL requests [Issue](https://mdg.myjetbrains.com/youtrack/issue/ENG-169)

## Reproduction steps

1. Install [Up](https://up.docs.apex.sh/#installation)
2. Setup an IAM policy for up like [this](https://up.docs.apex.sh/#aws_credentials.iam_policy_for_up_cli)
3. `npm install` in this repo
4. run `up` in this directory to deploy and create a Lambda
5. Setup a new service in Engine
6. Setup an IAM policy with LambdaInvoke (this is overly wide policy here, could be more narrow) for an engine user and use in next step.
7. Create a config JSON like so with values from Engine, Lambda, and IAM credentials:
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
      "endpoints": ["/", "/development", "/staging", "/production"]
    }
  ]
}
```
8. Stringify this so it can be used with Fargate (*hint* in chrome you can run `copy(JSON.stringify(<the above json>))` to copy it to your clipboard). It is worth saving this somewhere for future ease of use.
9. To to [this link](https://console.aws.amazon.com/ecs/home?region=us-east-1#/firstRun) to start using Fargate for a service
10. Choose `custom` and enter the following information:
```
Container Name: Engine
Image: gcr.io/mdg-public/engine:2018.02-37-g678cbb68b
Port Mappings: 80 / TCP
Advanced:
  Env Variables:
    ENGINE_CONFIG: <the stringified JSON from above>

```
11. Edit the task definition to set name to be engine-proxy and click next
12. Choose ALB (Application Load Balancer) and click next
13. Set cluster name to Engine and click next
14. Click create and wait until everything is ready
15. After the cluster is ready, click to the Engine-service and clik into the target group link
16. Edit health check to be `/.well-known/apollo/engine-health`
17. Click back to Description and click the Load Balancer link
18. Copy the DNS name into the electron version of [GraphiQL](https://github.com/skevy/graphiql-app) with `http://` proceding it.
19. Paste this query and hit go:
```graphql
query Test {
  hero(episode:NEWHOPE){
    name
  }
}
```
20. Profit (or replicate the above bugs)

### Note
- GraphiQL is turned off on this demo because it doesn't work (see included youtrack ticket above). Adding it back in is super easy, just follow the docs on apollo server for apollo-server-express
- Introspection query is just broken, if you type `up url --copy` you can replace the url in graphiql with what is in your clipboard and see Introspection works and tracing is included.

