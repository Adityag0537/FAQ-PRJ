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
  const [reportType, setReportType] = useState("answers");
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [showSuspendedUsers, setShowSuspendedUsers] = useState(false);
  const [suspendedSearch, setSuspendedSearch] = useState("");
  const [suspendedUsers, setSuspendedUsers] = useState([]);
  const [suspendedUsersLoading, setSuspendedUsersLoading] = useState(false);
  const reportEndpoint =
    reportType === "questions" ? "/admin/question-reports" : "/admin/reports";

  useEffect(() => {
    let cancelled = false;

    const loadDashboard = async () => {
      setLoading(true);

      try {
        const [reportsRes, analyticsRes, configRes] = await Promise.all([
          API.get(`${reportEndpoint}?status=${statusFilter}&page=${page}&limit=8`),
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
  }, [page, statusFilter, reportEndpoint]);

  const reloadDashboard = async () => {
    setLoading(true);

    try {
      const [reportsRes, analyticsRes, configRes] = await Promise.all([
        API.get(`${reportEndpoint}?status=${statusFilter}&page=${page}&limit=8`),
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

  const loadSuspendedUsers = async (search = suspendedSearch) => {
    setSuspendedUsersLoading(true);

    try {
      const params = new URLSearchParams({
        isSuspended: "true",
        page: "1",
        limit: "25",
      });

      if (search.trim()) {
        params.set("search", search.trim());
      }

      const res = await API.get(`/admin/users?${params.toString()}`);
      setSuspendedUsers(res.data.data);
    } catch (error) {
      console.error("[v0] loadSuspendedUsers error:", error);
      alert(error.response?.data?.message || "Failed to load suspended users");
    } finally {
      setSuspendedUsersLoading(false);
    }
  };

  const toggleSuspendedUsers = () => {
    const next = !showSuspendedUsers;
    setShowSuspendedUsers(next);

    if (next) {
      loadSuspendedUsers();
    }
  };

  const searchSuspendedUsers = (event) => {
    event.preventDefault();
    loadSuspendedUsers();
  };

  const updateReport = async (reportId, status) => {
    const reason = window.prompt("Moderation reason (optional):");

    if (reason === null) {
      return;
    }

    try {
      await API.patch(`${reportEndpoint}/${reportId}`, { status, reason });
      reloadDashboard();
    } catch (error) {
      console.error("[v0] updateReport error:", error);
      alert(error.response?.data?.message || "Failed to update report");
    }
  };

  const removeQuestion = async (questionId) => {
    if (!window.confirm("Delete this question?")) {
      return;
    }

    const reason = window.prompt("Reason for deletion:");

    if (reason === null) {
      return;
    }

    try {
      await API.delete(`/admin/questions/${questionId}`, { data: { reason } });
      reloadDashboard();
    } catch (error) {
      console.error("[v0] removeQuestion error:", error);
      alert(error.response?.data?.message || "Failed to delete question");
    }
  };

  const removeAnswer = async (answerId) => {
    if (!window.confirm("Remove this answer?")) {
      return;
    }

    const reason = window.prompt("Reason for removal:");

    if (reason === null) {
      return;
    }
    try {
      await API.delete(`/admin/answers/${answerId}`, { data: { reason } });
      reloadDashboard();
    } catch (error) {
      console.error("[v0] removeAnswer error:", error);
      alert(error.response?.data?.message || "Failed to remove answer");
    }
  };

  const suspendUser = async (userId) => {
    const reason = window.prompt("Suspension reason:");

    if (reason === null) {
      return;
    }
    try {
      await API.patch(`/admin/users/${userId}/suspend`, { reason });
      reloadDashboard();
    } catch (error) {
      console.error("[v0] suspendUser error:", error);
      alert(error.response?.data?.message || "Failed to suspend user");
    }
  };

  const unsuspendUser = async (userId) => {
    const reason = window.prompt("Unsuspension reason (optional):");

    if (reason === null) {
      return;
    }

    try {
      await API.patch(`/admin/users/${userId}/reactivate`, { reason });
      await reloadDashboard();

      if (showSuspendedUsers) {
        await loadSuspendedUsers();
      }
    } catch (error) {
      console.error("[v0] unsuspendUser error:", error);
      alert(error.response?.data?.message || "Failed to unsuspend user");
    }
  };

  const saveFaqConfig = async () => {
    try {
      await API.patch("/admin/faq-config", faqConfig);
      alert("FAQ thresholds updated");
    } catch (error) {
      console.error("[v0] saveFaqConfig error:", error);
      alert(error.response?.data?.message || "Failed to update FAQ config");
    }
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

      <section className="card admin-users-panel">
        <div className="admin-users-header">
          <h3>Suspended Users</h3>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={toggleSuspendedUsers}
          >
            {showSuspendedUsers ? "Hide Suspended Users" : "Show Suspended Users"}
          </button>
        </div>

        {showSuspendedUsers && (
          <>
            <form className="admin-user-search" onSubmit={searchSuspendedUsers}>
              <input
                type="search"
                placeholder="Search by name or email"
                value={suspendedSearch}
                onChange={(event) => setSuspendedSearch(event.target.value)}
              />
              <button type="submit" className="btn btn-primary btn-sm">
                Search
              </button>
              {suspendedSearch && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    setSuspendedSearch("");
                    loadSuspendedUsers("");
                  }}
                >
                  Clear
                </button>
              )}
            </form>

            {suspendedUsersLoading ? (
              <LoadingState message="Loading suspended users..." />
            ) : suspendedUsers.length === 0 ? (
              <div className="empty-state-card">
                <h3>No suspended users found</h3>
              </div>
            ) : (
              <div className="admin-user-list">
                {suspendedUsers.map((user) => (
                  <div key={user._id} className="admin-user-row">
                    <div>
                      <strong>{user.name}</strong>
                      <p className="meta-text">{user.email}</p>
                    </div>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => unsuspendUser(user._id)}
                    >
                      Unsuspend
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </section>

      <div className="toolbar">
        <select
          value={reportType}
          onChange={(e) => {
            setPage(1);
            setReportType(e.target.value);
          }}
        >
          <option value="answers">Answer Reports</option>
          <option value="questions">Question Reports</option>
        </select>
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
          {reports.map((item) => {
            const reportedAuthor =
              reportType === "questions"
                ? item.question?.author
                : item.answer?.author;

            return (
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
                  <h4>
                    {reportType === "questions"
                      ? "Reported Question"
                      : "Reported Answer"}
                  </h4>
                  {reportType === "questions" && item.question ? (
                    <>
                      <p>
                        <strong>{item.question.title}</strong>
                      </p>
                      <p>{item.question.description}</p>
                      <p className="meta-text">
                        Author: {item.question.author?.name || "Unknown"}
                      </p>
                    </>
                  ) : reportType === "questions" ? (
                    <div className="info-banner">
                      This question is no longer available.
                    </div>
                  ) : item.answer ? (
                    <>
                      <p>{item.answer.content}</p>
                      <p className="meta-text">
                        Author: {item.answer.author?.name || "Unknown"}
                      </p>
                      {item.answer.isRemoved && (
                        <div className="info-banner">
                          <strong>Removed answer</strong>
                          {item.answer.removedReason && (
                            <p>Reason: {item.answer.removedReason}</p>
                          )}
                          {item.answer.removedAt && (
                            <p>
                              Removed: {formatRelativeTime(item.answer.removedAt)}
                            </p>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="info-banner">
                      This answer is no longer available.
                    </div>
                  )}
                </div>
                <div>
                  <h4>Question</h4>
                  <p>
                    {item.question?.title ||
                      (reportType === "questions"
                        ? "Reported question no longer available"
                        : "Question no longer available")}
                  </p>
                  <p className="meta-text">
                    Reporter: {item.reporter?.name || "Unknown"}
                  </p>
                </div>
              </div>

              {item.status === "PENDING" ? (
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

                  {reportType === "questions" && item.question?._id && (
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => removeQuestion(item.question._id)}
                    >
                      Delete Question
                    </button>
                  )}

                  {reportType === "answers" &&
                    item.answer?._id &&
                    !item.answer.isRemoved && (
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => removeAnswer(item.answer._id)}
                      >
                        Remove Answer
                      </button>
                    )}

                  {reportedAuthor?._id &&
                    (reportedAuthor.isSuspended ? (
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => unsuspendUser(reportedAuthor._id)}
                      >
                        Unsuspend Author
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => suspendUser(reportedAuthor._id)}
                      >
                        Suspend Author
                      </button>
                    ))}
                </div>
              ) : (
                <>
                  {reportedAuthor?.isSuspended && (
                    <div className="action-row">
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => unsuspendUser(reportedAuthor._id)}
                      >
                        Unsuspend Author
                      </button>
                    </div>
                  )}
                  <div className="info-banner">
                    {item.status === "DISMISSED" &&
                      "Report dismissed. No moderation action was required."}

                    {item.status === "REVIEWED" &&
                      "Report reviewed by a moderator."}

                    {item.status === "ACTION_TAKEN" &&
                      "Moderation action has been completed."}
                  </div>
                </>
              )}
            </article>
            );
          })}
        </div>
      )}

      <Pagination page={page} pages={pages} onPageChange={setPage} />
    </div>
  );
}

export default AdminModerationPage;
