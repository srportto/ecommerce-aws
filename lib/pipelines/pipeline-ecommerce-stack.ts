import { Stack, StackProps } from "aws-cdk-lib";
import { Repository } from "aws-cdk-lib/aws-codecommit";
import { Construct } from "constructs";

export class EcommercePipelineStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    new Repository(this, "EcommerceRepo", {
      repositoryName: "EcommerceRepo",
    });
  }
}