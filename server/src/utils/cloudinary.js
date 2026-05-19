import { v2 as cloudinary } from 'cloudinary';

let configured = false;

const ensureConfig = () => {
  if (!configured) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    configured = true;
  }
};

export const uploadImage = async (filePath) => {
  ensureConfig();
  const result = await cloudinary.uploader.upload(filePath, {
    folder: 'my-store',
  });
  return { url: result.secure_url, public_id: result.public_id };
};

export const deleteImage = async (publicId) => {
  ensureConfig();
  await cloudinary.uploader.destroy(publicId);
};
