import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import { buildQueryParams } from "../constants/categories";
import SearchBar from "../components/SearchBar";
import CategorySidebar from "../components/CategorySidebar";
import SortDropdown from "../components/SortDropdown";
import QuestionListItem from "../components/QuestionListItem";
import Pagination from "../components/Pagination";
import LoadingState from "../components/LoadingState";
import EmptyState from "../components/EmptyState";

function QuestionsPage() {
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [faqConfig, setFaqConfig] = useState({
    faqMinViews: 100,
    faqMinAgeDays: 7,
  });
  const [filtersOpen, setFiltersOpen] = useState(false);

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
    fetchQuestions();
  }, [search, selectedCategories, sort, page]);

  const fetchQuestions = async () => {
    setLoading(true);

    try {
      const query = buildQueryParams({
        search,
        categories: selectedCategories,
        page,
        limit: 10,
        sort,
      });

      const res = await API.get(`/questions?${query}`);

      setQuestions(res.data.data);
      setPages(res.data.pages);
      setTotal(res.data.total);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
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

  const handleSortChange = (nextSort) => {
    setPage(1);
    setSort(nextSort);
  };

  return (
    <div className="container page community-page">
      <header className="community-header">
        <div>
          <span className="eyebrow">Community</span>
          <h1>Community Questions</h1>
          <p className="community-header-desc">
            Find questions, see what&apos;s solved, and join the discussion.
          </p>
        </div>
        {user ? (
          <Link to="/ask" className="btn btn-primary">
            Ask Question
          </Link>
        ) : (
          <Link to="/login" className="btn btn-secondary">
            Login to Ask
          </Link>
        )}
      </header>

      <div className="community-toolbar">
        <SearchBar
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onSubmit={handleSearch}
          placeholder="Search questions..."
          buttonLabel="Search"
        />
        <SortDropdown value={sort} onChange={handleSortChange} />
        <button
          type="button"
          className="btn btn-secondary filters-toggle"
          onClick={() => setFiltersOpen(!filtersOpen)}
          aria-expanded={filtersOpen}
        >
          Filters {selectedCategories.length > 0 && `(${selectedCategories.length})`}
        </button>
      </div>

      <div className="community-layout">
        <div className={`community-sidebar-wrap ${filtersOpen ? "open" : ""}`}>
          <CategorySidebar
            selected={selectedCategories}
            onChange={handleCategoryChange}
          />
        </div>

        <div className="community-main">
          <div className="results-bar">
            <span className="results-meta">
              {loading
                ? "Loading..."
                : `${total} question${total === 1 ? "" : "s"}`}
            </span>
          </div>

          {!user && (
            <div className="info-banner">
              <p>
                Browse freely. <Link to="/login">Sign in</Link> to ask, answer,
                and upvote.
              </p>
            </div>
          )}

          {loading ? (
            <LoadingState message="Loading questions..." />
          ) : questions.length === 0 ? (
            <EmptyState
              title="No questions found"
              description="Try different search terms, sorting, or clear your category filters."
            />
          ) : (
            <div className="question-rows">
              {questions.map((question) => (
                <QuestionListItem
                  key={question._id}
                  question={question}
                  faqConfig={faqConfig}
                />
              ))}
            </div>
          )}

          <Pagination page={page} pages={pages} onPageChange={setPage} />
        </div>
      </div>
    </div>
  );
}

export default QuestionsPage;
