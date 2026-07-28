function LiveTimer({ timestamp }) {
  if (!timestamp) {
    return null;
  }

  const time = new Date(timestamp).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return <span className="live-timer">Last Updated: {time}</span>;
}

export default LiveTimer;
