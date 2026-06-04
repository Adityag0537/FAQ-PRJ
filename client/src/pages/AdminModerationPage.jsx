import { useEffect, useState } from "react";
import API from "../services/api";
import PageHeader from "../components/PageHeader";
import Pagination from "../components/Pagination";
import LoadingState from "../components/LoadingState";
import { formatRelativeTime } from "../utils/formatRelativeTime";

function AdminModerationPage() {
  const [reports, setReports] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [faqConfig, setFaqConfig] = useState({ faqMinViews: 100, faqMinAgeDays: 7 });
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("PENDING");

  useEffect(() => {
    let cancelled = false;

    const loadDashboard = async () => {
      setLoading(true);

      try {
        const [reportsRes, analyticsRes, configRes] = await Promise.all([
          API.get(`/admin/reports?status=${statusFilter}&page=${page}&limit=8`),
          API.get("/admin/analytics"),
          API.get("/admin/faq-config"),
        ]);

        if (!cancelled) {
          setReports(reportsRes.data.data);
          setPages(reportsRes.data.pages);
          setAnalytics(analyticsRes.data.data);
          setFaqConfig(configRes.data.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [page, statusFilter]);

  const reloadDashboard = async () => {
    setLoading(true);

    try {
      const [reportsRes, analyticsRes, configRes] = await Promise.all([
        API.get(`/admin/reports?status=${statusFilter}&page=${page}&limit=8`),
        API.get("/admin/analytics"),
        API.get("/admin/faq-config"),
      ]);

      setReports(reportsRes.data.data);
      setPages(reportsRes.data.pages);
      setAnalytics(analyticsRes.data.data);
      setFaqConfig(configRes.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateReport = async (reportId, status) => {
    const reason = window.prompt("Moderation reason (optional):") || "";
    await API.patch(`/admin/reports/${reportId}`, { status, reason });
    reloadDashboard();
  };

  const removeAnswer = async (answerId) => {
    if (!window.confirm("Remove this answer?")) {
      return;
    }

    const reason = window.prompt("Reason for removal:") || "";
    await API.delete(`/admin/answers/${answerId}`, { data: { reason } });
    reloadDashboard();
  };

  const suspendUser = async (userId) => {
    const reason = window.prompt("Suspension reason:") || "";
    await API.patch(`/admin/users/${userId}/suspend`, { reason });
    reloadDashboard();
  };

  const saveFaqConfig = async () => {
    await API.patch("/admin/faq-config", faqConfig);
    alert("FAQ thresholds updated");
  };

  return (
    <div className="container page">
      <PageHeader
        eyebrow="Admin"
        title="Moderation Dashboard"
        description="Review reports, moderate content, and configure FAQ promotion rules."
      />

      {analytics && (
        <div className="admin-stats-grid">
          <div className="card stat-card">
            <span className="stat-label">Users</span>
            <strong>{analytics.totalUsers}</strong>
          </div>
          <div className="card stat-card">
            <span className="stat-label">Pending Reports</span>
            <strong>{analytics.pendingReports}</strong>
          </div>
          <div className="card stat-card">
            <span className="stat-label">Questions</span>
            <strong>{analytics.totalQuestions}</strong>
          </div>
          <div className="card stat-card">
            <span className="stat-label">Total SP</span>
            <strong>{analytics.totalSpAwarded}</strong>
          </div>
        </div>
      )}

      <section className="card admin-config-panel">
        <h3>FAQ Thresholds</h3>
        <div className="admin-config-fields">
          <label>
            Min Views
            <input
              type="number"
              min={0}
              value={faqConfig.faqMinViews}
              onChange={(e) =>
                setFaqConfig({ ...faqConfig, faqMinViews: Number(e.target.value) })
              }
            />
          </label>
          <label>
            Min Age (days)
            <input
              type="number"
              min={0}
              value={faqConfig.faqMinAgeDays}
              onChange={(e) =>
                setFaqConfig({ ...faqConfig, faqMinAgeDays: Number(e.target.value) })
              }
            />
          </label>
          <button type="button" className="btn btn-primary btn-sm" onClick={saveFaqConfig}>
            Save Thresholds
          </button>
        </div>
      </section>

      <div className="toolbar">
        <select
          value={statusFilter}
          onChange={(e) => {
            setPage(1);
            setStatusFilter(e.target.value);
          }}
        >
          <option value="PENDING">Pending</option>
          <option value="REVIEWED">Reviewed</option>
          <option value="DISMISSED">Dismissed</option>
          <option value="ACTION_TAKEN">Action Taken</option>
          <option value="ALL">All</option>
        </select>
      </div>

      {loading ? (
        <LoadingState message="Loading moderation queue..." />
      ) : reports.length === 0 ? (
        <div className="empty-state-card">
          <h3>No reports in this filter</h3>
        </div>
      ) : (
        <div className="admin-reports-list">
          {reports.map((item) => (
            <article key={item._id} className="card admin-report-card">
              <div className="card-top">
                <span className="badge">{item.status}</span>
                <span className="question-row-time">
                  {formatRelativeTime(item.createdAt)}
                </span>
              </div>

              <p>
                <strong>Reason:</strong> {item.reason}
              </p>
              {item.additionalComments && (
                <p className="field-hint">{item.additionalComments}</p>
              )}

              <div className="admin-report-context">
                <div>
                  <h4>Reported Answer</h4>
                  <p>{item.answer?.content || "Answer removed"}</p>
                  <p className="meta-text">
                    Author: {item.answer?.author?.name || "Unknown"}
                  </p>
                </div>
                <div>
                  <h4>Question</h4>
                  <p>{item.question?.title || "Unknown"}</p>
                  <p className="meta-text">
                    Reporter: {item.reporter?.name || "Unknown"}
                  </p>
                </div>
              </div>

              <div className="action-row">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => updateReport(item._id, "DISMISSED")}
                >
                  Dismiss
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => updateReport(item._id, "REVIEWED")}
                >
                  Mark Reviewed
                </button>
                {item.answer?._id && (
                  <>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => removeAnswer(item.answer._id)}
                    >
                      Remove Answer
                    </button>
                    {item.answer?.author?._id && (
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => suspendUser(item.answer.author._id)}
                      >
                        Suspend Author
                      </button>
                    )}
                  </>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      <Pagination page={page} pages={pages} onPageChange={setPage} />
    </div>
  );
}

export default AdminModerationPage;
