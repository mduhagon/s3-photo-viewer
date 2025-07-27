import { defineFunction } from '@aws-amplify/backend/function';
import * as iam from 'aws-cdk-lib/aws-iam';

const bucketsToScan = ['mdu-fotos', 'mdu-mama'];

export const s3Indexer = defineFunction({
  name: 's3Indexer',
  entry: './amplify/functions/s3-indexer-handler.ts', // 👈 separate file!
  runtime: 'nodejs18.x',
  permissions: {
    externalBuckets: bucketsToScan,
  },
  policy: [
    iam.PolicyStatement.fromJson({
      Effect: 'Allow',
      Action: ['s3:ListBucket', 's3:GetObject'],
      Resource: bucketsToScan.flatMap((bucket) => [
        `arn:aws:s3:::${bucket}`,
        `arn:aws:s3:::${bucket}/*`,
      ]),
    }),
  ],
  url: true, // 👈 Makes it callable via HTTP
});
