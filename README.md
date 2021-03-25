# pregnancy-centre

### Secret Manager
Run the following commands from the repo root:

To populate local environment files with secrets from secret manager:
`vault kv get -format=json kv/pregnancy-centre | python update_secret_files.py`

To update the secrets inside secret manager using local environment files:
`vault kv put kv/pregnancy-centre CLIENT_ENV_VARS=@client/.env SERVER_ENV_VARS=@server/.env`

Helpful secret manager setup guide:
https://www.notion.so/uwblueprintexecs/Secret-Management-2d5b59ef0987415e93ec951ce05bf03e#3008f54889ab4b0cacfa276cbc43e613

~ For Windows users ~
- Having python 3 is a prerequisite, but you might have to use `python` instead of `python3` (this will depend on the user/OS)
- For Windows 10 users, make sure to run cmd/powershell as admin
- Running with Git Bash also works

### Deployment


#### Client
Tutorial: https://firebase.google.com/docs/hosting/quickstart?authuser=1

Go to `/client`. Then run
```
npm run build
firebase deploy --only hosting
```

Before building, ensure your `.env` has the correct values for production.

### Server
Tutorials:
+ https://firebase.google.com/docs/hosting/cloud-run?authuser=1#node.js 
  + Deploy server using Google Cloud Run
  + Route requests to server from Firebase IP
+ https://cloud.google.com/run/docs/configuring/static-outbound-ip
  + Setting up static outbound IP

Go to `/server`.

Build Docker image and push to Google container registry. The name of the image is `gcr.io/bp-pregnancy-centre/tpc-server`. 
Before building, ensure your `.env` has the correct values for production and remove `.env` from `server/.gitignore`.
```
gcloud builds submit --tag gcr.io/bp-pregnancy-centre/tpc-server
```

Deploy built container using Google Cloud Run (if the service `tpc-server` already exists, a revision will be deployed). More info [here](https://cloud.google.com/run/docs/deploying#revision).
```
gcloud beta run deploy tpc-server \
   --image=gcr.io/bp-pregnancy-centre/tpc-server \
   --vpc-connector=tcp-server-connector \
   --vpc-egress=all \
   --platform=managed \
   --region=us-east1 
```

#### Set up static outbound IP

Run
```
gcloud compute networks subnets create tpc-subnet --range=10.124.0.0/28 --network=default --region=us-east1

gcloud beta compute networks vpc-access connectors create tcp-server-connector \
  --region=us-east1 \
  --subnet-project=bp-pregnancy-centre \
  --subnet=tpc-subnet


gcloud compute routers create tpc-server-router \
  --network=default \
  --region=us-east1

gcloud compute addresses create tpc-server-outbound-ip --region=us-east1

gcloud compute routers nats create tpc-server-nat \
  --router=tpc-server-router \
  --region=us-east1 \
  --nat-custom-subnet-ip-ranges=tpc-subnet \
  --nat-external-ip-pool=tpc-server-outbound-ip

gcloud beta run deploy tpc-server \
   --image=gcr.io/bp-pregnancy-centre/tpc-server \
   --vpc-connector=tcp-server-connector \
   --vpc-egress=all \
   --platform=managed \
   --region=us-east1 
```

Go to VPC Network in GCP console to find outbound static IP. Add the static IP to the MongoDB Atlas network allowlist.
