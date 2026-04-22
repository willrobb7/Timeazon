# marketplace-project

## Project Overview

TimeAzon is an e-commerce marketplace where users from different time periods can buy and sell products.

---

## Tech Stack

- React (Vite)
- AWS CDK
- Lambda
- API Gateway
- Aurora PostgreSQL
- CloudFront + S3

---

## Project Links

- Miro board: https://miro.com/app/board/uXjVGJVfWeo=/
- Jira board: https://corecomtechacademy.atlassian.net/jira/software/c/projects/MP/boards/613

---

## Colour Palette

- #000000
- #112134
- #0869C2
- #25f0ff
- #f1feff

---

## Setup

1. Set your stack name (required)

Add this to your `~/.zshrc` or `~/.bashrc`:

```bash
export GROUP_PROJECT_STACK_NAME=timeazon
```

Then reload your profile:

```bash
source ~/.zshrc
# or
source ~/.bashrc
```

2. Log in to AWS

Make sure you are authenticated with the correct profile.

---

## Reset project

From the root of the project run:

```bash
./reset.sh
```

This will:
- remove `node_modules`
- reinstall dependencies
- rebuild the client app

---

## Clean up AWS (important)

Before deploying, go to CloudWatch → Log groups in eu-west-2.

Delete any log groups that contain:

timeazon

Lambda log groups are not deleted with the stack and can cause redeploy issues if names clash.

Only delete log groups related to this project.

---

## Deploy

Navigate to the CDK directory:

```bash
cd cdk
```

Preview the infrastructure:

```bash
npx cdk synth
```

Deploy the stack:

```bash
npx cdk deploy
```

---

## Seed the database

After deployment:

1. Go to AWS Lambda
2. Find the function: timeazon-bootstrap
3. Run a test invocation

This will populate the database with initial data.

---

## Access the app

https://timeazon.cta-training.academy

---

## Common Issues

### CDK deploy fails with ROLLBACK_COMPLETE
- Go to CloudFormation
- Delete the failed stack
- Re-run deploy

---

### Aurora version error
If you see:
Cannot find version X for aurora-postgresql

Use:
```js
rds.AuroraPostgresEngineVersion.VER_15_14
```

---

### Docker / bundling errors
- Make sure Docker Desktop is running
- Restart Docker if needed

---

### AWS not authenticated
Run:
```bash
aws sts get-caller-identity
```

If it fails, log in again.

---

### Changes not showing
Rebuild and redeploy:
```bash
npm run build
```

---

## How this system works

1. React app is built locally
2. CDK deploys infrastructure
3. Lambda handles backend logic
4. Bootstrap Lambda seeds the database
5. CloudFront serves the frontend



---

# marketplace-project

## Project Overview

TimeAzon is an e-commerce marketplace where users from different time periods can buy and sell products.

This project now follows a more realistic platform engineering approach, including environment separation, security hardening, and controlled access.

---

## Tech Stack

- React (Vite)
- AWS CDK
- Lambda
- API Gateway
- Aurora PostgreSQL
- CloudFront + S3
- AWS WAF (dev protection)

---

## Environments

This project now supports:

- dev (restricted access via IP)
- prod (public)

Environments are deployed independently, not overwritten.

---

## Setup

### 1. Set your stack name

export GROUP_PROJECT_STACK_NAME=timeazon

### 2. Choose environment

export APP_ENV=dev   # or prod

---

## Deploy

cd cdk
npx cdk synth
npx cdk deploy

---

## Environment Behaviour

Dev:
https://timeazon-dev.cta-training.academy

Prod:
https://timeazon.cta-training.academy

---

## Architecture Overview

Frontend:
- Built with Vite
- Hosted in S3
- Served via CloudFront

Backend:
- API Gateway + Lambda
- Aurora PostgreSQL
- DynamoDB

Security:
- S3 not public
- CloudFront access only
- WAF protects dev (IP allow list)

---

## Seed database

Run bootstrap lambda after deploy

---

## Common Issues

403 on dev:
- IP not whitelisted

Unexpected token <:
- rebuild frontend

Images not loading:
- check env vars

---

## Key Learning Points

- Environment separation
- Infrastructure as Code
- Edge security
- Private S3 access
- Env aware frontend/backend
