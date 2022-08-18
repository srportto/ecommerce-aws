import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda"

export async function handler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {

  const lambdaRequestid = context.awsRequestId;
  const apiRequestid = event.requestContext.requestId;

  console.log(`API gateway Request: ${apiRequestid} - Lambda requestId: ${lambdaRequestid}`);

  if (event.resource === "/products") {
    console.log("POST /products")

    return {
      statusCode: 201,
      body: "POST /products"
    }
  } else if (event.resource === "/products/{id}") {
    const productId = event.pathParameters!.id as string

    if (event.httpMethod === "PUT") {
      console.log(`PUT /products/${productId}`)

      return {
        statusCode: 200,
        body: `PUT /products/${productId}`
      }
    } else if (event.httpMethod === "DELETE") {
      console.log(`DELETE /products/${productId}`)

      return {
        statusCode: 200,
        body: `DELETE /products/${productId}`
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