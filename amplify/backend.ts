import { defineBackend } from '@aws-amplify/backend';
import { data } from '@aws-amplify/backend/data';
import { storage } from '@aws-amplify/backend/storage';

export const backend = defineBackend({
  data: data({
    models: {
      PhotoGroup: {
        name: 'string',
        year: 'integer',
        photographer: 'string',
        photos: ['Photo'],
      },
      Photo: {
        filename: 'string',
        s3Key: 'string',
        takenAt: 'date',
        location: 'string',
        group: 'PhotoGroup',
      },
    },
  }),
  storage: storage({
    name: 'photoStorage',
  }),
});

