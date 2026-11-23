export interface CompressedPhotoResult {
  dataUrl: string;
  sizeKb: number;
  width: number;
  height: number;
}

const MAX_DATA_URL_LENGTH = 260000;

export async function compressDoubtPhoto(file: File): Promise<CompressedPhotoResult> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Please choose a valid image file (PNG, JPG, or WebP).');
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('Could not decode the selected image.'));
      image.src = objectUrl;
    });

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas compression is unavailable in this browser.');
    }

    const attempts = [
      { maxDim: 880, qualities: [0.74, 0.62, 0.5] },
      { maxDim: 640, qualities: [0.58, 0.45] },
      { maxDim: 480, qualities: [0.45, 0.35] },
    ];

    for (const attempt of attempts) {
      const scale = Math.min(1, attempt.maxDim / Math.max(img.width, img.height));
      const width = Math.max(1, Math.round(img.width * scale));
      const height = Math.max(1, Math.round(img.height * scale));
      canvas.width = width;
      canvas.height = height;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      for (const quality of attempt.qualities) {
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        if (dataUrl.length <= MAX_DATA_URL_LENGTH) {
          return {
            dataUrl,
            sizeKb: Math.max(1, Math.round((dataUrl.length * 3) / 4 / 1024)),
            width,
            height,
          };
        }
      }
    }

    throw new Error('Image is still too large after compression. Please pick a clearer crop or smaller photo.');
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
