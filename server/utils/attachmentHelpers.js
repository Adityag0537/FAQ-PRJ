const {
  uploadToCloudinary,
  validateImageFile,
  MAX_ATTACHMENTS,
  isCloudinaryConfigured,
} = require("./uploadHelpers");

const processUploadedFiles = async (files = []) => {
  if (!files.length) {
    return [];
  }

  if (!isCloudinaryConfigured()) {
    throw new Error(
      "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET."
    );
  }

  if (files.length > MAX_ATTACHMENTS) {
    throw new Error(`Maximum ${MAX_ATTACHMENTS} attachments allowed`);
  }

  const attachments = [];

  for (const file of files) {
    const validationError = validateImageFile(file);

    if (validationError) {
      throw new Error(validationError);
    }

    const uploaded = await uploadToCloudinary(file.buffer, file.originalname);
    attachments.push(uploaded);
  }

  return attachments;
};

const stripAttachmentsForList = (question) => {
  const obj = question.toObject ? question.toObject() : { ...question };
  const count = obj.attachments?.length || 0;
  const acceptedAnswerContent = obj.acceptedAnswer
    ? obj.acceptedAnswerContent
    : "";

  delete obj.attachments;

  return {
    ...obj,
    acceptedAnswerContent,
    attachmentCount: count,
  };
};

module.exports = {
  processUploadedFiles,
  stripAttachmentsForList,
  MAX_ATTACHMENTS,
};
