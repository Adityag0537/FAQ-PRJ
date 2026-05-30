import { SORT_OPTIONS } from "../constants/categories";

function SortDropdown({ value, onChange }) {
  return (
    <div className="sort-dropdown">
      <label className="sort-label" htmlFor="sort-select">
        Sort By
      </label>
      <select
        id="sort-select"
        className="sort-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default SortDropdown;
