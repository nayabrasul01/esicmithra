

const LoadingSpinner = ({ message }) => {
  return (
    <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <span className="ms-2">{message}</span>
    </div>
  );
};

export default LoadingSpinner;