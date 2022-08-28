import {APIGatewayProxyEvent, APIGatewayProxyResult, Context} from "aws-lambda"
import {Product, ProductRepository} from "/opt/nodejs/productsLayer"
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

    if (event.resource === "/products") {
        console.log("POST /products")

        const product = JSON.parse(event.body!) as Product;
        const productCreated = await productRepository.createProduct(product);

        return {
            statusCode: 201,
            body: JSON.stringify(productCreated)
        }
    } else if (event.resource === "/products/{id}") {
        const productId = event.pathParameters!.id as string

        if (event.httpMethod === "PUT") {
            console.log(`PUT /products/${productId}`)

            try {
                const product = JSON.parse(event.body!) as Product;
                const productUpdated = await productRepository.updateProduct(productId, product);

                return {
                    statusCode: 200,
                    body: JSON.stringify(productUpdated)
                }
            } catch (ConditionalCheckFailedException) {
                return {
                    statusCode: 404,
                    body: `Product not found: ${productId}`
                }
            }

        } else if (event.httpMethod === "DELETE") {
            console.log(`DELETE /products/${productId}`)

            try {
                const productDeleted = await productRepository.deleteProductById(productId);

                return {
                    statusCode: 200,
                    body: JSON.stringify(productDeleted)
                }

            } catch (error) {
                console.error((<Error>error).message)

                return {
                    statusCode: 404,
                    body: (<Error>error).message
                }
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