import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import sharp from 'sharp';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_ANON_KEY
);

class StorageService {
  async uploadBase64(bucket, prefix, dataUrl) {
    const match = /^data:(.+);base64,(.*)$/.exec(dataUrl || '');
    if (!match) throw new Error('Invalid image data');
    const mimeType = match[1];
    const base64 = match[2];
    const inputBuffer = Buffer.from(base64, 'base64');
    const fileName = `${prefix}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;

    // Optimize: resize <= 1600px and compress targeting ~1MB
    let quality = 80;
    let output = await sharp(inputBuffer)
      .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
      .webp({ quality })
      .toBuffer();

    // Reduce quality if > 1MB
    while (output.length > 1024 * 1024 && quality > 40) {
      quality -= 10;
      output = await sharp(inputBuffer)
        .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
        .webp({ quality })
        .toBuffer();
    }

    const { error } = await supabase.storage.from(bucket).upload(fileName, output, {
      contentType: 'image/webp',
      upsert: false
    });
    if (error) throw error;

    const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return data.publicUrl;
  }
}

export default new StorageService();


