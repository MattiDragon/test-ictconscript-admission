# ICT Conscript Admission Test Entry

I have completed the following tasks

## 01a-swdev-frontend

The source code is available in the `frontend` directory. I decided to go with a plain HTML approach instead of involving libraries for this demo project.
While a full client-side-rendered app would be a reasonable chouice, I feel that this page is small enough where that doesn't matter.
Doing plain HTML greatly simplifies the build setup (the workflow in `.github/workflows/publish-frontend.yaml` only packages the existing files for GitHub Pages).
To make this easier I used some more modern HTML tools, namely the `<template>` and `<dialog>` elements. The page is visible at https://mattidragon.github.io/test-ictconscript-admission/

## 01b-swdev-backend-api

The source code is available in the `backend` directory. The service is available at https://test-ictconscript-admission-1wjv.onrender.com/
(it might take a while to respond the first time due to the free tier instance spinning up). I decided to use TypeScript with express to implement this service,
as I'm fairly familiar with it and the requirements are pretty simple. I use the built in sqlite library that comes with nodejs for the database.
The openapi spec is available at `backend/openapi.yaml`.
