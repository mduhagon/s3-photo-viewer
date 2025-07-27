import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { db } from 'amplify:data';

const bucketsToScan = ['mdu-fotos', 'mdu-mama'];
const s3 = new S3Client({});

export const handler = async () => {
  let indexedCount = 0;

  for (const bucket of bucketsToScan) {
    const list = await s3.send(new ListObjectsV2Command({ Bucket: bucket }));
    const files =
      list.Contents?.map((obj) => obj.Key!).filter((key) =>
        /\.(jpe?g|png)$/i.test(key)
      ) ?? [];

    for (const key of files) {
      const parts = key.split('/');
      if (parts.length < 3) continue;

      const [yearStr, photographer, filename] = parts;
      const year = parseInt(yearStr);
      if (!year || !photographer || !filename) continue;

      const groupName = `${yearStr}-${photographer}`;

      // 1. Ensure PhotoGroup exists
      let group = await db.PhotoGroup.get(groupName);
      if (!group.data) {
        group = await db.PhotoGroup.create({
          name: groupName,
          year,
          photographer,
        });
      }

      // 2. Check if photo already exists
      const existing = await db.Photo.list({
        filter: {
          filename: { eq: filename },
          group: { eq: groupName },
        },
      });

      if (existing.data.length === 0) {
        await db.Photo.create({
          filename,
          s3Key: `s3://${bucket}/${key}`,
          takenAt: null,
          location: '',
          group: groupName,
        });
        indexedCount++;
      }
    }
  }

  return {
    statusCode: 200,
    body: `Indexed ${indexedCount} photos from S3.`,
  };
};
