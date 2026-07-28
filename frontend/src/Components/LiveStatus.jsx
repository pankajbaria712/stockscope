function LiveStatus({ updating }) {
  return updating ? <span className="live-status">Updating...</span> : null;
}

export default LiveStatus;
