# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/e2ed48b1-e232-429d-b3e1-bdf80acdebb8

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/e2ed48b1-e232-429d-b3e1-bdf80acdebb8) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- AWS S3 for file storage

## Setting up AWS Credentials

This project uses AWS S3 for file storage. To set up your AWS credentials securely:

1. Copy the `.env.example` file to a new file named `.env`:
   ```sh
   cp .env.example .env
   ```

2. Edit the `.env` file and add your AWS credentials:
   ```
   VITE_AWS_ACCESS_KEY_ID=your_access_key_id
   VITE_AWS_SECRET_ACCESS_KEY=your_secret_access_key
   VITE_AWS_REGION=your_region
   VITE_AWS_BUCKET=your_bucket_name
   ```

3. Make sure your AWS IAM user has the following permissions:
   - `s3:PutObject` - To upload files
   - `s3:PutObjectAcl` - To set file permissions
   - `s3:GetObject` - To retrieve files
   - `s3:ListBucket` - To list bucket contents

4. Configure CORS on your S3 bucket to allow uploads from your domain.

> **Note**: The `.env` file is excluded from Git in `.gitignore` to prevent accidentally committing your credentials.

### Testing AWS Credentials

We've included several test scripts to help verify your AWS configuration:

1. **Test Environment Variables**:
   ```sh
   # Run the test script directly
   npx vite-node src/utils/testEnvCredentials.ts
   ```

2. **Test AWS Connection**:
   ```sh
   # Run the test script directly
   npx vite-node src/utils/testAwsConnection.ts
   ```

These scripts will verify that your AWS credentials are correctly loaded and that you can connect to AWS S3. The scripts have been designed to work in both browser and Node.js environments, so you can run them directly from the command line without needing to start the development server.

## Solving CORS Issues

If you encounter CORS (Cross-Origin Resource Sharing) errors when connecting to AWS S3, we've provided two solutions:

### Solution 1: Configure CORS on Your S3 Bucket

Use our CORS configuration script to automatically set up your S3 bucket to accept requests from your application:

```sh
# Run the CORS configuration script directly
npx vite-node src/utils/configureBucketCors.ts
```

This script requires that your IAM user has the `s3:PutBucketCors` permission.

### Solution 2: Use Pre-signed URLs (CORS-Friendly Alternative)

We've implemented a pre-signed URL approach that can bypass CORS restrictions:

```sh
# Test the pre-signed URL functionality
npx vite-node src/utils/testPresignedUpload.ts
```

To use pre-signed URLs in your application:

```javascript
import { uploadWithPresignedUrl } from '@/utils/awsPresignedUpload';

// Later in your code:
const uploadUrl = await uploadWithPresignedUrl(file, 'your-path/');
```

This approach works by generating a temporary URL that allows direct uploads to S3 without requiring AWS credentials in the browser.

For a comprehensive guide on solving CORS issues with AWS S3, see [SOLVING_AWS_CORS_ISSUES.md](docs/SOLVING_AWS_CORS_ISSUES.md).

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/e2ed48b1-e232-429d-b3e1-bdf80acdebb8) and click on Share -> Publish.

## I want to use a custom domain - is that possible?

We don't support custom domains (yet). If you want to deploy your project under your own domain then we recommend using Netlify. Visit our docs for more details: [Custom domains](https://docs.lovable.dev/tips-tricks/custom-domain/)
