function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Failed to compress image'));
    }, type, quality);
  });
}

/**
 * Compresses an image for upload so KYC/document requests stay under reverse-proxy limits.
 */
export async function compressImageForUpload(
  file,
  {
    maxWidth = 1920,
    maxHeight = 1920,
    maxSizeBytes = 450 * 1024,
    initialQuality = 0.85,
  } = {}
) {
  if (!file?.type?.startsWith('image/')) {
    throw new Error('Invalid image file');
  }

  const bitmap = await createImageBitmap(file);
  let width = bitmap.width;
  let height = bitmap.height;

  const scale = Math.min(1, maxWidth / width, maxHeight / height);
  width = Math.round(width * scale);
  height = Math.round(height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  let quality = initialQuality;
  let blob = await canvasToBlob(canvas, 'image/jpeg', quality);

  while (blob.size > maxSizeBytes && quality > 0.45) {
    quality -= 0.08;
    blob = await canvasToBlob(canvas, 'image/jpeg', quality);
  }

  const baseName = file.name.replace(/\.[^.]+$/, '') || 'image';
  return new File([blob], `${baseName}.jpg`, {
    type: 'image/jpeg',
    lastModified: Date.now(),
  });
}
