import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import logger from '@/lib/logger'

import { randomUUID } from 'crypto';



const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID || '664bd3eb78dc66483cc3c023f8807f64'}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '17066a30d4efe5e26bf3608224e9e196',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '03dca8f930f3822dad276ded67d74d202041abad7087c3800a432376209ceadd',
  },
});

const getS3Client = () => {
  const accountId = process.env.R2_ACCOUNT_ID || '664bd3eb78dc66483cc3c023f8807f64';
  const accessKeyId = process.env.R2_ACCESS_KEY_ID || '17066a30d4efe5e26bf3608224e9e196';
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || '03dca8f930f3822dad276ded67d74d202041abad7087c3800a432376209ceadd';

  if (!process.env.R2_ACCOUNT_ID || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY) {
    logger.warn('[R2] Warning: Using hardcoded fallback credentials. Please set R2 environment variables in Vercel.');
  }

  return new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: accessKeyId,
      secretAccessKey: secretAccessKey,
    },
  });
};

export async function POST(request) {
  logger.log('[R2] POST request received at /api/upload-to-r2');
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      console.error('[R2] No file in form data');
      return new Response(JSON.stringify({ error: 'No file provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    logger.log('[R2] Starting upload for file:', file.name, 'Size:', file.size, 'Type:', file.type);
    
    const s3Client = getS3Client();
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${randomUUID()}-${file.name.replace(/\s+/g, '-')}`;
    const bucketName = process.env.R2_BUCKET_NAME || 'realtybusinesses';
    logger.log('[R2] Uploading to bucket:', bucketName, 'Key:', fileName);

    const uploadParams = {
      Bucket: bucketName,
      Key: fileName,
      Body: buffer,
      ContentType: file.type || 'application/octet-stream',
    };

    logger.log('[R2] Sending PutObjectCommand...');
    const command = new PutObjectCommand(uploadParams);
    await s3Client.send(command);

    const publicBaseUrl = process.env.R2_PUBLIC_URL_BASE || 'https://cdn.realtydirections.com';
    const baseUrlStripped = publicBaseUrl.endsWith('/') ? publicBaseUrl.slice(0, -1) : publicBaseUrl;
    const url = `${baseUrlStripped}/${fileName}`;

    logger.log('[R2] Upload successful:', url);

    return new Response(JSON.stringify({ url }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[R2] UPLOAD ERROR:', error);
    return new Response(JSON.stringify({ 
        error: 'Upload failed', 
        message: error.message,
        stack: error.stack,
        code: error.code || error.name
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
