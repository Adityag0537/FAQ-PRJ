import { useState } from "react";

function AttachmentGallery({ attachments = [] }) {
  const [previewUrl, setPreviewUrl] = useState(null);

  if (!attachments.length) {
    return null;
  }

  return (
    <div className="attachment-gallery">
      <h4 className="attachment-gallery-title">Attachments</h4>
      <div className="attachment-thumbs">
        {attachments.map((file) => (
          <button
            key={file._id || file.publicId}
            type="button"
            className="attachment-thumb"
            onClick={() => setPreviewUrl(file.url)}
          >
            <img src={file.url} alt={file.fileName} />
          </button>
        ))}
      </div>

      {previewUrl && (
        <div
          className="attachment-lightbox"
          role="dialog"
          aria-modal="true"
          onClick={() => setPreviewUrl(null)}
        >
          <img src={previewUrl} alt="Attachment preview" />
        </div>
      )}
    </div>
  );
}

export default AttachmentGallery;
