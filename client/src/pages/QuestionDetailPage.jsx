import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import StatusBadge from "../components/StatusBadge";
import VoteControl from "../components/VoteControl";
import AnswerCard from "../components/AnswerCard";
import LoadingState from "../components/LoadingState";
import { formatRelativeTime } from "../utils/formatRelativeTime";
import AttachmentGallery from "../components/AttachmentGallery";
import AttachmentUpload from "../components/AttachmentUpload";
import ReportAnswerModal from "../components/ReportAnswerModal";
import { buildQuestionFormData } from "../utils/formData";
import {
  getQuestionStatus,
  getAcceptedAnswerId,
  mergeQuestionUpdate,
} from "../utils/questionStatus";

function QuestionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [faqConfig, setFaqConfig] = useState({
    faqMinViews: 100,
    faqMinAgeDays: 7,
  });
  const [editFiles, setEditFiles] = useState([]);
  const [reportAnswerId, setReportAnswerId] = useState(null);
  const [reportQuestionOpen, setReportQuestionOpen] = useState(false);
  const [answerDraft, setAnswerDraft] = useState("");
  const [editQuestion, setEditQuestion] = useState(false);
  const [editAnswerId, setEditAnswerId] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    API.get("/config")
      .then((res) =>
        setFaqConfig({
          faqMinViews: res.data.data.faqMinViews ?? 100,
          faqMinAgeDays: res.data.data.faqMinAgeDays ?? 7,
        })
      )
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadQuestion();
    loadAnswers();
  }, [id]);

  useEffect(() => {
    if (!location.state) {
      return;
    }

    if (location.state.editQuestion) {
      setEditQuestion(true);
    }

    if (location.state.editAnswerId) {
      setEditAnswerId(location.state.editAnswerId);
    }

    navigate(location.pathname, { replace: true, state: null });
  }, [location.state, location.pathname, navigate]);

  useEffect(() => {
    if (editQuestion && question) {
      setEditForm({
        title: question.title,
        description: question.description,
      });
    }
  }, [editQuestion, question]);

  useEffect(() => {
    if (!editAnswerId || !answers.length) {
      return;
    }

    const answer = answers.find((item) => item._id === editAnswerId);

    if (answer) {
      setEditForm({ content: answer.content });
    }
  }, [editAnswerId, answers]);

  const loadQuestion = async () => {
    setLoading(true);

    try {
      const res = await API.get(`/questions/${id}`);
      setQuestion(res.data.data);
    } catch {
      setQuestion(null);
    } finally {
      setLoading(false);
    }
  };

  const loadAnswers = async () => {
    try {
      const res = await API.get(`/questions/${id}/answers`);
      setAnswers(res.data.data);
    } catch {
      setAnswers([]);
    }
  };

  const updateQuestion = (updated) => {
    setQuestion((prev) => mergeQuestionUpdate(prev, updated));
  };

  const toggleQuestionUpvote = async () => {
    const res = await API.patch(`/questions/${id}/upvote`);
    updateQuestion(res.data.data);
  };

  const toggleAnswerUpvote = async (answerId) => {
    const res = await API.patch(`/answers/${answerId}/upvote`);
    setAnswers((prev) =>
      prev.map((a) => (a._id === answerId ? res.data.data : a))
    );
  };

  const acceptAnswer = async (answerId) => {
    const res = await API.patch(`/questions/${id}/accept/${answerId}`);
    updateQuestion(res.data.data);
    loadAnswers();
  };

  const unacceptAnswer = async () => {
    const res = await API.patch(`/questions/${id}/unaccept`);
    updateQuestion(res.data.data);
    loadAnswers();
  };

  const deleteQuestion = async () => {
    if (!window.confirm("Delete this question?")) {
      return;
    }

    await API.delete(`/questions/${id}`);
    navigate("/questions");
  };

  const saveQuestionEdit = async () => {
    const formData = buildQuestionFormData({
      title: editForm.title ?? question.title,
      description: editForm.description ?? question.description,
      categories: question.categories,
      files: editFiles,
    });

    await API.patch(`/questions/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    setEditQuestion(false);
    setEditForm({});
    setEditFiles([]);
    loadQuestion();
  };

  const submitAnswer = async () => {
    if (!answerDraft.trim()) {
      return;
    }

    await API.post(`/questions/${id}/answers`, { content: answerDraft });
    setAnswerDraft("");
    loadAnswers();
    loadQuestion();
  };

  const deleteAnswer = async (answerId) => {
    if (!window.confirm("Delete this answer?")) {
      return;
    }

    await API.delete(`/answers/${answerId}`);
    loadAnswers();
    loadQuestion();
  };

  const saveAnswerEdit = async (answerId) => {
    await API.patch(`/answers/${answerId}`, { content: editForm.content });
    setEditAnswerId(null);
    setEditForm({});
    loadAnswers();
    loadQuestion();
  };

  const isOwner = (author) =>
    user && author && author._id === user._id;

  const renderAcceptAction = (answer) => {
    if (!isOwner(question?.author)) {
      return null;
    }

    const acceptedId = getAcceptedAnswerId(question);
    const isAccepted = acceptedId === answer._id.toString();

    if (isAccepted) {
      return (
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={unacceptAnswer}
        >
          Unaccept
        </button>
      );
    }

    return (
      <button
        type="button"
        className="btn btn-accent btn-sm"
        onClick={() => acceptAnswer(answer._id)}
      >
        {acceptedId ? "Accept Instead" : "Accept Answer"}
      </button>
    );
  };

  if (loading) {
    return (
      <div className="container page">
        <LoadingState message="Loading question..." />
      </div>
    );
  }

  if (!question) {
    return (
      <div className="container page">
        <div className="empty-state-card">
          <h3>Question not found</h3>
          <Link to="/questions" className="btn btn-primary">
            Back to Community
          </Link>
        </div>
      </div>
    );
  }

  const status = getQuestionStatus(question, faqConfig);
  const acceptedId = getAcceptedAnswerId(question);
  const otherAnswers = answers.filter(
    (a) => a._id.toString() !== acceptedId
  );
  const acceptedAnswer = answers.find(
    (a) => a._id.toString() === acceptedId
  );

  return (
    <div className="container page question-detail-page">
      <Link to="/questions" className="back-nav">
        ← Back to Community Questions
      </Link>

      <article className="card question-detail-card">
        {editQuestion ? (
          <div className="edit-form">
            <label className="field-label">Title</label>
            <input
              type="text"
              value={editForm.title ?? question.title}
              onChange={(e) =>
                setEditForm({ ...editForm, title: e.target.value })
              }
            />
            <label className="field-label">Description</label>
            <textarea
              value={editForm.description ?? question.description}
              onChange={(e) =>
                setEditForm({ ...editForm, description: e.target.value })
              }
              rows={5}
            />
            <AttachmentUpload files={editFiles} onChange={setEditFiles} />
            <div className="action-row">
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={saveQuestionEdit}
              >
                Save
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setEditQuestion(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="question-detail-layout">
            {user ? (
              <VoteControl
                count={question.upvotes}
                userHasUpvoted={question.userHasUpvoted}
                onToggle={toggleQuestionUpvote}
              />
            ) : (
              <VoteControl count={question.upvotes} disabled />
            )}

            <div className="question-detail-main">
              <div className="question-detail-header">
                <StatusBadge status={status} />
                <span className="question-row-time">
                  Asked {formatRelativeTime(question.createdAt)}
                </span>
              </div>

              <h1>{question.title}</h1>
              <p className="card-body question-detail-desc">
                {question.description}
              </p>

              <AttachmentGallery attachments={question.attachments} />

              <p className="meta-text">
                Asked by{" "}
                <strong>{question.author?.name || "Anonymous"}</strong>
              </p>

              {question.categories?.length > 0 && (
                <div className="tag-list tag-list-spaced">
                  {question.categories.map((category) => (
                    <span key={category} className="tag">
                      {category}
                    </span>
                  ))}
                </div>
              )}

              <div className="question-detail-stats">
                <span className="stat-pill">
                  💬 {question.answerCount ?? answers.length}{" "}
                  {(question.answerCount ?? answers.length) === 1
                    ? "Answer"
                    : "Answers"}
                </span>
              </div>

              <div className="action-row question-owner-actions">
                {isOwner(question.author) && (
                  <>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => {
                        setEditQuestion(true);
                        setEditForm({
                          title: question.title,
                          description: question.description,
                        });
                      }}
                    >
                      Edit Question
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={deleteQuestion}
                    >
                      Delete Question
                    </button>
                  </>
                )}
                {user && !isOwner(question.author) && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => setReportQuestionOpen(true)}
                  >
                    Report Question
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </article>

      <section className="answers-panel">
        <div className="answers-panel-header">
          <h2>
            {answers.length}{" "}
            {answers.length === 1 ? "Answer" : "Answers"}
          </h2>
          <p className="field-hint">
            {user
              ? "Click ▲ to upvote. Click again to remove your upvote."
              : "Sign in to upvote and post answers."}
          </p>
        </div>

        {acceptedAnswer && (
          <div className="answers-group">
            <h3 className="answers-group-title">Accepted Answer</h3>
            <AnswerCard
              answer={acceptedAnswer}
              isAccepted
              user={user}
              isOwner={isOwner}
              editAnswerId={editAnswerId}
              editForm={editForm}
              setEditAnswerId={setEditAnswerId}
              setEditForm={setEditForm}
              onUpvote={toggleAnswerUpvote}
              onSaveEdit={saveAnswerEdit}
              onDelete={deleteAnswer}
              onReport={setReportAnswerId}
              renderAcceptAction={renderAcceptAction}
            />
          </div>
        )}

        {otherAnswers.length > 0 && (
          <div className="answers-group">
            <h3 className="answers-group-title">
              {acceptedAnswer ? "Other Answers" : "All Answers"}
            </h3>
            <div className="answer-thread-list">
              {otherAnswers.map((answer) => (
                <AnswerCard
                  key={answer._id}
                  answer={answer}
                  user={user}
                  isOwner={isOwner}
                  editAnswerId={editAnswerId}
                  editForm={editForm}
                  setEditAnswerId={setEditAnswerId}
                  setEditForm={setEditForm}
                  onUpvote={toggleAnswerUpvote}
                  onSaveEdit={saveAnswerEdit}
                  onDelete={deleteAnswer}
                  onReport={setReportAnswerId}
                  renderAcceptAction={renderAcceptAction}
                />
              ))}
            </div>
          </div>
        )}

        {reportAnswerId && (
          <ReportAnswerModal
            answerId={reportAnswerId}
            onClose={() => setReportAnswerId(null)}
          />
        )}

        {reportQuestionOpen && (
          <ReportAnswerModal
            contentType="question"
            questionId={id}
            onClose={() => setReportQuestionOpen(false)}
          />
        )}

        {answers.length === 0 && (
          <div className="empty-answers">
            <p>No answers yet.</p>
            <p className="field-hint">Be the first to help the community.</p>
          </div>
        )}

        {user && (
          <div className="compose-answer card">
            <h3 className="compose-answer-title">Your Answer</h3>
            <textarea
              placeholder="Share your knowledge — be clear and specific..."
              value={answerDraft}
              onChange={(e) => setAnswerDraft(e.target.value)}
              rows={5}
            />
            <button
              type="button"
              className="btn btn-primary"
              onClick={submitAnswer}
            >
              Post Answer
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

export default QuestionDetailPage;
