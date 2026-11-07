# Deploy an example agent to Cloud Run

The same steps work for all six agents. Each agent's README lists what is different for it.

> **This needs a Google Cloud project with billing enabled.** Cloud Run, Cloud Build and Artifact Registry can
> charge you. Use a sandbox project, and delete what you create (step 10).

Before you deploy, run the agent's unit tests (`uv run pytest tests/unit`) and its eval. Deploy what passes.

## Using a coding agent? Approve every cloud command yourself

The Agents CLI skills teach a coding agent `agents-cli deploy` and `agents-cli infra`, and it can run `gcloud`. The same
goes for any Google Cloud MCP server you connect. Those commands create services, build images and grant permissions.

- Don't auto-approve `deploy`, `infra`, `gcloud` or `terraform`. Read each command before it runs.
- Say in your prompt what it must not do, for example "Don't deploy anything."
- Deploy only to a sandbox project you can delete.

The deploy skill says the same: never run `agents-cli deploy` without explicit human approval.

## 1. Sign in and pick a sandbox project

Install the [Google Cloud CLI](https://docs.cloud.google.com/sdk/docs/install-sdk) first. On Windows, install it inside
Ubuntu on WSL, where Agents CLI runs.

```bash
agents-cli login -i                      # pick Google Cloud (ADC)
gcloud config set project YOUR_PROJECT_ID
```

## 2. Set a budget alert

In the console, open **Billing**, then **Budgets & alerts**, and create a small budget with email alerts. See
[Create a budget alert](https://docs.cloud.google.com/billing/docs/how-to/budgets). An alerts-only budget emails you. It
does not stop spending.

## 3. Turn on the APIs

```bash
gcloud services enable run.googleapis.com aiplatform.googleapis.com \
  cloudbuild.googleapis.com artifactregistry.googleapis.com
```

Cloud Run hosts the agent, `aiplatform` serves Gemini to it, and Cloud Build and Artifact Registry build and store the
container. `deploy` checks these first.

## 4. Add Cloud Run to the project

From the agent's folder:

```bash
agents-cli scaffold enhance -d cloud_run --yes
agents-cli install
```

This adds the deployment files and keeps your code in `app/`.

## 5. Ship the agent's data

The `Dockerfile` copies only `app/`. If the agent reads files from its folder, add a line right after
`COPY ./app ./app`. Each README says which line, if any.

## 6. Take the key out of `.env`

`agents-cli deploy` copies every line of `.env` into the deployed service. Before you deploy, delete the
`GEMINI_API_KEY` line and any `REPO_DIR` line, and turn the Google Cloud lines on:

```bash
GOOGLE_GENAI_USE_ENTERPRISE=true
GOOGLE_CLOUD_PROJECT=YOUR_PROJECT_ID
GOOGLE_CLOUD_LOCATION=global
```

The deployed agent calls Gemini through your project, not your API key. To get Cloud Trace, also set
`otel_to_cloud = True` in `app/fast_api_app.py`.

If a deployed agent needs a secret, store it in [Secret Manager](https://docs.cloud.google.com/secret-manager/docs/overview)
and pass `--secrets ENV_NAME=SECRET_NAME` to `agents-cli deploy`. Don't put it in `.env`.

## 7. Preview with a dry run

```bash
agents-cli deploy --project YOUR_PROJECT_ID --region us-east1 --max-instances 1 --dry-run
```

It runs read-only checks on the project and prints the `gcloud run deploy` command it would run. Nothing is created.
The command includes `--no-allow-unauthenticated`: the service is private.

## 8. Deploy

```bash
agents-cli deploy --project YOUR_PROJECT_ID --region us-east1 --max-instances 1
```

`--max-instances 1` caps how many copies can run at once (the default is 10). `deploy` prints the service URL.

## 9. Call it and evaluate it

`agents-cli run` adds your identity token for you:

```bash
agents-cli run "YOUR QUESTION" --url SERVICE_URL --mode a2a
```

Evaluate the deployed agent with the same dataset you used locally:

```bash
agents-cli eval run --dataset tests/eval/datasets/YOUR_DATASET.json --url SERVICE_URL --app-name app
```

`agents-cli deploy --list` shows what you have deployed. The agent's logs are in the Cloud Run console, on the service's
**Logs** tab.

If the agent gets `403` or `PERMISSION_DENIED` when it calls Gemini, give its service account the
`roles/aiplatform.user` role:

```bash
gcloud run services describe SERVICE_NAME --region us-east1 \
  --format "value(spec.template.spec.serviceAccountName)"
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member serviceAccount:SA_EMAIL --role roles/aiplatform.user
```

## 10. Delete it

The service name is the folder name, for example `code-reviewer`.

```bash
gcloud run services delete SERVICE_NAME --region us-east1 --project YOUR_PROJECT_ID
gcloud artifacts repositories delete cloud-run-source-deploy --location us-east1 --project YOUR_PROJECT_ID
```

The second command removes the container images from the source build. If you made a project only for this, delete the
whole project instead: `gcloud projects delete YOUR_PROJECT_ID`.

After you are done, put your `GEMINI_API_KEY` back in `.env` to keep running the agent locally.
