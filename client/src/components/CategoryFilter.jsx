import { useState } from "react";
import { CATEGORIES } from "../constants/categories";

function CategoryFilter({ selected, onChange }) {
  const [expanded, setExpanded] = useState(true);

  const toggleCategory = (category) => {
    if (selected.includes(category)) {
      onChange(selected.filter((item) => item !== category));
    } else {
      onChange([...selected, category]);
    }
  };

  const clearAll = () => onChange([]);

  return (
    <section className="filter-panel">
      <div className="filter-panel-header">
        <div>
          <h3>Categories</h3>
          <p className="filter-panel-desc">
            {selected.length
              ? `${selected.length} selected`
              : "Filter by one or more topics"}
          </p>
        </div>
        <div className="filter-panel-actions">
          {selected.length > 0 && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={clearAll}>
              Clear
            </button>
          )}
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
          >
            {expanded ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="category-pills">
          {CATEGORIES.map((category) => {
            const active = selected.includes(category);

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
      )}
    </section>
  );
}

export default CategoryFilter;
