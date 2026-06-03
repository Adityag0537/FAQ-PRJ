const STATUS_CONFIG = {
  open: { label: "OPEN", className: "status-open", icon: "🔴" },
  solved: { label: "SOLVED", className: "status-solved", icon: "🟢" },
  faq: { label: "FAQ", className: "status-faq", icon: "⭐" },
};

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.open;

  return (
    <span className={`status-badge ${config.className}`}>
      <span aria-hidden="true">{config.icon}</span>
      {config.label}
    </span>
  );
}

export default StatusBadge;
