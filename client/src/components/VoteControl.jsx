function VoteControl({ count, userHasUpvoted, onToggle, disabled = false }) {
  if (disabled) {
    return (
      <div className="vote-control vote-control-readonly">
        <span className="vote-arrow" aria-hidden="true">
          ▲
        </span>
        <span className="vote-count">{count}</span>
      </div>
    );
  }

  return (
    <div className="vote-control">
      <button
        type="button"
        className={`vote-btn ${userHasUpvoted ? "voted" : ""}`}
        onClick={onToggle}
        aria-pressed={userHasUpvoted}
        title={userHasUpvoted ? "Remove upvote" : "Upvote"}
      >
        ▲
      </button>
      <span className="vote-count">{count}</span>
      {userHasUpvoted && (
        <span className="vote-hint">Remove</span>
      )}
    </div>
  );
}

export default VoteControl;
