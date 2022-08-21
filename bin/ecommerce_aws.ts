#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
// import { ProductsAppStack } from '../lib/productsApp-stack';
// import { EcommerceApiGatewayStack } from '../lib/ecommerceApiGateway-stack';
import { EcommercePipelineStack } from '../lib/pipeline/pipeline-ecommerce-stack';


const app = new cdk.App();

const env: cdk.Environment = {
  account: "370694956440",
  region: "us-east-1"
}
const tags = {
  cost: "ECommerce",
  team: "curso udemy"
}

// const productsAppStack = new ProductsAppStack(app, "ProductsApp", {
//   tags: tags,
//   env: env
// });

// const ecommerceApiGatewayStack = new EcommerceApiGatewayStack(app, "EcommerceApiGateway", {
//   productsFetchHandler: productsAppStack.productsFetchHandler,
//   productsAdminHandler: productsAppStack.productsAdminHandler,
//   tags: tags,
//   env: env
// })

// ecommerceApiGatewayStack.addDependency(productsAppStack);

const ecommercePipelineStack = new EcommercePipelineStack(app, "EcommercePipelineStack-cdk", {
  tags: tags,
  env: env
})