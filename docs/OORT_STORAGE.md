# OORT Cloud Storage Integration

This document explains how OORT Cloud Storage is integrated into the application.

## Overview

OORT Cloud Storage is used as an alternative to AWS S3 for storing files. It provides a similar API to S3 but with different authentication mechanisms.

## Configuration

### Environment Variables

The OORT Cloud Storage configuration uses environment variables for sensitive values. These are defined in the `.env` file:

```
# OORT Cloud Configuration
VITE_OORT_ACCESS_KEY=your_oort_access_key
VITE_OORT_SECRET_KEY=your_oort_secret_key
VITE_OORT_ENDPOINT=https://s3-standard.oortech.com
```

### Setting Up Environment Variables

1. Copy the `.env.example` file to create a new `.env` file if you haven't already:
   ```
   cp .env.example .env
   ```

2. Edit the `.env` file and add your actual OORT credentials:
   ```
   VITE_OORT_ACCESS_KEY=your_actual_oort_access_key
   VITE_OORT_SECRET_KEY=your_actual_oort_secret_key
   VITE_OORT_ENDPOINT=https://s3-standard.oortech.com
   ```

3. The `.env` file is already included in `.gitignore` to prevent committing sensitive information to the repository.

## How OORT Storage Works

The OORT storage implementation is in `src/utils/oortStorage.ts`. It provides the following functionality:

1. **Credential Management**:
   - Retrieves credentials from environment variables, localStorage, or falls back to default credentials
   - Provides functions to save and reset credentials

2. **File Validation**:
   - Validates file size (max 100MB)
   - Validates file types (images, documents, data, video, audio)

3. **File Upload**:
   - Uploads files to OORT Cloud Storage in the "Flat-tires" folder by default
   - Provides progress tracking
   - Handles errors and provides detailed error messages

## Using OORT Storage in the Application

The application provides a user interface for selecting the storage option (AWS S3 or OORT) in the `TaskDetail.tsx` component. When OORT is selected, files are uploaded to OORT Cloud Storage.

### Upload Process

1. User selects OORT as the storage option
2. User selects files to upload
3. The application validates the files
4. The application retrieves OORT credentials
5. The application uploads the files to OORT Cloud Storage
6. The application displays the uploaded file URLs

## Testing OORT Storage

### Testing Environment Variables

You can verify that the OORT environment variables are being loaded correctly by running the test script:

```
npx vite-node src/utils/testOortEnvVars.ts
```

This script will check if the OORT environment variables are set and display masked versions of their values.

### Testing File Uploads

You can test uploading a file to OORT Cloud Storage by running the test script:

```
npx vite-node src/utils/testOortUpload.ts
```

This script will:
1. Create a test file
2. Upload it to OORT Cloud Storage
3. Verify that the file is accessible
4. Display the URL of the uploaded file

## Troubleshooting

If you encounter issues with OORT Cloud Storage:

1. **Check Credentials**: Verify that your OORT credentials are correct in the `.env` file.

2. **Check Endpoint**: Ensure that the OORT endpoint URL (VITE_OORT_ENDPOINT) is correct. The standard endpoint is `https://s3-standard.oortech.com`.

3. **Check Network**: Ensure that you have a working internet connection and that your network allows connections to OORT Cloud Storage.

4. **Check Permissions**: Verify that your OORT account has the necessary permissions to upload files.

4. **Check File Size and Type**: Ensure that the files you're trying to upload are within the size limit (100MB) and of an allowed type.

5. **Check Console Errors**: Look for any errors in the browser console that might provide more information about the issue.

## Resources

- [OORT Cloud Documentation](https://docs.oortech.com/)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)