import { fileURLToPath } from 'url';
import { Storage } from '@google-cloud/storage';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const keyPath = path.join(__dirname, 'your-tube-458615-49c5a8ced44e.json');

const storageOptions = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON
  ? {
    projectId: 'your-tube-458615',
    credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON),
  }
  : {
    projectId: 'your-tube-458615',
    keyFilename: keyPath,
  };

export const storage = new Storage(storageOptions);
export const bucketName = 'your-tube-hls-video-storage';

export async function uploadFileToGCS(localPath, gcsDest) {
  await storage.bucket(bucketName).upload(localPath, {
    destination: gcsDest,
    public: true,
    metadata: { cacheControl: 'public, max-age=31536000' },
  });
  console.log(`Uploaded ${localPath} → gs://${bucketName}/${gcsDest}`);
  return `https://storage.googleapis.com/${bucketName}/${gcsDest}`;
}

export async function uploadFolderToGCS(localFolder, remoteFolder) {
  if (!fs.existsSync(localFolder)) {
    throw new Error('Local folder does not exist: ' + localFolder);
  }

  const entries = fs.readdirSync(localFolder, { withFileTypes: true });

  const tasks = entries.map(async (entry) => {
    const localPath = path.join(localFolder, entry.name);
    const remotePath = `${remoteFolder}/${entry.name}`;

    if (entry.isFile()) {
      await storage.bucket(bucketName).upload(localPath, {
        destination: remotePath,
        public: true,
        metadata: { cacheControl: 'public, max-age=31536000' },
      });
      console.log(`Uploaded file → gs://${bucketName}/${remotePath}`);
    } else if (entry.isDirectory()) {
      await uploadFolderToGCS(localPath, remotePath);
    }
  });

  await Promise.all(tasks);
  console.log(`Finished uploading folder ${localFolder} → ${remoteFolder}`);
}
