import { useEffect, useState } from "react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import PageHeader from "../components/PageHeader";
import Pagination from "../components/Pagination";
import LoadingState from "../components/LoadingState";
import EmptyState from "../components/EmptyState";

function LeaderboardPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchLeaderboard = async () => {
      setLoading(true);

      try {
        const res = await API.get(`/leaderboard?page=${page}&limit=15`);
        if (!cancelled) {
          setEntries(res.data.data);
          setPages(res.data.pages);
        }
      } catch (error) {
        console.error(error);
        if (!cancelled) {
          setEntries([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchLeaderboard();

    return () => {
      cancelled = true;
    };
  }, [page]);

  return (
    <div className="container page">
      <PageHeader
        eyebrow="Community"
        title="Leaderboard"
        description="Top contributors ranked by Spurti Points (SP)."
      />

      {user && (
        <div className="leaderboard-self card">
          <span>Your badge: <strong>{user.badge || "Beginner"}</strong></span>
          <span>Your SP: <strong>{user.spPoints ?? 0}</strong></span>
        </div>
      )}

      {loading ? (
        <LoadingState message="Loading leaderboard..." />
      ) : entries.length === 0 ? (
        <EmptyState title="No rankings yet" description="Start answering to earn SP." />
      ) : (
        <div className="leaderboard-table card">
          <div className="leaderboard-header-row">
            <span>Rank</span>
            <span>Name</span>
            <span>Badge</span>
            <span>SP</span>
            <span>Accepted</span>
            <span>Upvotes</span>
          </div>
          {entries.map((entry) => (
            <div
              key={entry._id}
              className={`leaderboard-row ${entry.isCurrentUser ? "leaderboard-row-current" : ""}`}
            >
              <span>#{entry.rank}</span>
              <span>
                <strong>{entry.name}</strong>
                {entry.isCurrentUser && (
                  <span className="badge badge-primary">You</span>
                )}
              </span>
              <span className="badge">{entry.badge}</span>
              <span>{entry.spPoints}</span>
              <span>{entry.acceptedAnswersCount}</span>
              <span>{entry.answerUpvotesReceived}</span>
            </div>
          ))}
        </div>
      )}

      <Pagination page={page} pages={pages} onPageChange={setPage} />
    </div>
  );
}

export default LeaderboardPage;
