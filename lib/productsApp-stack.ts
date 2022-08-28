import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaNodeJS from "aws-cdk-lib/aws-lambda-nodejs"
import * as cdk from "aws-cdk-lib"
import * as dynamodb from "aws-cdk-lib/aws-dynamodb"
import * as ssm from "aws-cdk-lib/aws-ssm"

import {Construct} from "constructs"

export class ProductsAppStack extends cdk.Stack {
    readonly productsFetchHandler: lambdaNodeJS.NodejsFunction
    readonly productsAdminHandler: lambdaNodeJS.NodejsFunction
    readonly productsDdb: dynamodb.Table

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props)

        this.productsDdb = new dynamodb.Table(this, "ProductsDbd", {
            tableName: "products",
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            partitionKey: {
                name: "id",
                type: dynamodb.AttributeType.STRING
            },
            billingMode: dynamodb.BillingMode.PROVISIONED,
            readCapacity: 1,
            writeCapacity: 1
        })

        //? -----------------------------------------------------------------------*
        //? Products layers
        //? -----------------------------------------------------------------------*
        //?*

        //importando um parametro
        const productsLayerArn = ssm.StringParameter.valueForStringParameter(this, "ProductsLayerVersionArn")

        //usando parametro importado
        const productsLayer = lambda.LayerVersion.fromLayerVersionArn(this, "ProductsLayerVersionArn", productsLayerArn)


        //? -----------------------------------------------------------------------*
        //? Products lambdas
        //? -----------------------------------------------------------------------*
        //?*

        this.productsFetchHandler = new lambdaNodeJS.NodejsFunction(this, "ProductsFetchFunction", {
            functionName: "ProductsFetchFunction",
            entry: "lambda/products/productsFetchFunction.ts",
            handler: "handler",
            memorySize: 128, /* tamanho da memoria em mb*/
            timeout: cdk.Duration.seconds(5), /* tempo maximo de execucao da lambda*/
            bundling: {
                minify: true,
                sourceMap: false

            },
            environment: {
                PRODUCTS_DDB: this.productsDdb.tableName
            },
            layers: [productsLayer], // usando a layer importada
            tracing: lambda.Tracing.ACTIVE, //ativando xray
            insightsVersion: lambda.LambdaInsightsVersion.VERSION_1_0_119_0 //usando lambdaInsights
        })

        this.productsDdb.grantReadData(this.productsFetchHandler)

        this.productsAdminHandler = new lambdaNodeJS.NodejsFunction(this, "ProductsAdminFunction", {
            functionName: "ProductsAdminFunction",
            entry: "lambda/products/productsAdminFunction.ts",
            handler: "handler",
            memorySize: 128, /* tamanho da memoria em mb*/
            timeout: cdk.Duration.seconds(5), /* tempo maximo de execucao da lambda*/
            bundling: {
                minify: true,
                sourceMap: false

            },
            environment: {
                PRODUCTS_DDB: this.productsDdb.tableName
            },
            layers: [productsLayer],    // usando a layer importada
            tracing: lambda.Tracing.ACTIVE, //ativando xray
            insightsVersion: lambda.LambdaInsightsVersion.VERSION_1_0_119_0 //usando lambdaInsights
        })

        this.productsDdb.grantWriteData(this.productsAdminHandler)

    }
}