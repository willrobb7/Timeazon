#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { CdkStack } from '../lib/cdk-stack.js';

const stackName = process.env.GROUP_PROJECT_STACK_NAME
const environmentName = process.env.APP_ENV || 'dev'


if (!stackName || !stackName.trim()) {
  console.error('Environment variable GROUP_PROJECT_STACK_NAME is not set')
  process.exit(1)
}

if (!['dev', 'prod'].includes(environmentName)) {
  console.error("APP_ENV must be either 'dev' or 'prod'")
  process.exit(1)
}

const settings = {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT || 'NOT_SET',
    region: process.env.CDK_DEFAULT_REGION || 'NOT_SET'
  },
  certArn: cdk.Fn.importValue('CTASharedCertArn'), // SSL cert for HTTPS
  permissionsBoundaryPolicyName: 'scopePermissions',
  domainName: 'cta-training.academy', // Root domain
  subDomain: stackName.toLowerCase(),
  dbName: 'dev',
  vpcName: 'CTASharedVPC-vpc',
  devWebAclArn: 'arn:aws:wafv2:us-east-1:827602716979:global/webacl/timeazon-dev-whitelist/c44d34cd-55f7-4b63-bb8c-76833ae5a5cd'
}

const app = new cdk.App();

if(environmentName === 'dev') {
  console.log("-----DEPLOYING TO DEV-----");
  new CdkStack(app, 'CdkStackDev', {
    env: settings.env,
    permissionsBoundaryPolicyName: settings.permissionsBoundaryPolicyName,
    subDomain: settings.subDomain,
    stackName: `${stackName}-dev`,
    certArn: settings.certArn,
    domainName: settings.domainName,
    dbName: settings.dbName,
    vpcName: settings.vpcName,
    environmentName: 'dev',
    devWebAclArn: settings.devWebAclArn
  });
}

if (environmentName === 'prod') {
  console.log("-----DEPLOYING TO PROD-----");
  
  new CdkStack(app, 'CdkStackProd', {
    env: settings.env,
    permissionsBoundaryPolicyName: settings.permissionsBoundaryPolicyName,
    subDomain: settings.subDomain,
    stackName: `${stackName}-prod`,
    certArn: settings.certArn,
    domainName: settings.domainName,
    dbName: settings.dbName,
    vpcName: settings.vpcName,
    environmentName: 'prod',
    devWebAclArn: undefined
  })
}
