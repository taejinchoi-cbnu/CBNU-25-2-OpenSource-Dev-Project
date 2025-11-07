function LoadingSpinner() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        fontSize: "1.2em",
        color: "#333",
      }}
      role="status"
      aria-live="polite"
    >
      로딩중..
    </div>
  );
}

export default LoadingSpinner;
