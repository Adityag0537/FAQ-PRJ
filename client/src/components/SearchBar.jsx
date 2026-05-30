function SearchBar({
  value,
  onChange,
  onSubmit,
  placeholder,
  buttonLabel = "Search",
}) {
  return (
    <form onSubmit={onSubmit} className="search-bar">
      <div className="search-input-wrap">
        <span className="search-icon" aria-hidden="true">
          ⌕
        </span>
        <input
          type="search"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          aria-label="Search"
        />
      </div>
      <button type="submit" className="btn btn-primary">
        {buttonLabel}
      </button>
    </form>
  );
}

export default SearchBar;
