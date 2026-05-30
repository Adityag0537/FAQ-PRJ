import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge";
import { formatRelativeTime } from "../utils/formatRelativeTime";
import {
  getQuestionStatus,
  getAcceptedAnswerPreview,
} from "../utils/questionStatus";

function QuestionListItem({ question, faqThreshold }) {
  const status = getQuestionStatus(question, faqThreshold);
  const preview = getAcceptedAnswerPreview(question);
  const answerCount = question.answerCount ?? 0;
  const answerLabel = answerCount === 1 ? "Answer" : "Answers";

  return (
    <Link to={`/questions/${question._id}`} className="question-row card">
      <div className="question-row-main">
        <div className="question-row-top">
          <StatusBadge status={status} />
          <span className="question-row-time">
            Asked {formatRelativeTime(question.createdAt)}
          </span>
        </div>

        <h3 className="question-row-title">{question.title}</h3>
        <p className="question-row-excerpt">{question.description}</p>

        {preview && (status === "solved" || status === "faq") && (
          <div className="accepted-preview">
            <span className="accepted-preview-label">✓ Accepted:</span>
            <p>"{preview}"</p>
            <span className="read-more">Read more →</span>
          </div>
        )}

        {question.categories?.length > 0 && (
          <div className="tag-list tag-list-compact">
            {question.categories.map((category) => (
              <span key={category} className="tag">
                {category}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="question-row-stats">
        <div className="stat-block">
          <span className="stat-icon" aria-hidden="true">
            👍
          </span>
          <span className="stat-value">{question.upvotes}</span>
          <span className="stat-label">Upvotes</span>
        </div>
        <div className="stat-block">
          <span className="stat-icon" aria-hidden="true">
            💬
          </span>
          <span className="stat-value">{answerCount}</span>
          <span className="stat-label">{answerLabel}</span>
        </div>
      </div>
    </Link>
  );
}

export default QuestionListItem;
