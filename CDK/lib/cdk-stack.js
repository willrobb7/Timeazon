import path from 'path'
import { fileURLToPath } from 'url'
import { writeFileSync } from 'fs'
import { join } from 'path'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import * as rds from 'aws-cdk-lib/aws-rds'
import * as cdk from 'aws-cdk-lib'
import { Stack } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as iam from 'aws-cdk-lib/aws-iam'
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as s3Deployment from 'aws-cdk-lib/aws-s3-deployment'
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront'
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins'
import * as acm from 'aws-cdk-lib/aws-certificatemanager'
import * as route53 from 'aws-cdk-lib/aws-route53'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs'
import * as apigw from 'aws-cdk-lib/aws-apigateway'


const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)


export class CdkStack extends Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    // ----------------------------------
    // Domains
    // ----------------------------------
    const fullDomain = `${props.subDomain}.${props.domainName}`
    const staticImagesInS3Domain = `static-images-${props.subDomain}.${props.domainName}`

    // ----------------------------------
    // Tags
    // ----------------------------------
    cdk.Tags.of(this).add('Owner', props.stackName)
    cdk.Tags.of(this).add('Project', 'timeazon')
    
    // ----------------------------------
    // Permissions boundary
    // ----------------------------------
    const boundary = iam.ManagedPolicy.fromManagedPolicyName(this, 'Boundary', props.permissionsBoundaryPolicyName)
    
    iam.PermissionsBoundary.of(this).apply(boundary)
    

    // ----------------------------------
    // Networking
    // ----------------------------------

    // Look up the shared VPC to place our database in
    // Other services can then join the same network
    const sharedVpc = ec2.Vpc.fromLookup(this, 'sharedVpc', {
      vpcName: props.vpcName,
      region: props.env.region
    })
    
    // // ----------------------------------
    // // Databases - ONLY UNCOMMENT THIS WHEN YOU ARE READY TO ADD A DATABASE / YOUR APPICATION IS SET UP TO UTILISE A DATABASE AS IT'S CRAZY EXPENSIVE 
    // // ----------------------------------
    // // Db configuration – Postgres engine and parameter group

    // // Choose the Aurora Postgres engine version
    // const postgresVersion = rds.AuroraPostgresEngineVersion.VER_13_20;

    // const postgresEngine = rds.DatabaseClusterEngine.auroraPostgres({
    //   version: postgresVersion,
    // });

    // // Create a parameter group that forces SSL
    // const postgresParameterGroup = new rds.ParameterGroup(
    //   this,
    //   'postgres-parameter-group',
    //   {
    //     name: `${props.subDomain}-ParameterGroup`,
    //     engine: postgresEngine,
    //     description: `${props.subDomain} parameter group with SSL enforced`,
    //     removalPolicy: cdk.RemovalPolicy.DESTROY,
    //     parameters: {
    //       'rds.force_ssl': '1' // require SSL for database connections
    //     }
    //   }
    // )

    // const cluster = new rds.DatabaseCluster(this, 'rds-cluster', {
    //   // Use the Postgres engine we defined above
    //   engine: postgresEngine,
    //   // Attach our parameter group so SSL is enforced
    //   parameterGroup: postgresParameterGroup,
    //   // Name of the default database in this cluster
    //   defaultDatabaseName: props.dbName,
    //   // Put the cluster into the shared CTA VPC
    //   vpc: sharedVpc,
    //   vpcSubnets: {
    //     subnetType: ec2.SubnetType.PRIVATE_ISOLATED
    //   },
    
    //   // Aurora Serverless v2 configuration
    //   writer: rds.ClusterInstance.serverlessV2('writer'),
    //   serverlessV2MinCapacity: 0.5,
    //   serverlessV2MaxCapacity: 1,
    
    //   // Needed for the Data API from our Lambdas
    //   enableDataApi: true,
    
    //   // Tear the database down with the stack (fine for a lab, not for prod)
    //   removalPolicy: cdk.RemovalPolicy.DESTROY
    // })

    // ----------------------------------
    // S3 buckets
    // ----------------------------------
    const staticImagesBucket = new s3.Bucket(this, 'static-images', {
      bucketName: `${props.subDomain}-static-images`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      publicReadAccess: true,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: new s3.BlockPublicAccess({
        blockPublicAcls: true,
        ignorePublicAcls: true,
        blockPublicPolicy: false,
        restrictPublicBuckets: false
      })
    })

    const clientBucket = new s3.Bucket(this, 'client-bucket', {
      bucketName: `${props.subDomain}-client-bucket`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      publicReadAccess: false,
      encryption: s3.BucketEncryption.S3_MANAGED,
      websiteIndexDocument: 'index.html',
      blockPublicAccess: new s3.BlockPublicAccess({
        blockPublicAcls: true,
        ignorePublicAcls: true,
        blockPublicPolicy: false,
        restrictPublicBuckets: false
      })
    })

    clientBucket.addToResourcePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.DENY,
        actions: ['s3:*'],
        resources: [
          clientBucket.bucketArn,
          clientBucket.arnForObjects('*')
        ],
        conditions: {
          Bool: { 'aws:SecureTransport': 'false' }
        },
        principals: [new iam.AnyPrincipal()]
      })
    )

    clientBucket.addToResourcePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['s3:GetObject'],
        resources: [clientBucket.arnForObjects('*')],
        principals: [new iam.AnyPrincipal()]
      })
    )
    
    // ----------------------------------
    // Certificate
    // ----------------------------------
    const cert = acm.Certificate.fromCertificateArn(this,
      'BakehouseCert', //Don't change this i only made one cert 
      props.certArn
    )

    // ----------------------------------
    // CloudFront function
    // ----------------------------------

    // You will have to impliment redirecting in cloudfront 
    const redirectsFunction = new cloudfront.Function(this, 'redirects-function', {
      functionName: `${props.subDomain}-redirects`,
      code: cloudfront.FunctionCode.fromFile({
        filePath: 'functions/redirects.js'
      })
    })

    const clientQueryPolicy = new cloudfront.OriginRequestPolicy(this,'client-query-policy',{
      originRequestPolicyName: `${props.subDomain}-client-query-policy`,
      queryStringBehavior:
        cloudfront.OriginRequestQueryStringBehavior.all()
    })

    // ----------------------------------
    // Lambda bundling
    // ----------------------------------
    const bundling = {
      externalModules: ['aws-sdk'],
      nodeModules: ['data-api-client'],
      forceDockerBundling: true
    }

    const lambdaEnvVars = {
      NODE_ENV: 'production',
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      DB_NAME: props.dbName,
      // When we add in a DB you can uncomment these 
      // CLUSTER_ARN: cluster.clusterArn,
      // SECRET_ARN: cluster.secret?.secretArn || 'NOT_SET',
      STATIC_IMAGES_BUCKET: staticImagesBucket.bucketName,
      STATIC_IMAGES_BASE_URL: `https://${staticImagesInS3Domain}`
    }

    // ----------------------------------
    // Lambdas
    // ----------------------------------
    const healthcheckLambda = new nodejs.NodejsFunction(this, 'health-check-lambda', {
      functionName: `${props.subDomain}-health-check-lambda`,
      runtime: lambda.Runtime.NODEJS_22_X,
      entry: 'functions/health-check.js',
      handler: 'healthcheckHandler',
      bundling

    })
    // Write your other lambdas into here

    // Colin has added some basic lambda's in here. Need to change the params to make them fit the 
    // requirements... (these are taken from the Bakehouse) 

    const productCatalogLambda = new nodejs.NodejsFunction(this, 'product-catalog-lambda', {
          functionName: `${props.subDomain}-product-catalog-lambda`,
          runtime: lambda.Runtime.NODEJS_22_X,
          entry: 'functions/utility-functions.js',
          handler: 'productCatalogHandler',
          bundling,
          environment: {
            ...lambdaEnvVars,
            FEATURED_PRODUCT: ""
        }
      })

    // const productsListLambda = new nodejs.NodejsFunction(this, 'products-list-lambda', {
    //       functionName: `${props.subDomain}-products-list-lambda`,
    //       runtime: lambda.Runtime.NODEJS_22_X,
    //       entry: 'functions/utility-functions.js',
    //       handler: 'productsListHandler',
    //       bundling,
    //       environment: {
    //         ...lambdaEnvVars,
    //         FEATURED_PRODUCT: 

    
    // const customerListLambda = new nodejs.NodejsFunction(this, 'products-list-lambda', {
    //       functionName: `${props.subDomain}-products-list-lambda`,
    //       runtime: lambda.Runtime.NODEJS_22_X,
    //       entry: 'functions/utility-functions.js',
    //       handler: 'productsListHandler',
    //       bundling,
    //       environment: {
    //         ...lambdaEnvVars,
    //         FEATURED_PRODUCT: 

    
    // const productsListLambda = new nodejs.NodejsFunction(this, 'products-list-lambda', {
    //       functionName: `${props.subDomain}-products-list-lambda`,
    //       runtime: lambda.Runtime.NODEJS_22_X,
    //       entry: 'functions/utility-functions.js',
    //       handler: 'productsListHandler',
    //       bundling,
    //       environment: {
    //         ...lambdaEnvVars,
    //         FEATURED_PRODUCT: 

        // Grant Lambdas that need it access to the Aurora Data API

// ADD TO CART LAMBDA 
    // FAVOURITES
    const postToCartLambda = new nodejs.NodejsFunction(this, "post-tocart-lambda", {
      functionName: `${props.subDomain}-post-tocart-lambda`,
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: "addToCart.js/postToCartHandler",
      code: lambda.Code.fromAsset('functions'),
      environment: lambdaEnvVars
    });

    const getToCartLambda = new nodejs.NodejsFunction(this, "get-tocart-lambda", {
      functionName: `${props.subDomain}-get-tocart-lambda`,
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: "addToCart.js/getToCartHandler",
      code: lambda.Code.fromAsset('functions'),
      environment: lambdaEnvVars
    });

    const deleteFromCartLambda = new nodejs.NodejsFunction(this, "delete-fromcart-lambda", {
      functionName: `${props.subDomain}-delete-fromcart-lambda`,
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: "addToCart.js/deleteFromCartHandler",
      code: lambda.Code.fromAsset('functions'),
      environment: lambdaEnvVars
    });

    // ----------------------------------
    // API Gateway
    // ----------------------------------
    const api = new apigw.RestApi(this, 'apigw', {
      restApiName: `${props.subDomain}-api`,
      description: `${props.subDomain} api gateway`,
      deploy: true,
      deployOptions: {
        stageName: 'api'
      },
      defaultCorsPreflightOptions: {
        allowHeaders: [
          'Content-Type',
          'Access-Control-Allow-Origin',
          'Access-Control-Request-Method',
          'Access-Control-Request-Headers'
        ],
        allowMethods: ['*'],
        allowOrigins: ['*'],
        allowCredentials: true
      }
    })

    api.addUsagePlan('apigw-rate-limits', {
      name: `${props.subDomain}-apigw-rate-limits`,
      throttle: {
        rateLimit: 10,
        burstLimit: 5
      }
    })

    // Expose endpoint `/api/healthcheck`
    const healthchckApi = api.root.addResource('healthcheck')
    // Allow `/api/healthcheck` to receive GET requests, and tell it which lambder to trigger whn it does
    healthchckApi.addMethod('GET', new apigw.LambdaIntegration(healthcheckLambda))
    
    //ADD ENDPOINT HERE
    const productCatalogApi = api.root.addResource('product')
    productCatalogApi.addMethod('GET', new apigw.LambdaIntegration(productCatalogLambda))

    const addToCartApi = api.root.addResource("addtocart");
    addToCartApi.addMethod("GET", new apigw.LambdaIntegration(getToCartLambda));
    addToCartApi.addMethod("POST", new apigw.LambdaIntegration(postToCartLambda));
    addToCartApi.addMethod("DELETE", new apigw.LambdaIntegration(deleteFromCartLambda));
    // ----------------------------------
    // CloudFront distributions
    // ----------------------------------

    const clientDistribution = new cloudfront.Distribution(this, 'client-distribution', {
      defaultBehavior: {
        origin: new origins.S3BucketOrigin(clientBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        originRequestPolicy: clientQueryPolicy,
        functionAssociations: [
          {
            eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
            function: redirectsFunction
          }
        ]
      },
      additionalBehaviors: {
        '/api/*': {
          origin: new origins.HttpOrigin(
            `${api.restApiId}.execute-api.${props.env.region}.amazonaws.com`
          ),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
          cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED
        }
      },
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: cdk.Duration.seconds(0)
        },
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: cdk.Duration.seconds(0)
        }
      ],
      defaultRootObject: 'index.html',
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
      domainNames: [fullDomain],
      certificate: cert
    })

    new s3Deployment.BucketDeployment(this, 'client-deployment', {
      destinationBucket: clientBucket,
      sources: [
        s3Deployment.Source.asset(
          path.resolve(__dirname, '../../Marketplace/dist') // THIS PATH NEEDS TO BE CORRECT TO YOUR CLIENT(REACT) DIST FOLDER - this is created when you build your react app
        )
      ],
      prune: true,
      memoryLimit: 256,
      distribution: clientDistribution,
      distributionPaths: ['/*']
    })

    const staticImagesDistribution = new cloudfront.Distribution(this,'static-images-distribution',{
      defaultBehavior: {
        origin: new origins.S3BucketOrigin(staticImagesBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        functionAssociations: [
          {
            eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
            function: redirectsFunction
          }
        ]
      },
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
      domainNames: [staticImagesInS3Domain],
      certificate: cert
    })

    new s3Deployment.BucketDeployment(this, 'static-images-deployment', {
      destinationBucket: staticImagesBucket,
      sources: [
        s3Deployment.Source.asset(
          path.resolve(__dirname, '../../Marketplace/static-images') // THIS PATH NEEDS TO BE CORRECT TO YOUR FOLDER that has static images inside
        )
      ],
      prune: true,
      memoryLimit: 256,
      distribution: staticImagesDistribution,
      distributionPaths: ['/*']
    })


    // ----------------------------------
    // Route 53
    // ----------------------------------
    const zone = route53.HostedZone.fromLookup(this, 'zone', { domainName: props.domainName })

    new route53.CnameRecord(this, 'static-images-record', {
      zone,
      recordName: staticImagesInS3Domain,
      domainName: staticImagesDistribution.distributionDomainName
    })

    new route53.CnameRecord(this, 'client-record', {
      zone,
      recordName: fullDomain,
      domainName: clientDistribution.distributionDomainName
    })

    // ----------------------------------
    // Write to a client env file - You might need to know the domain to access static images from your react files!
    // ----------------------------------
    writeFileSync(
      join(__dirname, '../../Marketplace/.env.production'), // THIS PATH WILL NEED TO CHANGE TO BE IN YOUR CLIENT DIRECTORY
      `VITE_STATIC_IMAGES_DOMAIN=https://${staticImagesInS3Domain}\n`
    )

    // --------------------------------------------------
    // OUTPUTS INTO THE CONSOLE 
    // --------------------------------------------------

    // --------------------------------------------------
    // 01 – Site URLs (What users open in the browser)
    // --------------------------------------------------

    new cdk.CfnOutput(this, "01_Site_ClientUrl", {
      value: `https://${fullDomain}`
    })

    new cdk.CfnOutput(this, "01_Site_StaticImagesUrl", {
      value: `https://${staticImagesInS3Domain}`
    })


    // --------------------------------------------------
    // 02 – API Endpoints (What devs test)
    // --------------------------------------------------

    new cdk.CfnOutput(this, "02_Api_Healthcheck_ViaCloudFront", {
      value: `https://${fullDomain}/api/healthcheck`
    })

    new cdk.CfnOutput(this, "02_Api_Healthcheck_DirectApiGateway", {
      value: `https://${api.restApiId}.execute-api.${props.env.region}.amazonaws.com/api/healthcheck`
    })

    // new cdk.CfnOutput(this, "Product_Catalog_Endpoint", {
    //   value: `https://${api.restApiId}.execute-api.${props.env.region}.amazonaws.com/api/product-catalog`
    // })

    // --------------------------------------------------
    // 03 – CloudFront (Debugging + invalidations)
    // --------------------------------------------------

    new cdk.CfnOutput(this, "03_CloudFront_ClientDistributionId", {
      value: clientDistribution.distributionId
    })

    new cdk.CfnOutput(this, "03_CloudFront_ClientDistributionDomain", {
      value: clientDistribution.distributionDomainName
    })

    new cdk.CfnOutput(this, "03_CloudFront_StaticImagesDistributionId", {
      value: staticImagesDistribution.distributionId
    })

    new cdk.CfnOutput(this, "03_CloudFront_StaticImagesDistributionDomain", {
      value: staticImagesDistribution.distributionDomainName
    })


    // --------------------------------------------------
    // 04 – Storage (S3 Buckets)
    // --------------------------------------------------

    new cdk.CfnOutput(this, "04_S3_ClientBucketName", {
      value: clientBucket.bucketName
    })

    new cdk.CfnOutput(this, "04_S3_StaticImagesBucketName", {
      value: staticImagesBucket.bucketName
    })


    // --------------------------------------------------
    // 05 – Compute (Lambdas)
    // --------------------------------------------------

    new cdk.CfnOutput(this, "05_Lambda_HealthcheckFunctionName", {
      value: healthcheckLambda.functionName
    })


    // --------------------------------------------------
    // 06 – Database (Aurora Serverless v2)
    // COMMENT THIS SECTION OUT UNTIL AURORA IS ENABLED
    // --------------------------------------------------

    /*
    new cdk.CfnOutput(this, "06_Database_ClusterArn", {
      value: cluster.clusterArn
    })

    new cdk.CfnOutput(this, "06_Database_ClusterEndpoint", {
      value: cluster.clusterEndpoint.hostname
    })

    new cdk.CfnOutput(this, "06_Database_Name", {
      value: props.dbName
    })

    new cdk.CfnOutput(this, "06_Database_SecretArn", {
      value: cluster.secret?.secretArn || "NOT_SET"
    })
    */

  }
}

