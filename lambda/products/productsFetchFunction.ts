import {APIGatewayProxyEvent, APIGatewayProxyResult, Context} from "aws-lambda"
import {ProductRepository} from "/opt/nodejs/productsLayer"
import {DynamoDB} from "aws-sdk";
import * as AWSXRay from "aws-xray-sdk"

AWSXRay.captureAWS(require("aws-sdk"))
const productsDbd = process.env.PRODUCTS_DDB!
const ddbClient = new DynamoDB.DocumentClient()
const productRepository = new ProductRepository(ddbClient, productsDbd)

export async function handler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {

    const lambdaRequestid = context.awsRequestId;
    const apiRequestid = event.requestContext.requestId;

    console.log(`API gateway Request: ${apiRequestid} - Lambda requestId: ${lambdaRequestid}`);

    const method = event.httpMethod;
    if (event.resource === "/products") {
        if (method === "GET") {
            console.log('GET')

            const products = await productRepository.getAllProducts();

            return {
                statusCode: 200,
                body: JSON.stringify(products)
            }
        }
    } else if (event.resource === "/products/{id}") {
        const productId = event.pathParameters!.id as string
        console.log(`GET /products/${productId}`)

        try {
            const product = await productRepository.getProductById(productId);

            return {
                statusCode: 200,
                body: JSON.stringify(product)
            }

        } catch (error) {
            console.error((<Error>error).message)

            return {
                statusCode: 404,
                body: (<Error>error).message
            }
        }
    }
    return {
        statusCode: 400,
        body: JSON.stringify({
            message: "bad request"
        })
    }
}