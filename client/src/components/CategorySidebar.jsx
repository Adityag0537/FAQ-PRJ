import { CATEGORIES } from "../constants/categories";

function CategorySidebar({ selected, onChange }) {
  const toggleCategory = (category) => {
    if (selected.includes(category)) {
      onChange(selected.filter((item) => item !== category));
    } else {
      onChange([...selected, category]);
    }
  };

  return (
    <aside className="category-sidebar">
      <div className="category-sidebar-header">
        <h3>Categories</h3>
        {selected.length > 0 && (
          <button
            type="button"
            className="sidebar-clear"
            onClick={() => onChange([])}
          >
            Clear
          </button>
        )}
      </div>

      <ul className="category-sidebar-list">
        {CATEGORIES.map((category) => {
          const checked = selected.includes(category);

          return (
            <li key={category}>
              <label className="category-sidebar-item">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleCategory(category)}
                />
                <span>{category}</span>
              </label>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

export default CategorySidebar;
