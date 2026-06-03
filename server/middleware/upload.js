const multer = require("multer");
const { MAX_ATTACHMENTS } = require("../utils/uploadHelpers");

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: MAX_ATTACHMENTS,
  },
});

module.exports = upload;
