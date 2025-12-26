import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import Constants from 'expo-constants';

const {
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_REGION,
  S3_BUCKET_NAME
} = Constants.expoConfig.extra;

const s3 = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

export async function uploadJsonToS3(key, data) {
  const fileContent = JSON.stringify(data, null, 2);
  const command = new PutObjectCommand({
    Bucket: S3_BUCKET_NAME,
    Key: key,
    Body: fileContent,
    ContentType: 'application/json',
  });
  return s3.send(command);
}