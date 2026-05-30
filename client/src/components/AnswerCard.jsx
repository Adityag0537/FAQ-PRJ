import VoteControl from "./VoteControl";
import { formatRelativeTime } from "../utils/formatRelativeTime";

function getInitials(name) {
  if (!name) {
    return "?";
  }

  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function AnswerCard({
  answer,
  isAccepted = false,
  user,
  isOwner,
  editAnswerId,
  editForm,
  setEditAnswerId,
  setEditForm,
  onUpvote,
  onSaveEdit,
  onDelete,
  renderAcceptAction,
}) {
  if (editAnswerId === answer._id) {
    return (
      <article className="answer-thread answer-thread-editing">
        <textarea
          value={editForm.content ?? answer.content}
          onChange={(e) => setEditForm({ content: e.target.value })}
          rows={5}
          className="answer-edit-textarea"
        />
        <div className="answer-footer">
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => onSaveEdit(answer._id)}
          >
            Save Changes
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setEditAnswerId(null)}
          >
            Cancel
          </button>
        </div>
      </article>
    );
  }

  return (
    <article
      className={`answer-thread ${isAccepted ? "answer-thread-accepted" : ""}`}
    >
      {user ? (
        <VoteControl
          count={answer.upvotes}
          userHasUpvoted={answer.userHasUpvoted}
          onToggle={() => onUpvote(answer._id)}
        />
      ) : (
        <VoteControl count={answer.upvotes} disabled />
      )}

      <div className="answer-thread-body">
        <header className="answer-thread-header">
          <div className="answer-author-row">
            <span className="answer-avatar">
              {getInitials(answer.author?.name)}
            </span>
            <div>
              <strong className="answer-author-name">
                {answer.author?.name || "Anonymous"}
              </strong>
              <span className="answer-time">
                answered {formatRelativeTime(answer.createdAt)}
              </span>
            </div>
          </div>
          {isAccepted && (
            <span className="answer-badge answer-badge-lg">✓ Accepted</span>
          )}
        </header>

        <div className="answer-content">{answer.content}</div>

        <footer className="answer-footer">
          {renderAcceptAction?.(answer)}
          {isOwner(answer.author) && (
            <>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  setEditAnswerId(answer._id);
                  setEditForm({ content: answer.content });
                }}
              >
                Edit
              </button>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={() => onDelete(answer._id)}
              >
                Delete
              </button>
            </>
          )}
        </footer>
      </div>
    </article>
  );
}

export default AnswerCard;
