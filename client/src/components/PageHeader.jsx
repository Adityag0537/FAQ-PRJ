function PageHeader({ eyebrow, title, description, children }) {
  return (
    <section className="page-hero">
      <div className="page-hero-content">
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {description && <p className="page-hero-desc">{description}</p>}
      </div>
      {children && <div className="page-hero-actions">{children}</div>}
    </section>
  );
}

export default PageHeader;
