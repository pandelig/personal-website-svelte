---
slug: "getting-started-with-aws-core-concepts-and-iam"
date: "13 Jun 2025"
date_updated: ""
tags: ["tutorial", "aws", "security", "serverless"]
title: "Getting Started with AWS: Essential IAM Setup for a Secure Cloud Foundation"
meta_description: "Learn how to secure your AWS account from day one with this comprehensive guide to AWS IAM from Pantelis Deligiannidis. Master essential best practices for managing users, groups, roles, and permissions to build a strong cloud security foundation."
---

Welcome to the exciting world of Amazon Web Services (AWS)! If you're new to cloud computing or specifically to AWS, setting up your initial environment securely is paramount. This article will serve as a comprehensive guide to getting started with AWS, focusing on Identity and Access Management (IAM), the bedrock of security within a AWS account.

We'll walk through the essential steps to configure your first AWS environment securely, ensuring you follow best practices from day one. You'll learn how to manage user access, understand AWS's global infrastructure, and grasp fundamental concepts that will set you up for success in your cloud journey. By the end, you'll have a secure foundation from which to explore the endless possibilities AWS offers.

## (Optional) Abbreviations

Navigating AWS often feels like learning a new language, with a plethora of abbreviations thrown your way. Here are some of the most common ones you'll encounter:

**Compute and Serverless**

- EC2 (Elastic Compute Cloud): A virtual server that you can launch, configure, and scale in the cloud to run applications.
- Lambda: A serverless compute service that runs code in response to events without provisioning or managing servers.
- Fargate: A serverless compute engine for containers, eliminating the need to manage underlying servers.

**Storage**

- S3 (Simple Storage Service): Highly scalable, durable, and cost-effective object storage for any type of file.
- Instance Store: Temporary, high-performance storage physically attached to an EC2 instance, ideal for ephemeral data.
- EBS (Elastic Block Store): Persistent block storage volumes that attach to EC2 instances, similar to a virtual hard drive.
- EFS (Elastic File System): Scalable and shared file storage for multiple EC2 instances and on-premises resources, acting like a network file system.

**Container Services**

- ECR (Elastic Container Registry): A fully managed Docker container registry for storing, managing, and deploying Docker images.
- ECS (Elastic Container Service): A highly scalable container orchestration service for running and managing Docker containers on AWS.
- EKS (Elastic Kubernetes Service): A fully managed Kubernetes service that simplifies running Kubernetes on AWS without managing the control plane.

**Networking**

- VPC (Virtual Private Cloud): A logically isolated section of the AWS Cloud where you can launch AWS resources in a defined virtual network.
- ELB (Elastic Load Balancing): Automatically distributes incoming application traffic across multiple targets, such as EC2 instances.

**Databases**

- RDS (Relational Database Service): A managed relational database service supporting various popular database engines like MySQL and PostgreSQL.
- DynamoDB: A fully managed, serverless NoSQL key-value and document database service designed for high-performance applications at any scale.

**Management and Governance**

- IAM (Identity and Access Management): A service that securely controls access to AWS resources by managing users, groups, roles, and permissions.
- CloudWatch: A monitoring and observability service that collects data and provides insights to monitor applications and optimize resource utilization.
- CloudFormation: An Infrastructure as Code (IaC) service that allows you to define and provision AWS infrastructure in code (JSON or YAML).
- CloudTrail: Enables governance, compliance, operational auditing, and risk auditing of the AWS account by logging actions.

**Other Common Services**

- SNS (Simple Notification Service): A fully managed messaging service for application-to-application (A2A) and application-to-person (A2P) communication.
- SQS (Simple Queue Service): A fully managed message queuing service that enables you to decouple and scale microservices, distributed systems, and serverless applications.

## Prerequisites

Before we dive in, make sure you have an [AWS account](https://aws.amazon.com/). If you don't have one, you can sign up for free. Be prepared to provide a credit card, though you won't be charged for free tier usage.

## AWS Free Tier

One of the best ways to learn AWS is by doing, and the [AWS Free Tier](https://aws.amazon.com/free/) makes this accessible. It allows you to explore and try out AWS services free of charge up to certain limits. There are three types of free offers:

1. **Always Free:** These offers do not expire and are available to all AWS customers. Examples include 1 million AWS Lambda requests per month or 25GB of Amazon DynamoDB storage.
2. **12 Months Free:** These offers are available for 12 months starting from the date you create your AWS account. They include services like 750 hours of Amazon EC2 t2.micro or t3.micro instance usage per month and 5GB of Amazon S3 standard storage.
3. **Trials:** Short-term free trials that start from when you activate a particular service. These typically last for a specific duration or up to a certain usage limit.

Always keep an eye on your usage to avoid unexpected charges, especially after the 12-month free period.

## AWS Global Infrastructure

AWS's infrastructure is built for scale, reliability, and performance. It's organized into Regions and Availability Zones (AZs).

- **Regions:** These are large, geographically distinct areas where AWS clusters its data centers. Examples include `us-east-1` (N. Virginia), `eu-west-1` (Ireland), or `ap-southeast-2` (Sydney). Each Region is completely isolated from others to ensure fault tolerance and stability.
- **Availability Zones (AZs):** Within each Region, there are multiple, isolated locations known as Availability Zones. An AZ is one or more discrete data centers with redundant power, networking, and connectivity. They are physically separated within a Region to prevent failures from cascading between them but are close enough for low-latency network connections. Deploying applications across multiple AZs provides high availability and fault tolerance.

### Choosing an AWS Region

Selecting the right AWS Region is a crucial decision for your deployments. Consider these factors, in order of priority:

1. **Compliance and Data Sovereignty:** This is often the most critical factor. Many industries and countries have strict regulations about where data must reside. Choose a Region that meets your legal and regulatory requirements.
2. **Latency:** For applications sensitive to network delay, pick a Region geographically close to your users to minimize latency and improve user experience.
3. **Pricing:** While generally comparable, pricing for AWS services can vary slightly between Regions. If compliance and latency aren't primary concerns, you might consider cost.
4. **Service Availability:** Newer AWS services or features are sometimes rolled out to specific Regions first. If you need a cutting-edge service, you might be limited to certain Regions.

## The API Call Model

It's important to understand a fundamental principle of AWS: **In AWS, every action a user takes is an API call that is authenticated and authorized.** Whether you're clicking buttons in the console, running commands from your terminal, or writing code, underneath it all, you're making API calls.

You can interact with AWS services and perform these API calls through three primary methods:

1. **AWS Management Console:** The [web-based graphical user interface](https://console.aws.amazon.com/) (GUI) that you access through the browser. It provides a visual way to manage resources.
2. **AWS Command Line Interface (CLI):** A unified tool to manage AWS services from the command line. It's powerful for scripting and automating tasks.
3. **AWS Software Development Kits (SDKs):** Libraries available for various programming languages (e.g. Python) that allow you to programmatically interact with AWS services from within an application.

Regardless of the method, IAM is responsible for verifying who you are (authentication) and what you're allowed to do (authorization).

## IAM Best Practices

Now, let's get hands-on with [IAM](https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html) to secure your new AWS account.

### MFA for the Root User

When you first create your AWS account, you log in with the **root user**. This user has unrestricted access to all services and resources in your account. **It is highly recommended to avoid using the root user for daily tasks.**

- Immediately secure your root account by [enabling Multi-Factor Authentication](https://docs.aws.amazon.com/IAM/latest/UserGuide/enable-virt-mfa-for-root.html) (MFA). Use a virtual MFA device like Google Authenticator or Authy on your smartphone.
- *Explore further:* [AWS Root Account Best Practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/root-user-best-practices.html)

### Create a User and a Group

Instead of using the root account, you should create a dedicated IAM user for administrative tasks.

1. **Navigate to IAM:** In the AWS Management Console, search for "IAM" and click on the service.

    ![Search for IAM in the AWS Management Console.](/imgs/aws_console_search_iam.webp)

2. **Create a Group:**
    - Go to `User groups` in the left navigation pane.
    - Click `Create group`.
    - Give it a name, e.g. `Administrators`.
    - Under `Attach policies`, search for `AdministratorAccess` and select it. This policy grants full access to AWS services.
    - Click `Create group`.

    ![Search for IAM in the AWS Management Console.](/imgs/aws_console_create_user_group.webp)

3. **Create a User:**
    - Go to `Users` in the left navigation pane.
    - Click `Create user`.
    - Give it a name, e.g. `yourname-admin`.
    - Select `Provide user access to the AWS Management Console`.
    - Choose `I want to create an IAM user` and select `Custom password`. Enter a strong password and optionally enforce a password reset on first login.
    - Click `Next`.
    - On the `Set permissions` page, select `Add user to group`.
    - Choose the `Administrators` group you just created.
    - Click `Next`, review, and `Create user`.

    For convenience, bookmark the "Console sign-in link" and use it to sign-in from now on, this way you don't have to type in your 12-digit AWS account ID every time.

4. **Log Out and Log In with the New IAM User:** This is crucial. Log out from the root account and log back in using the credentials of the newly created IAM admin user. From now on, use this user for your daily administrative tasks.

    When asked to reset your password on the first login, you may get the error:

    ```text
    You may not be authorized to perform this action, or the new password does not comply with the account password policy set by your administrator.
    ```

    If so, login as root user again, navigate to IAM, click on `Account settings` and take a look at the "Password policy", make sure your new password for the IAM user adheres to the rules listed:

    ![AWS default password policy.](/imgs/aws_default_password_policy.webp)

### MFA for IAM Users

Just like with your root account, enable MFA for all your IAM users, especially those with elevated privileges.

- *Explore further:* [Enabling MFA for IAM Users](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_mfa.html)

### Principle of Least Privilege

This is a core security concept: **grant only the minimum necessary permissions to users and roles to perform their tasks.** Don't give full `AdministratorAccess` to everyone.

- When you create users for specific purposes (e.g. a developer, a read-only user), create custom policies or use AWS managed policies that grant *only* the permissions needed for their job.
- Example: A developer working with EC2 instances might need `ec2:RunInstances` and `ec2:TerminateInstances`, but probably not `s3:DeleteBucket`.

### Review IAM Policies

Security is not a one-time setup, it's an ongoing process.

- Periodically review your IAM users, groups, roles, and policies to ensure they still adhere to the principle of least privilege.
- Use **AWS CloudTrail** to log all API calls made to your AWS account, which helps in auditing and security analysis.
- *Explore further:* [AWS CloudTrail](https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-user-guide.html)

### Use IAM Roles for AWS Services

Instead of embedding access keys directly into applications or EC2 instances, use **IAM Roles**. Roles provide temporary credentials that applications can assume to interact with AWS services, without hardcoding sensitive information.

- For example, when launching an EC2 instance that needs to access S3, assign an IAM Role to the instance that has permissions to interact with S3, rather than configuring access keys on the instance itself.
- *Explore further:* [IAM Roles](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html)

## (Optional) Explore Further

- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/): Learn about the pillars of a well-architected cloud environment, including security.
- [AWS Best Practices for Security, Identity, Compliance](https://aws.amazon.com/architecture/security-identity-compliance/): A comprehensive guide directly from AWS.

## Final Words

Setting up a secure AWS environment from the outset is crucial for protecting your data and resources. By understanding and implementing IAM best practices, you're building a strong, secure foundation for all your future cloud endeavors.

AWS is a constantly evolving platform, and continuous learning and adaptation are key. This article provides the essential first steps, but there's always more to explore. Ready to dive deeper into AWS? Stay tuned for my next article!
