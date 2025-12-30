import 'dotenv/config';

export default ({ config }) => ({
  ...config,
  extra: {
    AWS_ACCESS_KEY_ID: process.env.EXPO_PUBLIC_AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.EXPO_PUBLIC_AWS_SECRET_ACCESS_KEY,
    AWS_REGION: process.env.EXPO_PUBLIC_AWS_REGION,
    S3_BUCKET_NAME: process.env.EXPO_PUBLIC_S3_BUCKET_NAME,
  },
});