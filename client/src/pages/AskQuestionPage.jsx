import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import { CATEGORIES } from "../constants/categories";
import PageHeader from "../components/PageHeader";

function AskQuestionPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categories, setCategories] = useState([]);
  const [similarQuestions, setSimilarQuestions] = useState([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const query = `${title} ${description}`.trim();

    if (query.length < 3) {
      setSimilarQuestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await API.get(
          `/questions/similar?q=${encodeURIComponent(query)}`
        );
        setSimilarQuestions(res.data.data);
      } catch (err) {
        console.error(err);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [title, description]);

  const toggleCategory = (category) => {
    if (categories.includes(category)) {
      setCategories(categories.filter((item) => item !== category));
    } else {
      setCategories([...categories, category]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (categories.length === 0) {
      setError("Select at least one category.");
      return;
    }

    setSubmitting(true);

    try {
      await API.post("/questions", {
        title,
        description,
        categories,
      });

      navigate("/questions");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to submit question. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container page page-narrow">
      <PageHeader
        eyebrow="New Question"
        title="Ask the Community"
        description="Describe your question clearly so others can help. We'll suggest similar existing questions as you type."
      />

      <div className="form-card">
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="ask-form">
          <div className="field">
            <label className="field-label" htmlFor="title">
              Question Title
            </label>
            <input
              id="title"
              type="text"
              placeholder="Summarize your question in one line"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label className="field-label" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              placeholder="Provide context, what you've tried, and what you need..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              required
            />
          </div>

          <div className="field">
            <label className="field-label">Categories</label>
            <p className="field-hint">Select all topics that apply</p>
            <div className="category-pills">
              {CATEGORIES.map((category) => {
                const active = categories.includes(category);

                return (
                  <button
                    key={category}
                    type="button"
                    className={`category-pill ${active ? "active" : ""}`}
                    onClick={() => toggleCategory(category)}
                    aria-pressed={active}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          </div>

          {similarQuestions.length > 0 && (
            <div className="similar-panel">
              <h3>Similar Questions Found</h3>
              <p className="field-hint">
                Your question may already have an answer — open a discussion
                before posting:
              </p>
              <ul className="similar-list">
                {similarQuestions.map((question) => (
                  <li key={question._id} className="similar-item">
                    <div className="similar-item-content">
                      <strong>{question.title}</strong>
                      <p>{question.description}</p>
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
                    <Link
                      to={`/questions/${question._id}`}
                      className="btn btn-secondary btn-sm similar-open-btn"
                    >
                      Open Discussion →
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Question"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AskQuestionPage;
