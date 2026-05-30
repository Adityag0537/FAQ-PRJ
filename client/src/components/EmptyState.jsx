function EmptyState({ title, description }) {
  return (
    <div className="empty-state-card">
      <div className="empty-state-icon" aria-hidden="true">
        ?
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

export default EmptyState;
