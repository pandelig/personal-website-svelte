---
slug: "serverless-backend-on-aws-step-1-s3-lambda-and-api-gateway"
date: "22 Jul 2025"
date_updated: ""
tags: ["tutorial", "aws", "serverless"]
title: "Serverless Backend on AWS - Step 1: S3, Lambda and API Gateway"
meta_description: "Learn to build a scalable serverless backend on AWS from scratch with Pantelis Deligiannidis. This tutorial covers setting up static website hosting on Amazon S3, creating a dynamic API with AWS Lambda, and exposing it via Amazon API Gateway."
---

1. (You are here) Step 1: Lambda, S3, and API Gateway
2. [Step 2: Leveraging the power of IaC with Terraform](/blog/serverless-backend-on-aws-step-2-iac-with-terraform)

Serverless architectures have emerged as a powerful paradigm for building scalable, cost-effective, and highly available applications. By abstracting away the underlying infrastructure, serverless allows developers to focus purely on writing code, letting the cloud provider manage everything from server provisioning to patching.

This first article will guide you through building a simple serverless backend for a web application using key AWS services: **Amazon S3** for static website hosting, **AWS Lambda** for executing server-side code without managing servers, and **Amazon API Gateway** to expose the Lambda function as a public API endpoint. You'll learn how these services work together to create [a robust and efficient solution](/blog/serverless-backend-on-aws-step-1-s3-lambda-and-api-gateway#final-architecture) for handling web requests.

In step 2, we will repeat the process, but this time we will be making use of **Terraform**, an Infrastructure as Code (IaC) tool that allows you to define, provision, and manage infrastructure resources across various cloud providers using declarative configuration files.

## Prerequisites

Before we begin, ensure you have the following:

1. An [AWS Account](https://aws.amazon.com/): With appropriate permissions to create S3 buckets, Lambda functions, and API Gateway endpoints. It is recommended to avoid using the root user and to [use an admin user instead](/blog/getting-started-with-aws-core-concepts-and-iam#create-a-user-and-a-group).
2. Familiarity with [basic AWS terminology](/blog/getting-started-with-aws-core-concepts-and-iam#optional-abbreviations) is recommended.
3. Basic understanding of Python is also recommended, our (very simple) Lambda function will be written in Python.

## Set up the Static Website on Amazon S3

Amazon S3 (Simple Storage Service) is an object storage service. It's a perfect choice for hosting static websites because of its reliability and ability to serve content directly from the cloud.

1. **Create an S3 Bucket:**
    * Navigate to the S3 service in the [AWS Management Console](https://console.aws.amazon.com/).
    * AWS Region: Select a region close to you (or to your users), e.g. `eu-central-1` for Frankfurt, from the top right of the screen.
    * Click "Create bucket".
    * Bucket Name: Choose a globally unique name, e.g. `your-name-serverless-website`.
    * Object Ownership: Leave as `ACLs disabled`.
    * Block Public Access settings: Uncheck `Block all public access` to allow the website to be publicly accessible. You will receive a warning; acknowledge it.
    * Leave the other settings as default.
    * Click "Create bucket".

2. **Upload Website Content:**
    * Create two simple files locally, we will then upload them to the newly created bucket:
        * `index.html`:

        ```html
        <!DOCTYPE html>
        <html>
        <head>
            <title>Serverless Demo</title>
            <style>
                body { font-family: Arial, sans-serif; text-align: center; margin-top: 50px; }
                button { padding: 10px 20px; font-size: 16px; cursor: pointer; }
                #response { margin-top: 20px; font-weight: bold; color: green; }
            </style>
        </head>
        <body>
            <h1>Welcome to Our Serverless Web App!</h1>
            <p>Click the button below to invoke our AWS Lambda function:</p>
            <button onclick="invokeLambda()">Get Greeting</button>
            <div id="response"></div>

            <script>
                async function invokeLambda() {
                    const apiGatewayUrl = "YOUR_API_GATEWAY_INVOKE_URL_HERE"; // We'll update this after deploying the API Gateway
                    try {
                        const response = await fetch(apiGatewayUrl);
                        const data = await response.json();
                        document.getElementById("response").innerText = "Lambda says: " + data.message;
                    } catch (error) {
                        console.error("Error invoking Lambda:", error);
                        document.getElementById("response").innerText = "Error: Could not get greeting.";
                        document.getElementById("response").style.color = "red";
                    }
                }
            </script>
        </body>
        </html>
        ```

        * `error.html`:

        ```html
        <!DOCTYPE html>
        <html>
        <head>
            <title>Error!</title>
        </head>
        <body>
            <h1>Oops! Something went wrong.</h1>
            <p>Please try again later.</p>
        </body>
        </html>
        ```

    * In the S3 console, click "Upload", then "Add files", and select `index.html` and `error.html`.
    * Click "Upload".

3. **Configure Static Website Hosting:**
    * In the S3 bucket, go to the "Properties" tab.
    * Scroll down to "Static website hosting" and click "Edit".
    * Select `Enable`.
    * Index document: `index.html`
    * Error document: `error.html`
    * Click "Save changes".
    * After saving, note the "Bucket website endpoint" URL. This is where the website will be accessible.

4. **Add a Bucket Policy for Public Read Access:**
    * Go to the "Permissions" tab of the S3 bucket.
    * Under "Bucket policy", click "Edit".
    * Paste the following policy, replacing `your-name-serverless-website` with your actual bucket name:

    ```json
    {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "PublicReadGetObject",
                "Effect": "Allow",
                "Principal": "*",
                "Action": "s3:GetObject",
                "Resource": "arn:aws:s3:::your-name-serverless-website/*"
            }
        ]
    }
    ```

    The S3 bucket policy you've added explicitly grants public read access to all objects within the S3 bucket.
    * `"Effect": "Allow"`: Specifies that this policy grants permission.
    * `"Principal": "*"`: Designates that anyone (any user or service) can access the resources.
    * `"Action": "s3:GetObject"`: Allows the action of retrieving objects from the bucket. Without this, no one could download the `index.html` or `error.html` files.
    * `"Resource": "arn:aws:s3:::your-name-serverless-website/*"`: This is an [ARN](/blog/serverless-backend-on-aws-step-1-s3-lambda-and-api-gateway#optional-understand-arn), it specifies that the permissions apply to all objects (`/*`) within the bucket (`your-name-serverless-website`).

    * Click "Save changes".
    * Now, visit your "Bucket website endpoint" URL. You should see our `index.html` page.

![Static website on amazon s3.](/imgs/static_website_on_amazon_s3.webp)

### (Optional) Understand ARN

The generic Amazon Resource Name (ARN) format is `arn:partition:service:region:account-id:resource`, a standardized way to uniquely identify AWS resources. Each colon-delimited segment provides specific details:

* `arn` is a simple prefix.
* `partition` indicates the AWS environment e.g. `aws`.
* `service` identifies the AWS product e.g. `s3`, `ec2`.
* `region` specifies the geographic area, omitted for global services like IAM or S3 buckets.
* `account-id` is the 12-digit AWS account number.
* `resource` details the specific entity, e.g. an S3 bucket name, an EC2 instance ID, or a path/ID for a more specific resource within a service.

Double colons (`::`) indicate an omitted or empty field that would typically be present in the full ARN structure.

## Create the AWS Lambda Function

AWS Lambda is a serverless compute service that lets you run code without provisioning or managing servers. You pay only for the compute time you consume, there is no charge when your code is not running.

1. **Create an IAM Role for Lambda:**
    * Lambda functions need permission to interact with other AWS services. We'll create an [IAM role](/blog/getting-started-with-aws-core-concepts-and-iam#use-iam-roles-for-aws-services) for this.
    * Navigate to the IAM service in the AWS Management Console.
    * Go to "Roles" and click "Create role".
    * Trusted entity type: `AWS service`
    * Use case: `Lambda`
    * Click "Next".
    * Permissions policies: Search for and select `AWSLambdaBasicExecutionRole`. This grants permissions for Lambda to write logs to CloudWatch. Feel free to click the `+` icon to expand the policy and compare it with the policy we created earlier for the S3 bucket.
    * Click "Next".
    * Role name: `lambda-basic-execution-role`
    * Click "Create role".

2. **Create the Lambda Function:**
    * Navigate to the Lambda service in the AWS Management Console.
    * Click "Create a function".
    * Select `Author from scratch`.
    * Function name: `myServerlessGreetingFunction`
    * Runtime: `Python 3.13`
    * Architecture: `x86_64`
    * Select "Change default execution role" -> "Use an existing role" and choose the `lambda-basic-execution-role` we just created.

    Click "Create function" and you should see something similar to this:

    ![AWS lambda function created.](/imgs/aws_lambda_function_created.webp)

3. **Add Lambda Function Code:**
    * Scroll down to the "Code source" section.
    * Replace the default code in `lambda_function.py` with the following Python code:

        ```python
        import json

        def lambda_handler(event, context):
            """
            This function returns a simple greeting message.
            """
            print("Received event:", json.dumps(event)) # Logging to Amazon CloudWatch Logs!

            # You can customize the message here
            message = "Hello from your serverless Lambda function!"

            return {
                "statusCode": 200,
                "headers": {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*" # Required for CORS
                },
                "body": json.dumps({"message": message})
            }
        ```

        * `event`: This dictionary contains the data passed to the Lambda function when it's invoked. The structure of this `event` object varies greatly depending on the AWS service that triggers the Lambda.
        * `context`: This object provides runtime information about the invocation, function, and execution environment. It contains useful information like the function's [ARN](/blog/serverless-backend-on-aws-step-1-s3-lambda-and-api-gateway#optional-understand-arn), the amount of memory allocated, the remaining execution time, and more. It's crucial for more advanced scenarios, e.g. timing out long-running processes.
        * The `return` statement defines the HTTP response that API Gateway will send back to the client, in this case, our `index.html` page. When API Gateway acts as the trigger for a Lambda function, it expects a specific JSON format in return for a successful HTTP response.
        * `"Content-Type": "application/json"`:This header tells the client that the content of the response body is in JSON format. This is what our code in `index.html` expects (`const data = await response.json();`).
        * `"Access-Control-Allow-Origin": "*"`: The `index.html` page is hosted on an S3 bucket and tries to make an API call to the API Gateway endpoint which will have a different domain, web browsers enforce a security policy called the [Same-Origin Policy](https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy) which prevents a web page from making requests to a different domain than the one it originated from, by default. `"*"` is a wildcard that tells the browser: "Allow requests from any origin (any domain)".
        * `json.dumps()`: This function serializes a Python dictionary or list into a JSON formatted string. API Gateway expects the `body` to be a string.
    * Click "Deploy".

4. **Test the Lambda Function:**
    * Click the "Test" tab next to "Code".
    * Click "Create new event".
    * Event name: `testEvent`
    * Template: Select `Hello World`, the content doesn't matter much for this simple function as it doesn't use `event` data.

        ![AWS lambda test Hello World template.](/imgs/aws_lambda_test_hello_world_template.webp)

    * Click "Save".

    Now click the "Test" button. You should see something like this:

    ![AWS lambda successful test.](/imgs/aws_lambda_test_output.webp)

    Notice how our greeting is visible in the response and the `event` we printed is visible in the logs. It is recommended to click the link(s) visible in the screenshot, to navigate and study the CloudWatch logs.

## Expose the Lambda via an API Gateway

Amazon API Gateway is a fully managed service that makes it easy to create, publish, maintain, monitor, and secure APIs. It acts as a "front door" for applications to access data, business logic, or functionality from your backend services, such as Lambda.

1. **Create a REST API in API Gateway:**
    * Navigate to the API Gateway service in the AWS Management Console.
    * Click "Create an API".
    * Click "Build" under "REST API".
    * API details: `New API`
    * API name: `ServerlessGreetingAPI`
    * Endpoint type: `Regional`
    * IP address type: `IPv4`
    * Click "Create API".

2. **Create a Resource:**
    * After selecting the newly created "ServerlessGreetingAPI", in the left navigation pane click "Resources" -> "Create resource".
    * Resource Path: `/`
    * Resource Name: `greeting`
    * Enable the `CORS` option, this is essential for making the API accessible to apps hosted on different domains (like our s3 website).
    * Click "Create resource".

    ![AWS create an API Gateway resource.](/imgs/aws_create_api_gateway_resource.webp)

3. **Create a GET Method:** In an API Gateway, a method defines the specific HTTP verb (e.g. GET, POST, PUT, DELETE) that one can use to interact with the resource.

    * With the "/greeting" resource selected, click "Create method".
    * Method type: `GET`
    * Integration type: `Lambda Function`
    * Lambda Proxy integration: Check this box, it significantly reduces complexity as it eliminates the need for manual mapping of the incoming client request to the `event` the lambda function expects, as well as the mapping of the object the lambda function returns to the response the API Gateway sends to the client.

        It essentially takes the entire incoming request and hands it over to the Lambda function, and then takes the entire response from the Lambda function and sends it back to the client.
    * Lambda function: Select the region where your Lambda function is located and then select it from the dropdown.
    * Click "Create method".

4. **Deploy the API:**
    * Click "Deploy API".
    * Deployment stage: `New Stage`
    * Stage name: `prod`
    * Click "Deploy".
    * After deployment, API Gateway will provide an "Invoke URL". Copy this URL. Important: We will have to append `/greeting` in the end of the url!

    ![AWS API Gateway deployment.](/imgs/aws_api_gateway_deployment.webp)

    Try entering the URL you just copied into a new tab in your browser, then try again after appending `/greeting` and this time you should see our lambda message.

5. **Update `index.html`:**
    * Go back to your S3 bucket.
    * Find `index.html` and click on it.
    * S3 doesn't provide direct in-browser editing capabilities for files. You need to download the file, edit it locally, and then re-upload it to replace the original file.
    * Replace `YOUR_API_GATEWAY_INVOKE_URL_HERE` with the "Invoke URL" you just copied from the API Gateway (and added `/greeting` in the end of it), e.g. `https://gxzruv5m3b.execute-api.eu-central-1.amazonaws.com/prod/greeting`, and re-upload.

    * S3 often caches content. You might need to refresh your browser cache (Ctrl+F5 or Cmd+Shift+R) when testing the website after updating `index.html`.

## Test the Web App

1. Open the "Bucket website endpoint" URL you got from S3 in your browser. (Select the bucket -> "Properties" tab -> scroll to the bottom)
2. You should see the `index.html` page.
3. Click the "Get Greeting" button.

If everything is set up correctly, you should see:

![Greeting is working.](/imgs/aws_greeting_is_working.webp)

Beautiful! If you see the error message instead, verify that you enabled CORS for the "/greeting" resource of the API Gateway and that the URL you used in the `index.html` file ends in `/greeting`.

## Final Architecture

This is the final architecture of what we managed to create!

![AWS final architecture of S3 static website hosting, an API Gateway fronting a lambda function containing dynamic code while also sending logs to CloudWatch](/imgs/aws_final_s3_api_gateway_lambda_architecture.webp)

## Clean Up

To avoid incurring charges, it's important to clean up the AWS resources you've created. Delete the API Gateway API, the Lambda Function, the IAM Role and the S3 Bucket.

## (Optional) Explore Further

* AWS Lambda: [Official Docs](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html)
* Amazon S3 Static Website Hosting: [Official Docs](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)
* Amazon API Gateway: [Official Docs](https://docs.aws.amazon.com/apigateway/latest/developerguide/welcome.html)
* Serverless Application Model (SAM): [Official Docs](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html)
* CloudFront for S3: [Official Docs](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Introduction.html)

Only links to official docs this time, to go deeper into the tools we used and to explore some new ones that are relevant.

## Wrapping Up Step 1

Excellent job! You've successfully built a fully functional serverless web backend using Amazon S3 for static content, AWS Lambda for dynamic processing, and Amazon API Gateway to expose your backend logic.

This architecture is highly scalable, cost-effective, and forms the foundation for many modern web applications. In the [next step](/blog/serverless-backend-on-aws-step-2-iac-with-terraform), we'll explore how to provision and manage this exact architecture using Terraform, introducing the power of Infrastructure as Code.
