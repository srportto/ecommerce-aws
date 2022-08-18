import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda"

export async function handler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {

  const lambdaRequestid = context.awsRequestId;
  const apiRequestid = event.requestContext.requestId;

  console.log(`API gateway Request: ${apiRequestid} - Lambda requestId: ${lambdaRequestid}`);

  const method = event.httpMethod;
  if (event.resource === "/products") {
    if (method === "GET") {
      console.log('GET')

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "GET /products - OK"
        })
      }
    }
  } else if (event.resource === "/products/{id}") {
    const productId = event.pathParameters!.id as string
    console.log(`GET /products/${productId}`)

    return {
      statusCode: 200,
      body: `GET /products/${productId}`
    }

  }

  return {
    statusCode: 400,
    body: JSON.stringify({
      message: "bad request"
    })
  }
}