import { GoAlert } from "react-icons/go";
import { RxCrossCircled } from "react-icons/rx";
import { IoCheckmarkCircleOutline } from "react-icons/io5";

export default function AlertModal({
  show,
  message,
  onClose,
  showActions = false,
  onAction,
  title = "Alert",
  type = "info",
}) {
  if (!show) return null;

  const renderIcon = () => {
    switch (type) {
      case "warning":
        return <GoAlert color="#9D231E" size={28} />;

      case "danger":
        return <RxCrossCircled color="red" size={28} />;

      case "success":
        return <IoCheckmarkCircleOutline color="green" size={28} />;

      default:
        return <GoAlert color="#0d6efd" size={28} />;
    }
  };

  return (
    <>
      <div className="modal fade show d-block">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content shadow-sm rounded-4 border-0">
            {/* Header */}
            <div className="modal-header d-flex justify-content-center position-relative">
              <div className="d-flex align-items-center gap-2">
                {renderIcon()}

                <h5 className="modal-title mb-0">{title}</h5>
              </div>

              <button
                className="btn-close position-absolute end-0 me-3"
                onClick={onClose}
              />
            </div>

            {/* Body */}
            <div className="modal-body text-center py-4 px-4">
              <p className="mb-0">{message}</p>
            </div>

            {/* Footer */}
            <div className="modal-footer justify-content-center pb-4">
              {showActions ? (
                <>
                  <button
                    className="btn btn-sm btn-secondary px-4"
                    onClick={() => onAction(false)}
                  >
                    No
                  </button>

                  <button
                    className="btn btn-sm btn-esic px-4"
                    onClick={() => onAction(true)}
                  >
                    Yes
                  </button>
                </>
              ) : (
                <button
                  className="btn btn-sm btn-esic px-4"
                  onClick={() => onAction(true)}
                >
                  OK
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Backdrop */}
      <div className="modal-backdrop fade show"></div>
    </>
  );
}
