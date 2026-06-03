import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import { buildQueryParams } from "../constants/categories";
import PageHeader from "../components/PageHeader";
import SearchBar from "../components/SearchBar";
import CategoryFilter from "../components/CategoryFilter";
import Pagination from "../components/Pagination";
import LoadingState from "../components/LoadingState";
import EmptyState from "../components/EmptyState";
import { formatRelativeTime } from "../utils/formatRelativeTime";

function FAQPage() {
  const [faqs, setFaqs] = useState([]);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [faqConfig, setFaqConfig] = useState({
    faqMinViews: 100,
    faqMinAgeDays: 7,
  });

  useEffect(() => {
    API.get("/config")
      .then((res) => {
        setFaqConfig({
          faqMinViews: res.data.data.faqMinViews ?? 100,
          faqMinAgeDays: res.data.data.faqMinAgeDays ?? 7,
        });
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;

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

        if (!cancelled) {
          setFaqs(res.data.data);
          setPages(res.data.pages);
          setTotal(res.data.total);
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchFaqs();

    return () => {
      cancelled = true;
    };
  }, [search, selectedCategories, page]);

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
                <span className="stat-pill">👁 {faq.views ?? 0} Views</span>
                <span className="stat-pill">👍 {faq.upvotes} Upvotes</span>
                {(faq.attachmentCount ?? 0) > 0 && (
                  <span className="stat-pill">
                    📷 {faq.attachmentCount} Attachment
                    {faq.attachmentCount === 1 ? "" : "s"}
                  </span>
                )}
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
                <Link
                  to={`/questions/${faq._id}`}
                  className="btn btn-secondary"
                >
                  View Details
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}

      <Pagination page={page} pages={pages} onPageChange={setPage} />
    </div>
  );
}

export default FAQPage;
