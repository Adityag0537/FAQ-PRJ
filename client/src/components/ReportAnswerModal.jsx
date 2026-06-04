import { useState } from "react";
import API from "../services/api";
import { QUESTION_REPORT_REASONS, REPORT_REASONS } from "../constants/uploads";

function ReportAnswerModal({
  answerId,
  questionId,
  contentType = "answer",
  onClose,
  onSuccess,
}) {
  const isQuestion = contentType === "question";
  const reasons = isQuestion ? QUESTION_REPORT_REASONS : REPORT_REASONS;
  const [reason, setReason] = useState(reasons[0]);
  const [additionalComments, setAdditionalComments] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const reportUrl = isQuestion
        ? `/questions/${questionId}/report`
        : `/answers/${answerId}/report`;

      await API.post(reportUrl, {
        reason,
        additionalComments,
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit report");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h3>{isQuestion ? "Report Question" : "Report Answer"}</h3>
        <p className="field-hint">
          Reported {isQuestion ? "questions" : "answers"} remain visible until
          reviewed by an admin.
        </p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label className="field-label">Reason</label>
            <select value={reason} onChange={(e) => setReason(e.target.value)}>
              {reasons.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label className="field-label">Additional comments (optional)</label>
            <textarea
              value={additionalComments}
              onChange={(e) => setAdditionalComments(e.target.value)}
              rows={3}
            />
          </div>

          <div className="action-row">
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Report"}
            </button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReportAnswerModal;
