#!/usr/bin/env node

import * as cdk from 'aws-cdk-lib';
import {ProductsAppStack} from '../lib/productsApp-stack';
import {EcommerceApiGatewayStack} from '../lib/ecommerceApiGateway-stack';
import {ProductsAppLayersStack} from "../lib/productsAppLayers-stack";
// import { EcommercePipelineStack } from '../lib/pipeline/pipeline-ecommerce-stack';


const app = new cdk.App();

const env: cdk.Environment = {
    account: "540305457156",
    region: "us-east-1"
}
const tags = {
    cost: "ECommerce",
    team: "curso udemy"
}

const productsAppLayersStack = new ProductsAppLayersStack(app, "productsAppLayers", {
    tags: tags,
    env: env
})

const productsAppStack = new ProductsAppStack(app, "ProductsApp", {
    tags: tags,
    env: env
});

productsAppStack.addDependency(productsAppLayersStack);

const ecommerceApiGatewayStack = new EcommerceApiGatewayStack(app, "EcommerceApiGateway", {
    productsFetchHandler: productsAppStack.productsFetchHandler,
    productsAdminHandler: productsAppStack.productsAdminHandler,
    tags: tags,
    env: env
})

ecommerceApiGatewayStack.addDependency(productsAppStack);

// const ecommercePipelineStack = new EcommercePipelineStack(app, "EcommercePipelineStack-cdk", {
//   tags: tags,
//   env: env
// })