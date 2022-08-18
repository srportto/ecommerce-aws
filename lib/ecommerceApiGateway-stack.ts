import * as cdk from "aws-cdk-lib"
import * as lambdaNodeJS from "aws-cdk-lib/aws-lambda-nodejs"
import * as apiGateway from "aws-cdk-lib/aws-apigateway"
import * as cwlogs from "aws-cdk-lib/aws-logs"
import { Construct } from "constructs"

interface EcommerceApiGatewayStackProps extends cdk.StackProps {
  productsFetchHandler: lambdaNodeJS.NodejsFunction
  productsAdminHandler: lambdaNodeJS.NodejsFunction

}

export class EcommerceApiGatewayStack extends cdk.Stack {

  constructor(scope: Construct, id: string, props: EcommerceApiGatewayStackProps) {
    super(scope, id, props)

    const logGroup = new cwlogs.LogGroup(this, "EcommerceApiGatewayLogs")

    const api = new apiGateway.RestApi(this, "EcommerceApiGateway", {
      restApiName: "EcommerceApiGateway",
      deployOptions: {
        accessLogDestination: new apiGateway.LogGroupLogDestination(logGroup),
        accessLogFormat: apiGateway.AccessLogFormat.jsonWithStandardFields({
          httpMethod: true,
          ip: true,
          protocol: true,
          requestTime: true,
          resourcePath: true,
          responseLength: true,
          status: true,
          caller: true,
          user: true
        })
      }
    })

    // Cria -> integracao gateway com a lambda productsAdminFunction
    const productsFetchIntegration = new apiGateway.LambdaIntegration(props.productsFetchHandler);

    //Resource: /products
    const productsResource = api.root.addResource("products")

    //GET /products
    productsResource.addMethod("GET", productsFetchIntegration)

    //GET /products/{id}
    const productsResourceId = productsResource.addResource("{id}")
    productsResourceId.addMethod("GET", productsFetchIntegration)


    // Cria -> integracao gateway com a lambda productsAdminFunction
    const productsAdminIntegration = new apiGateway.LambdaIntegration(props.productsAdminHandler)


    //POST:     /products
    productsResource.addMethod("POST", productsAdminIntegration)

    //PUT:      /products/{id}
    productsResourceId.addMethod("PUT", productsAdminIntegration)

    //DELETE:   /products/{id}
    productsResourceId.addMethod("DELETE", productsAdminIntegration)

  }
}