import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import { buildQueryParams } from "../constants/categories";
import PageHeader from "../components/PageHeader";
import SearchBar from "../components/SearchBar";
import CategoryFilter from "../components/CategoryFilter";
import QuestionListItem from "../components/QuestionListItem";
import Pagination from "../components/Pagination";
import LoadingState from "../components/LoadingState";
import EmptyState from "../components/EmptyState";
import { formatRelativeTime } from "../utils/formatRelativeTime";

function FAQPage() {
  const [faqs, setFaqs] = useState([]);
  const [recentQuestions, setRecentQuestions] = useState([]);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [recentLoading, setRecentLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [faqThreshold, setFaqThreshold] = useState(5);

  useEffect(() => {
    API.get("/config")
      .then((res) => setFaqThreshold(res.data.data.faqUpvoteThreshold))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchFaqs();
  }, [search, selectedCategories, page]);

  useEffect(() => {
    fetchRecentQuestions();
  }, []);

  const fetchFaqs = async () => {
    setLoading(true);

    try {
      const query = buildQueryParams({
        search,
        categories: selectedCategories,
        page,
        limit: 8,
      });

      const res = await API.get(`/faqs?${query}`);

      setFaqs(res.data.data);
      setPages(res.data.pages);
      setTotal(res.data.total);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentQuestions = async () => {
    setRecentLoading(true);

    try {
      const query = buildQueryParams({
        page: 1,
        limit: 5,
        sort: "newest",
      });

      const res = await API.get(`/questions?${query}`);
      setRecentQuestions(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setRecentLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const handleCategoryChange = (categories) => {
    setPage(1);
    setSelectedCategories(categories);
  };

  return (
    <div className="container page">
      <PageHeader
        eyebrow="Knowledge Base"
        title="Frequently Asked Questions"
        description="Browse community-promoted answers for Samagama and Vicharanashala."
      />

      <div className="toolbar">
        <SearchBar
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onSubmit={handleSearch}
          placeholder="Search by title, description, or answer..."
        />
        <CategoryFilter
          selected={selectedCategories}
          onChange={handleCategoryChange}
        />
      </div>

      <div className="results-bar">
        <span className="results-meta">
          {loading ? "Loading..." : `${total} FAQ${total === 1 ? "" : "s"} found`}
        </span>
        {(search || selectedCategories.length > 0) && !loading && (
          <span className="results-filter-note">Filtered results</span>
        )}
      </div>

      {loading ? (
        <LoadingState message="Loading FAQs..." />
      ) : faqs.length === 0 ? (
        <EmptyState
          title="No FAQs found"
          description="Try adjusting your search or clearing category filters."
        />
      ) : (
        <div className="faq-list">
          {faqs.map((faq) => (
            <article key={faq._id} className="card faq-card">
              <div className="card-top">
                <span className="badge badge-primary">FAQ</span>
                <span className="question-row-time">
                  {formatRelativeTime(faq.createdAt)}
                </span>
              </div>

              <h3>{faq.title}</h3>
              <p className="card-body">{faq.description}</p>

              <div className="faq-card-meta">
                <span className="stat-pill">👍 {faq.upvotes} Upvotes</span>
              </div>

              {faq.categories?.length > 0 && (
                <div className="tag-list tag-list-spaced">
                  {faq.categories.map((category) => (
                    <span key={category} className="tag">
                      {category}
                    </span>
                  ))}
                </div>
              )}

              <div className="card-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() =>
                    setExpandedId(expandedId === faq._id ? null : faq._id)
                  }
                  aria-expanded={expandedId === faq._id}
                >
                  {expandedId === faq._id ? "Hide Answer" : "View Accepted Answer"}
                </button>
              </div>

              {expandedId === faq._id && faq.acceptedAnswer && (
                <div className="answer accepted-answer">
                  <div className="answer-header">
                    <span className="answer-badge">Accepted</span>
                    <strong>{faq.acceptedAnswer.author?.name || "Community"}</strong>
                  </div>
                  <p>{faq.acceptedAnswer.content}</p>
                  <span className="answer-time">
                    Answered {formatRelativeTime(faq.acceptedAnswer.createdAt)}
                  </span>
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      <Pagination page={page} pages={pages} onPageChange={setPage} />

      
    </div>
  );
}

export default FAQPage;
