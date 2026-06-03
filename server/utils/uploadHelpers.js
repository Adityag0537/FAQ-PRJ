const { cloudinary, isCloudinaryConfigured } = require("../config/cloudinary");

const ALLOWED_MIME_TYPES = ["image/png", "image/jpeg", "image/jpg"];
const MAX_ATTACHMENTS = 5;

const uploadToCloudinary = (buffer, fileName) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "samagama-faq",
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve({
          publicId: result.public_id,
          url: result.secure_url,
          fileName: fileName || result.original_filename,
          fileType: result.format,
          uploadedAt: new Date(),
        });
      }
    );

    stream.end(buffer);
  });

const validateImageFile = (file) => {
  if (!file) {
    return "No file provided";
  }

  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return "Only PNG, JPG, and JPEG images are supported";
  }

  return null;
};

module.exports = {
  uploadToCloudinary,
  validateImageFile,
  ALLOWED_MIME_TYPES,
  MAX_ATTACHMENTS,
  isCloudinaryConfigured,
};
