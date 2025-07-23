---
slug: "serverless-backend-on-aws-step-2-iac-with-terraform"
date: "23 Jul 2025"
date_updated: ""
tags: ["tutorial", "aws", "terraform", "serverless"]
title: "Serverless Backend on AWS - Step 2: Leveraging the power of IaC with Terraform"
meta_description: "Unlock the power of Infrastructure as Code! In this tutorial, Pantelis Deligiannidis guides you through building a complete AWS serverless backend (S3, Lambda, API Gateway) from scratch using Terraform, ensuring consistent and automated deployments."
---

1. [Step 1: Lambda, S3, and API Gateway](/blog/serverless-backend-on-aws-step-1-s3-lambda-and-api-gateway)
2. (You are here) Step 2: Leveraging the power of IaC with Terraform

In Step 1 of this series, we manually set up a serverless backend on AWS, combining **Amazon S3** for static website hosting, **AWS Lambda** for dynamic server-side logic, and an **Amazon API Gateway** to expose our Lambda function as a public API. You experienced firsthand how these services integrate to create a scalable and cost-effective solution.

While manual configuration is excellent for understanding the underlying concepts, it quickly becomes cumbersome, error-prone, and difficult to scale or replicate in real-world scenarios. This is where **Infrastructure as Code (IaC)** shines. IaC allows us to define, provision, and manage our infrastructure using code, bringing the benefits of version control, automation, and reusability to our cloud resources.

In this second article, we'll dive into [Terraform](https://developer.hashicorp.com/terraform), a leading IaC tool from [HashiCorp](https://www.hashicorp.com/en). We will replicate the exact same serverless architecture from Step 1, but this time, every resource will be defined in human-readable configuration files. By the end, you'll not only have deployed our serverless app with Terraform but also gained a solid foundational understanding of how to manage your AWS infrastructure declaratively.

## Why IaC and Terraform

Imagine trying to deploy the same application across multiple environments (development, staging, production) or needing to quickly spin up an identical setup for a new team member. Manually clicking through the AWS Console for each resource would be tedious and prone to inconsistencies. IaC solves this by:

* Automation: Automate the entire infrastructure provisioning process.
* Consistency: Ensure identical environments every time, eliminating configuration drift.
* Version Control: Track changes to the infrastructure definitions, just like application code.
* Reusability: Create modular, reusable components for common infrastructure patterns.
* Collaboration: Teams can work together on infrastructure definitions, leveraging standard development workflows.

Terraform, in particular, is an excellent choice due to its:

* Declarative Nature: We describe the desired state of our infrastructure, and Terraform figures out how to achieve it.
* Cloud Agnostic: It supports a vast ecosystem of providers, allowing us to manage infrastructure across multiple platforms with a single tool.
* Strong Community and Ecosystem: A large user base and a rich collection of pre-built modules and resources.

## Prerequisites

Before we begin, make sure you have the following in place:

1. An [AWS Account](https://aws.amazon.com/): With appropriate permissions, an [admin user is recommended](/blog/getting-started-with-aws-core-concepts-and-iam#create-a-user-and-a-group).
2. Terraform CLI Installed: Follow the instructions on the [official HashiCorp website](https://developer.hashicorp.com/terraform/install#linux).
3. AWS CLI Configured: Ensure your AWS CLI is [installed](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) and [configured with credentials](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html#cli-configure-files-methods) that Terraform can use to provision resources by running `aws configure`.
4. Familiarity with the [architecture from Step 1](/blog/serverless-backend-on-aws-step-1-s3-lambda-and-api-gateway#final-architecture).

## Terraform Core Concepts

Before writing any code, let's briefly recap some essential Terraform concepts that will be crucial for this tutorial. If you're new to Terraform, understanding these will make the configuration much clearer.

Take note of the very useful [Terraform Registry](https://registry.terraform.io/). It is practical to keep it open in a new tab as you read through this article.

* **HCL:** Terraform's native configuration language, designed to be human-readable. Stands for HashiCorp Configuration Language.
* **Provider:** This is a plugin that allows Terraform to interact with a specific cloud. We'll use the [`aws` provider](https://registry.terraform.io/providers/hashicorp/aws/).
* **Resource (`resource`):** A resource block defines a piece of infrastructure that Terraform will manage, like an S3 bucket ([`aws_s3_bucket`](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/s3_bucket)) or a Lambda function ([`aws_lambda_function`](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lambda_function)). We specify its desired properties within the block.
* **Data Source (`data`):** Its core purpose is to read information about existing infrastructure or external sources that Terraform did not create and does not manage in the current configuration. In special cases, it is used to compute or transform data locally.
* **Input Variables (`variable`):** These allow us to parameterize our configurations, making them flexible and reusable. For example, we can define a variable for the AWS region or the S3 bucket name.
* **Output Variables (`output`):** These expose specific values from the deployed infrastructure that can be useful for other configurations or for one to easily retrieve, e.g. the URL of the deployed API Gateway.
* **State File (`terraform.tfstate`):** This is a crucial JSON file that Terraform generates and maintains. It maps the real-world infrastructure to the configuration, keeping track of what's been deployed and its current attributes. Never modify this file manually!

The order of blocks in a `.tf` file doesn't matter, Terraform's dependency graph mechanism automatically determines the correct order for creating, updating, or destroying resources based on their interconnections, regardless of how they are arranged in the file.

## Set Up the Terraform Project

First, create a new directory for our Terraform configuration files.

```bash
mkdir aws-serverless-terraform
cd aws-serverless-terraform
```

Inside this directory, we'll create several `.tf` files to organize our configuration.

### `variables.tf`

This file will define the input variables.

```hcl
variable "aws_region" {
  description = "The AWS region where resources will be deployed."
  type        = string
  default     = "eu-central-1"
}

variable "s3_bucket_name" {
  description = "The unique name for the S3 bucket."
  type        = string
  default     = "serverless-website-terraform"
}
```

### `main.tf` - Provider and Region

This file will contain the primary resources for our serverless application.

```hcl
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}
```

The `~>` operator, often called the "pessimistic operator", specifies a version where the last component of the version number can increment, but the rest must stay the same. For `version = "~> 6.0"`, it means any version greater than or equal to `6.0` but less than `7.0`.

Also, notice how we make use of the variable we created earlier.

*Explore Further:* [AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs).

### `main.tf` - S3 Bucket

We need one for Static Website Hosting. As well as a policy to allow public read access to the website content. This is the same policy we used [in Step 1](/blog/serverless-backend-on-aws-step-1-s3-lambda-and-api-gateway#set-up-the-static-website-on-amazon-s3) for our bucket.

```hcl
resource "aws_s3_bucket" "website_bucket" {
  bucket = var.s3_bucket_name
  force_destroy = true  # Allows the bucket to be deleted even if not empty
}

resource "aws_s3_bucket_ownership_controls" "website_bucket_ownership" {
  bucket = aws_s3_bucket.website_bucket.id
  rule {
    object_ownership = "BucketOwnerPreferred" # Ensures object ownership is consistent
  }
}

resource "aws_s3_bucket_public_access_block" "website_bucket_public_access_block" {
  bucket = aws_s3_bucket.website_bucket.id

  block_public_policy     = false
  restrict_public_buckets = false

  depends_on = [
    aws_s3_bucket_ownership_controls.website_bucket_ownership
  ]
}

resource "aws_s3_bucket_policy" "website_bucket_policy" {
  bucket = aws_s3_bucket.website_bucket.id

  policy = jsonencode({
    "Version" = "2012-10-17",
    "Statement" = [
      {
        "Sid"    = "PublicReadGetObject",
        "Effect" = "Allow",
        "Principal" = "*",
        "Action" = "s3:GetObject",
        "Resource" = "${aws_s3_bucket.website_bucket.arn}/*"
      }
    ]
  })

  depends_on = [
    aws_s3_bucket_public_access_block.website_bucket_public_access_block
  ]
}

resource "aws_s3_bucket_website_configuration" "website_bucket_config" {
  bucket = aws_s3_bucket.website_bucket.id
  # We will soon create the 2 html files
  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "error.html"
  }

  depends_on = [
    aws_s3_bucket_policy.website_bucket_policy,
    aws_s3_bucket_public_access_block.website_bucket_public_access_block,
    aws_s3_bucket_ownership_controls.website_bucket_ownership
  ]
}
```

We are using HCL to construct the JSON policy, notice we are using `=` to assign values now and secondly, the way we refer to the resource has changed:

* `aws_s3_bucket.website_bucket` is a **resource reference**.
  * `aws_s3_bucket` is the resource type, an S3 bucket.
  * `website_bucket` is the local name we gave to the specific S3 bucket resource block.
* `.arn`: When Terraform creates the S3 bucket, it makes its [ARN](/blog/serverless-backend-on-aws-step-1-s3-lambda-and-api-gateway#optional-understand-arn) available as an attribute. You can see all the attributes available for each resource, in the corresponding registry entry.
* `${...}`: This is [string interpolation](https://developer.hashicorp.com/terraform/language/expressions/strings#interpolation) in HCL. Terraform will evaluate this expression and insert the actual ARN of the S3 bucket (it just created) into the policy string.
* `aws_s3_bucket_public_access_block` disables the "Block all public access" setting, like [we manually did in Step 1](/blog/serverless-backend-on-aws-step-1-s3-lambda-and-api-gateway#set-up-the-static-website-on-amazon-s3).
* An alternative to using `force_destroy`, is running `aws s3 rm s3://serverless-website-terraform --recursive` before [the clean up in the end](/blog/serverless-backend-on-aws-step-2-iac-with-terraform#clean-up), so that the bucket gets emptied.

*Explore Further:* [S3 Bucket](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/s3_bucket), [S3 Bucket Ownership Controls](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/s3_bucket_ownership_controls), [S3 Public Access Block](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/s3_bucket_public_access_block), [S3 Bucket Policy](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/s3_bucket_policy) and [S3 Bucket Website Configuration](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/s3_bucket_website_configuration).

### `main.tf` - Lambda Function

```hcl
resource "aws_iam_role" "lambda_execution_role" {
  name = "my-serverless-greeting-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Action = "sts:AssumeRole",
        Effect = "Allow",
        Principal = {
          Service = "lambda.amazonaws.com"
        },
      },
    ],
  })
}

resource "aws_iam_role_policy_attachment" "lambda_policy_attachment" {
  role       = aws_iam_role.lambda_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_lambda_function" "my_serverless_greeting_function" {
  function_name = "myServerlessGreetingFunction"
  handler       = "lambda_function.lambda_handler"
  runtime       = "python3.13"
  role          = aws_iam_role.lambda_execution_role.arn
  # We'll upload the lambda_function.py code later
  filename      = "lambda_function.zip"
  source_code_hash = filebase64sha256("lambda_function.zip")

  depends_on = [aws_iam_role_policy_attachment.lambda_policy_attachment]
}
```

This section defines the AWS Lambda function and its associated permissions.

* `aws_iam_role.lambda_execution_role`: This resource creates an [IAM Role](/blog/getting-started-with-aws-core-concepts-and-iam#use-iam-roles-for-aws-services) specifically for our Lambda function. The `assume_role_policy` grants Lambda the permission to assume this role.
* `aws_iam_role_policy_attachment.lambda_policy_attachment`: This resource attaches the standard `AWSLambdaBasicExecutionRole` managed policy to the IAM role created above. This policy provides the necessary permissions for the Lambda function to execute and, crucially, to push its logs to Amazon CloudWatch Logs.
* `aws_lambda_function.my_serverless_greeting_function`: This is the resource that defines our actual Lambda function. Notice how the `role` here expects an [ARN](/blog/serverless-backend-on-aws-step-1-s3-lambda-and-api-gateway#optional-understand-arn), unlike the policy attachment that expected a name. The `filename` and `source_code_hash` attributes tell Terraform where to find the Lambda's code and help it detect changes for updates. The IAM role (implicitly because of `role =`) and policy (explicitly because of `depends_on`) are established before the Lambda function attempts to use them.

*Explore Further:* [IAM Role](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role), [IAM Role Policy](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role_policy_attachment) and [Lambda Function](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lambda_function).

### `main.tf` - API Gateway

Remember that in [Step 1](/blog/serverless-backend-on-aws-step-1-s3-lambda-and-api-gateway#expose-the-lambda-via-an-api-gateway) we completed the following actions:

1. Create an API and a resource (`/greeting`). Note that "resource" here has a different meaning than [Terraform's resource](/blog/serverless-backend-on-aws-step-2-iac-with-terraform#terraform-core-concepts).
2. Enable CORS.
3. Create a `GET` method and an integration (Lambda function) for it.
4. Deploy the API.

**1. Create an API and a resource:**

```hcl
resource "aws_api_gateway_rest_api" "serverless_greeting_api" {
  name        = "ServerlessGreetingAPI"
  description = "API Gateway for serverless greeting function"
}

resource "aws_api_gateway_resource" "greeting_resource" {
  rest_api_id = aws_api_gateway_rest_api.serverless_greeting_api.id
  parent_id   = aws_api_gateway_rest_api.serverless_greeting_api.root_resource_id
  path_part   = "greeting"
}
```

First, `aws_api_gateway_rest_api` creates the top-level API. Then, `aws_api_gateway_resource` defines a specific path (`/greeting`) under this API. This path will be where our web application sends requests.

*Explore Further:* [API Gateway REST API](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/api_gateway_rest_api) and [API Gateway Resource](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/api_gateway_resource).

**2. Enable CORS:**

Since our S3-hosted website and API Gateway will be on different domains, we need to configure Cross-Origin Resource Sharing (CORS) to allow the browser to make cross-origin requests.

```hcl
resource "aws_api_gateway_method" "options_method" {
  rest_api_id   = aws_api_gateway_rest_api.serverless_greeting_api.id
  resource_id   = aws_api_gateway_resource.greeting_resource.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "options_integration" {
  rest_api_id = aws_api_gateway_rest_api.serverless_greeting_api.id
  resource_id = aws_api_gateway_resource.greeting_resource.id
  http_method = aws_api_gateway_method.options_method.http_method
  type        = "MOCK"
  request_templates = {
    "application/json" = "{ 'statusCode': 200 }"
  }
}

resource "aws_api_gateway_method_response" "options_200" {
  rest_api_id = aws_api_gateway_rest_api.serverless_greeting_api.id
  resource_id = aws_api_gateway_resource.greeting_resource.id
  http_method = aws_api_gateway_method.options_method.http_method
  status_code = "200"
  response_models = {
    "application/json" = "Empty"
  }
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true,
    "method.response.header.Access-Control-Allow-Methods" = true,
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_integration_response" "options_integration_200" {
  rest_api_id = aws_api_gateway_rest_api.serverless_greeting_api.id
  resource_id = aws_api_gateway_resource.greeting_resource.id
  http_method = aws_api_gateway_method.options_method.http_method
  status_code = aws_api_gateway_method_response.options_200.status_code

  response_templates = {
    "application/json" = "" # The response body for the preflight is typically empty.
  }

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
    "method.response.header.Access-Control-Allow-Methods" = "'GET,OPTIONS'",
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }
  depends_on = [aws_api_gateway_method.options_method]
}
```

Web browsers typically issue an automatic **preflight `OPTIONS` request** before sending the actual `GET` request to a cross-origin resource. This preflight request is a way for the browser to check what methods and headers are allowed by the server for the target resource, it is handled by the gateway before it even considers invoking the Lambda!

Since the preflight request doesn't invoke the Lambda, the Lambda cannot add the necessary CORS headers to its response. Therefore, we must explicitly configure the gateway to respond to the request with the correct CORS headers directly. This is why we need these four resources for the `OPTIONS` method:

* `aws_api_gateway_method`: Defines the `OPTIONS` HTTP method for our `/greeting` resource.
* `aws_api_gateway_integration`: Instead of integrating with a Lambda, we use a `MOCK` integration for the `OPTIONS` method. A `MOCK` integration allows API Gateway to respond directly without invoking any backend service. We configure it to return a `200` status code, indicating that the preflight request was successful.
* `aws_api_gateway_method_response`: This resource defines the expected response schema (in terms of status codes, content types, and expected headers) for the `OPTIONS` method when a `200` status code is returned.
  * Valid Status Codes: What HTTP status codes are allowed for a given method.
  * Response Models: If you had complex JSON responses, this is where you'd link them to a schema for validation.
  * Exposed Headers: If you don't declare a header here, even if `integration_response` tries to set it, the gateway will strip it out before sending it to the client.
* `aws_api_gateway_integration_response`: Defines how the `MOCK` integration's response is mapped to the `method_response`. This is where the actual CORS headers are set.

*Explore Further:* [HTTP Method](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/api_gateway_method), [HTTP Method Integration](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/api_gateway_integration), [HTTP Method Response](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/api_gateway_method_response) and [HTTP Method Integration Response](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/api_gateway_integration_response).

**3. Create the `GET` method and integration for it:**

```hcl
resource "aws_api_gateway_method" "greeting_method" {
  rest_api_id   = aws_api_gateway_rest_api.serverless_greeting_api.id
  resource_id   = aws_api_gateway_resource.greeting_resource.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "lambda_integration" {
  rest_api_id = aws_api_gateway_rest_api.serverless_greeting_api.id
  resource_id = aws_api_gateway_resource.greeting_resource.id
  http_method = aws_api_gateway_method.greeting_method.http_method
  integration_http_method = "POST" # Lambda functions are invoked via POST requests by API Gateway
  type                    = "AWS_PROXY" # Use Lambda Proxy integration
  uri                     = aws_lambda_function.my_serverless_greeting_function.invoke_arn
}
```

The `aws_api_gateway_method` defines the HTTP `GET` method for our `/greeting` resource, allowing unauthenticated access. The `aws_api_gateway_integration` then links this `GET` method to our Lambda function. We use `AWS_PROXY` integration, which [simplifies data mapping as previously discussed](/blog/serverless-backend-on-aws-step-1-s3-lambda-and-api-gateway#expose-the-lambda-via-an-api-gateway).

*Explore Further:*  [HTTP Method](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/api_gateway_method) and [HTTP Method Integration](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/api_gateway_integration).

**4. Deploy the API:**

```hcl
resource "aws_api_gateway_deployment" "api_deployment" {
  rest_api_id = aws_api_gateway_rest_api.serverless_greeting_api.id
  # Force a new deployment when API methods or resources change
  triggers = {
    redeployment = sha1(jsonencode([
      aws_api_gateway_resource.greeting_resource.id,
      aws_api_gateway_method.greeting_method.id,
      aws_api_gateway_integration.lambda_integration.id,
    ]))
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_api_gateway_stage" "prod_stage" {
  deployment_id = aws_api_gateway_deployment.api_deployment.id
  rest_api_id   = aws_api_gateway_rest_api.serverless_greeting_api.id
  stage_name    = "prod"
}

resource "aws_lambda_permission" "apigateway_lambda_permission" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.my_serverless_greeting_function.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_api_gateway_rest_api.serverless_greeting_api.execution_arn}/*"
}
```

* `aws_api_gateway_deployment` creates a deployable snapshot of our API. The `triggers` block ensures a new deployment happens if any relevant API Gateway components change.
* `aws_api_gateway_stage` then defines a `"prod"` stage for this deployment, making it accessible via a public URL.
* Finally, `aws_lambda_permission` grants API Gateway the necessary permissions to invoke our Lambda function. The `/*` part allows invocation from any stage, method and resource path within API Gateway.

*Explore Further:* [API Gateway REST Deployment](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/api_gateway_deployment), [API Gateway Stage](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/api_gateway_stage) and [AWS Lambda permission](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lambda_permission).

### `outputs.tf`

This file will define the output variables, which will display important information after Terraform applies the configuration.

```hcl
output "website_url" {
  description = "The URL of the static website hosted on S3."
  value       = aws_s3_bucket_website_configuration.website_bucket_config.website_endpoint
}

output "api_gateway_invoke_url" {
  description = "The invoke URL for the API Gateway endpoint."
  value       = "${aws_api_gateway_stage.prod_stage.invoke_url}${aws_api_gateway_resource.greeting_resource.path}"
}
```

Notice how we are using string interpolation again, as well as resource references.

### Prepare the Lambda

Create a file named `lambda_function.py` in your `aws-serverless-terraform` directory. This is the same [Python code from Step 1](/blog/serverless-backend-on-aws-step-1-s3-lambda-and-api-gateway#create-the-aws-lambda-function).

```python
import json

def lambda_handler(event, context):
    """
    This function returns a simple greeting message.
    """
    print("Received event:", json.dumps(event)) # Logging to Amazon CloudWatch Logs!

    # You can customize the message here
    message = "Hello from your serverless Lambda function (managed by Terraform)!"

    return {
        "statusCode": 200,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*" # Required for CORS
        },
        "body": json.dumps({"message": message})
    }
```

Lambda functions require their code to be packaged into a `.zip` file:

```bash
zip lambda_function.zip lambda_function.py
```

### Create the HTML Pages

Create `index.html` and `error.html` in your `aws-serverless-terraform` directory. These are also the [same files from Step 1](/blog/serverless-backend-on-aws-step-1-s3-lambda-and-api-gateway#set-up-the-static-website-on-amazon-s3). Remember, we'll update the `apiGatewayUrl` in `index.html` after Terraform has deployed the API Gateway and we get the output URL.

This should be your local `aws-serverless-terraform` directory at this point:

```bash
.
├── error.html
├── index.html
├── lambda_function.py
├── lambda_function.zip
├── main.tf
├── outputs.tf
└── variables.tf
```

## Run Terraform Commands

Now that our configuration files are ready, let's use the Terraform CLI to deploy our infrastructure.

**1. `terraform init`:**

Initializes a working directory containing Terraform configuration files. This is always the first command we run in a new or cloned Terraform project. It performs several key tasks:

* Downloads Providers: It reads the `required_providers` block in our configuration and downloads the necessary provider plugins.
* Sets Up Backend: If we define a [remote backend](https://developer.hashicorp.com/terraform/language/backend/remote), which we should for production, `init` configures it for storing the state file.
* Creates `.terraform` directory: This directory stores downloaded providers, modules, and other internal Terraform files.
* Generates `.terraform.lock.hcl`: This file locks the exact versions of providers and modules used, ensuring consistent deployments across different environments and team members.

Run it in your `aws-serverless-terraform` directory:

```bash
terraform init
```

You should see output similar to this:

```bash
Initializing the backend...
Initializing provider plugins...
- Finding hashicorp/aws versions matching "~> 6.0"...
- Installing hashicorp/aws v6.4.0...
- Installed hashicorp/aws v6.4.0 (signed by HashiCorp)
Terraform has created a lock file .terraform.lock.hcl to record the provider
selections it made above. Include this file in your version control repository
so that Terraform can guarantee to make the same selections by default when
you run "terraform init" in the future.
```

**2. `terraform fmt`:**

It is a utility command that rewrites our Terraform configuration files to a canonical format:

```bash
terraform fmt
```

If any files were reformatted, they will be listed.

**3. `terraform validate`:**

Checks our configuration files for syntax errors, it's a quick way to catch configuration issues locally.

```bash
terraform validate
```

If your configuration is valid, you'll see a success message:

```bash
Success! The configuration is valid.
```

**4. `terraform plan`:**

Generates an execution plan. This is a "dry run" that shows us exactly what Terraform will do to achieve the desired state defined in our configuration, without actually making any changes to our infrastructure. It details:

* Resources that will be added (`+`).
* Resources that will be changed (`~`).
* Resources that will be destroyed (`-`).

```bash
terraform plan
```

Examine the output. You should see a plan to add 19 resources: S3 bucket, S3 policy, IAM role/policy, Lambda function, API Gateway components, etc.

```bash
Plan: 19 to add, 0 to change, 0 to destroy.

Changes to Outputs:
  + api_gateway_invoke_url = (known after apply)
  + website_url            = (known after apply)
```

**5. `terraform apply`:**

This is the command that actually provisions our infrastructure. It executes the actions determined by the `terraform plan`.

When we run `terraform apply`, Terraform will display the plan again and prompt for confirmation before making any changes. This is a safeguard to prevent accidental deployments.

```bash
terraform apply
```

Type `yes` when prompted and press Enter to proceed.

Terraform will now communicate with AWS, create the resources, and update its **state file** (`terraform.tfstate`). This file is created in our working directory and is essential for Terraform to understand the current state of our infrastructure.

Once `apply` is complete, you will see the [output variables we defined](/blog/serverless-backend-on-aws-step-2-iac-with-terraform#outputstf) in `outputs.tf`.

```bash
Apply complete! Resources: 19 added, 0 changed, 0 destroyed.

Outputs:

api_gateway_invoke_url = "https://01485b3de3.execute-api.eu-central-1.amazonaws.com/prod/greeting"
website_url = "serverless-website-terraform.s3-website.eu-central-1.amazonaws.com"
```

Copy the API Gateway Invoke URL, if you enter it in your browser, you should see our greeting message.

### Update `index.html` and Upload

Just like in [Step 1](/blog/serverless-backend-on-aws-step-1-s3-lambda-and-api-gateway#expose-the-lambda-via-an-api-gateway), we need to update `index.html` with the new API Gateway Invoke URL and upload it to the S3 bucket.

1. Open your local `index.html` file.
2. Replace `YOUR_API_GATEWAY_INVOKE_URL_HERE` with the `api_gateway_invoke_url` from the Terraform output.
3. Upload the updated `index.html` to the S3 bucket. Terraform does not manage the content of the S3 bucket directly by default.

    Let's use AWS CLI again, which is recommended for automation:

    ```bash
    aws s3 cp index.html s3://serverless-website-terraform/index.html
    aws s3 cp error.html s3://serverless-website-terraform/error.html
    ```

    Remember that S3 often caches content. You might need to refresh your browser cache (Ctrl+F5 or Cmd+Shift+R) when testing the website after updating `index.html`.

## Test the Web App

1. Open the `website_url` from your Terraform outputs in your browser.
2. You should see the `index.html` page.
3. Click the "Get Greeting" button.

If everything is set up correctly, you should see the greeting message delivered by the Lambda function, now fully provisioned and managed by Terraform!

* ![Greeting is working.](/imgs/aws_greeting_is_working_terraform.webp)

How awesome is that! The Cloudwatch Log Group has been successfully created as well.

## Final Architecture

This is [the exact same final architecture from Step 1](/blog/serverless-backend-on-aws-step-1-s3-lambda-and-api-gateway#final-architecture), but now every component is declaratively defined and managed by Terraform, ensuring consistency and ease of replication!

![AWS final architecture of S3 static website hosting, an API Gateway fronting a Lambda function containing dynamic code while also sending logs to CloudWatch. Powered by Terraform.](/imgs/aws_final_s3_api_gateway_lambda_architecture_terraform.webp)

## Clean Up

To avoid unnecessary charges, it's essential to destroy the resources we've created. With Terraform, this is incredibly simple!

The `terraform destroy` command will remove all resources defined in our current Terraform configuration and managed by the state file:

```bash
terraform destroy
```

Terraform will show a plan of all the resources it intends to destroy. Type `yes` when prompted and press Enter to confirm.

Terraform will proceed to de-provision all the AWS resources. Notice how a `terraform.tfstate.backup` file is created, it is the state we just destroyed!

## (Optional) Explore Further

* Remote Backend Configuration: Learn how to store your Terraform state remotely using services like [AWS S3 for storage and DynamoDB for state locking](https://developer.hashicorp.com/terraform/language/backend/s3).
* Explore the [HashiCorp Certified Terraform Associate companion labs repository](https://github.com/daveprowse/tac-course) by [Dave Prowse](https://prowse.tech/), it is a highly recommended learning resource.

## Final Words

Congratulations! You've not only deployed a serverless backend using AWS Lambda, S3, and API Gateway, but you've done so using the power of Terraform. You've now experienced the immense benefits of Infrastructure as Code.

By transforming manual steps into declarative code, you've taken a significant leap towards more efficient and scalable cloud deployments. This foundational understanding of Terraform will empower you to manage increasingly complex cloud architectures with confidence. Thanks for reading!
