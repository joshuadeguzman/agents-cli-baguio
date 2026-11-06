# Deploy an example agent to Cloud Run

The same steps work for all four agents. Each agent's README lists what is different for it.

> **This needs a Google Cloud project with billing enabled.** Cloud Run, Cloud Build and Artifact Registry can
> charge you. Use a sandbox project, and delete what you create (step 6).

## 1. Sign in and pick the project

Install the [Google Cloud CLI](https://docs.cloud.google.com/sdk/docs/install-sdk) first. On Windows, install it inside
Ubuntu on WSL, where Agents CLI runs.

```bash
agents-cli login -i                      # pick Google Cloud (ADC)
gcloud config set project YOUR_PROJECT_ID
```

## 2. Add Cloud Run to the project

From the agent's folder:

```bash
agents-cli scaffold enhance -d cloud_run --yes
agents-cli install
```

This adds the deployment files and keeps your `app/agent.py`.

## 3. Ship the agent's data

The `Dockerfile` copies only `app/`. If the agent reads files from its folder, add a line right after
`COPY ./app ./app`. Each README says which line, if any.

## 4. Take the key out of `.env`

`agents-cli deploy` copies every line of `.env` into the deployed service. Before you deploy, delete the
`GEMINI_API_KEY` line and any `REPO_DIR` line, and turn the Google Cloud lines on:

```bash
GOOGLE_GENAI_USE_ENTERPRISE=true
GOOGLE_CLOUD_PROJECT=YOUR_PROJECT_ID
GOOGLE_CLOUD_LOCATION=global
```

The deployed agent calls Gemini through your project, not your API key. To get Cloud Trace, also set
`otel_to_cloud = True` in `app/fast_api_app.py`.

## 5. Deploy and call it

```bash
agents-cli deploy --project YOUR_PROJECT_ID --region us-east1
```

`deploy` prints the service URL. The service is private, and `agents-cli run` adds your identity token for you:

```bash
agents-cli run "YOUR QUESTION" --url SERVICE_URL --mode a2a
```

Evaluate the deployed agent with the same dataset you used locally:

```bash
agents-cli eval run --dataset tests/eval/datasets/YOUR_DATASET.json --url SERVICE_URL --app-name app
```

## 6. Delete it

The service name is the folder name, for example `code-reviewer`.

```bash
gcloud run services delete SERVICE_NAME --region us-east1 --project YOUR_PROJECT_ID
gcloud artifacts repositories delete cloud-run-source-deploy --location us-east1 --project YOUR_PROJECT_ID
```

The second command removes the container images from the source build. If you made a project only for this, delete the
whole project instead: `gcloud projects delete YOUR_PROJECT_ID`.

After you are done, put your `GEMINI_API_KEY` back in `.env` to keep running the agent locally.
