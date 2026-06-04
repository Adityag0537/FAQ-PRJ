import { MAX_ATTACHMENTS } from "../constants/uploads";

function AttachmentUpload({ files, onChange, label = "Screenshots (PNG, JPG, JPEG)" }) {
  const handleChange = (event) => {
    const selected = Array.from(event.target.files || []);
    onChange([...(files || []), ...selected].slice(0, MAX_ATTACHMENTS));
    event.target.value = "";
  };

  const removeFile = (index) => {
    onChange(files.filter((_, i) => i !== index));
  };

  return (
    <div className="field">
      <label className="field-label">{label}</label>
      <p className="field-hint">
        Up to {MAX_ATTACHMENTS} images. Stored securely via Cloudinary.
      </p>
      <input
        type="file"
        accept="image/png,image/jpeg,image/jpg"
        multiple
        onChange={handleChange}
        disabled={(files?.length || 0) >= MAX_ATTACHMENTS}
      />
      {files?.length > 0 && (
        <ul className="upload-preview-list">
          {files.map((file, index) => (
            <li key={`${file.name}-${index}`} className="upload-preview-item">
              <span>{file.name}</span>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => removeFile(index)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default AttachmentUpload;
