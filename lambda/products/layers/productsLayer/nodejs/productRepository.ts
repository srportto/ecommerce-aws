import {DocumentClient} from "aws-sdk/clients/dynamodb";
import {v4 as uuid} from "uuid";


export interface Product {
    id: string;
    productName: string;
    code: string;
    price: number;
    model: string;
}


export class ProductRepository {

    private ddbClient: DocumentClient;
    private productsDbd: string;

    constructor(ddbClient: DocumentClient, productsDbd: string) {
        this.ddbClient = ddbClient;
        this.productsDbd = productsDbd;

    }

    async getAllProducts(): Promise<Product []> {

        const data = await this.ddbClient.scan({
            TableName: this.productsDbd
        }).promise();

        return data.Items as Product [];
    }


    async getProductById(productId: string): Promise<Product> {

        const data = await this.ddbClient.get({
            TableName: this.productsDbd,
            Key: {
                id: productId //obs.: nessa linha o "id" corresponde ao nome da coluna da tabela que eh o index primario
            }
        }).promise();


        if (data.Item) {
            return data.Item as Product;
        } else {
            throw new Error(`Product not found: ${productId}`);
        }
    }

    async createProduct(product: Product): Promise<Product> {

        product.id = uuid();

        await this.ddbClient.put({
            TableName: this.productsDbd,
            Item: product

        }).promise();

        return product;
    }

    async deleteProductById(productId: string): Promise<Product> {

        const data = await this.ddbClient.delete({
            TableName: this.productsDbd,
            Key: {
                id: productId //obs.: nessa linha o "id" corresponde ao nome da coluna da tabela que eh o index primario
            },
            ReturnValues: "ALL_OLD" // Ao informar esse parametro com essa informacao , se o delete ocorrer com sucesso os dados da linha excluida serao retornados em "attributes
        }).promise();

        //Esse if soh eh possivel se for informado "ReturnValues=ALL_OLD" ao commando da exclusao ao dynamodb
        if (data.Attributes) {
            return data.Attributes as Product;
        } else {
            throw new Error(`delete error - Product not found: ${productId}`);
        }
    }

    async updateProduct(productId: string, product: Product): Promise<Product> {


        const data = await this.ddbClient.update({
            TableName: this.productsDbd,
            Key: {
                id: productId //obs.: nessa linha o "id" corresponde ao nome da coluna da tabela que eh o index primario
            },
            ConditionExpression: 'attribute_exists(id)', // essa linha adiciona a condicao para so executar o comando de update se o id passado existir na base
            ReturnValues: "UPDATED_NEW",    // Ao informar esse parametro com essa informacao , se o update ocorrer com sucesso os dados da linha alterada serao retornados em "attributes
            UpdateExpression: "set productName = :a, code = :b, price = :c , model = :d",
            ExpressionAttributeValues: {
                "a": product.productName,
                "b": product.code,
                "c": product.price,
                "d": product.model
            }
        }).promise();

        data.Attributes!.id = productId;
        return data.Attributes as Product;
    }
}