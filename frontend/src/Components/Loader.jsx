function Loader() {
  return (
    <div className="loader" role="status" aria-live="polite">
      <div className="loader__spinner" aria-hidden="true" />
      <p>Loading page...</p>
    </div>
  );
}

export default Loader;
