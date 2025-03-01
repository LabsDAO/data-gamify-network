# Solving AWS S3 CORS Issues

This guide explains how to solve Cross-Origin Resource Sharing (CORS) issues when working with AWS S3 in browser applications.

## Understanding CORS Issues

CORS (Cross-Origin Resource Sharing) is a security feature implemented by browsers that restricts web pages from making requests to a different domain than the one that served the web page. When your browser-based application tries to connect directly to AWS S3, the browser blocks these requests unless the S3 bucket explicitly allows them.

Common error messages related to CORS issues:
- "Network error connecting to AWS"
- "CORS policy: No 'Access-Control-Allow-Origin' header"
- "Failed to fetch"
- "Cross-Origin Request Blocked"

## Solution 1: Configure CORS on Your S3 Bucket

The most straightforward solution is to configure your S3 bucket to allow requests from your application's domain.

### Using Our Configuration Script

We've provided a script that automatically configures CORS on your S3 bucket:

```sh
# Start the development server to load environment variables
npm run dev

# In another terminal, run the CORS configuration script
npx vite-node src/utils/configureBucketCors.ts
```

### Manual Configuration in AWS Console

If you prefer to configure CORS manually:

1. Sign in to the AWS Management Console
2. Navigate to the S3 service
3. Select your bucket
4. Click on the "Permissions" tab
5. Scroll down to the "Cross-origin resource sharing (CORS)" section
6. Click "Edit"
7. Add the following CORS configuration:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": [
      "ETag",
      "x-amz-server-side-encryption",
      "x-amz-request-id",
      "x-amz-id-2"
    ],
    "MaxAgeSeconds": 3000
  }
]
```

**Note**: In production, replace `"*"` in `"AllowedOrigins"` with your specific domain (e.g., `"https://yourdomain.com"`) for better security.

### Required IAM Permissions

Your AWS IAM user needs the following permissions to configure CORS:
- `s3:PutBucketCors` - To set CORS configuration on the bucket

## Solution 2: Use Pre-signed URLs

If you can't modify the S3 bucket's CORS configuration (e.g., you don't have the necessary permissions), you can use pre-signed URLs to bypass CORS restrictions.

### How Pre-signed URLs Work

1. Your application generates a pre-signed URL on the client side using your AWS credentials
2. The pre-signed URL contains a temporary authorization token
3. The browser uploads directly to this URL without needing to include AWS credentials in the request
4. Since the request is made directly to the pre-signed URL (not through the AWS SDK), CORS restrictions are bypassed

### Using Our Pre-signed URL Implementation

We've provided a complete implementation of pre-signed URL uploads:

```javascript
import { useAwsPresignedUpload } from '@/hooks/aws/use-aws-presigned-upload';

// In your component:
const {
  uploadFile,
  isUploading,
  progress,
  error,
  uploadUrl
} = useAwsPresignedUpload({
  path: 'your-upload-path/',
  onProgress: (progress) => console.log(`Upload progress: ${progress}%`)
});

// Later in your code:
const handleUpload = async (file) => {
  const url = await uploadFile(file);
  if (url) {
    console.log(`File uploaded successfully: ${url}`);
  }
};
```

### Testing Pre-signed URLs

To test if pre-signed URLs work for your AWS configuration:

```sh
# You can run this directly in Node.js without needing to start the dev server
npx vite-node src/utils/testPresignedUpload.ts
```

The test scripts have been designed to work in both browser and Node.js environments, making it easy to verify your AWS configuration from the command line.

## Solution 3: Use a Proxy Server

Another approach is to use a server-side proxy that forwards requests to AWS S3. This way, the browser only communicates with your server (same origin), and your server communicates with AWS S3.

This approach requires setting up a server-side component, which is beyond the scope of our current implementation.

## Troubleshooting

If you're still experiencing CORS issues:

1. **Check your AWS credentials**: Make sure your access key and secret key are correct
2. **Verify bucket permissions**: Ensure your IAM user has the necessary permissions to access the bucket
3. **Clear browser cache**: Sometimes browsers cache CORS errors
4. **Try an incognito window**: This eliminates extensions that might interfere with requests
5. **Check for network issues**: Make sure you can connect to AWS S3 in general
6. **Verify CORS configuration**: Double-check that your CORS configuration is correctly applied
7. **Look at browser console**: Check for specific error messages that might provide more details

### Common S3 Bucket Issues

#### ACL Disabled Error

If you encounter an error like "The bucket does not allow ACLs" or "AccessControlListNotSupported", this means your S3 bucket has Object Ownership set to "Bucket owner enforced", which disables ACLs.

Solution:
1. Remove the `ACL: 'public-read'` parameter from your upload requests
2. For pre-signed URLs, remove any `x-amz-acl` parameters from the URL

Our implementation handles this automatically by:
- Not including ACL parameters in the pre-signed URL generation
- Removing any ACL parameters from the URL before making the request

#### Network Error Connecting to AWS

If you encounter a "Network error connecting to AWS" error when testing the connection, this is typically due to CORS restrictions in the browser.

Solution:
1. Use the pre-signed URL approach for all AWS operations
2. Configure CORS on your S3 bucket

Our implementation now uses pre-signed URLs for all AWS operations, including:
- Uploading files
- Testing connectivity
- Listing buckets
- Checking if a bucket exists

This approach bypasses CORS restrictions by making direct HTTP requests to pre-signed URLs instead of using the AWS SDK, which is subject to CORS restrictions in the browser.

#### No More Test Files in Your S3 Bucket

We've completely eliminated the creation of test files in your S3 bucket:

1. Connection testing no longer uploads any test files
2. Bucket existence checks no longer upload any test files
3. Listing buckets no longer performs any tests

This ensures that no test files are created in your S3 bucket when you're uploading your actual data. The system now only uploads the files you explicitly select, without creating any additional test files.

#### Test Scripts

The test scripts (`testActualUpload.ts`, `testCurlUpload.ts`, etc.) still create test files in the `_system_tests_` directory, but these are only run when you explicitly execute the test scripts, not during normal operation of the application.

## Additional Resources

- [AWS S3 CORS Documentation](https://docs.aws.amazon.com/AmazonS3/latest/userguide/cors.html)
- [AWS S3 Pre-signed URLs Documentation](https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html)