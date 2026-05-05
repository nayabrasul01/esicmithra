import { GoAlert } from "react-icons/go";
import { RxCrossCircled } from "react-icons/rx";
import { IoCheckmarkCircleOutline } from "react-icons/io5";

export default function AlertModal({
  show,
  message,
  onClose,
  showActions = false, // false = alert, true = confirm
  onAction, // callback for yes/no
  title = "Alert",
  type = "info", // warning, danger, info, success
}) {
  if (!show) return null;

  const handleYes = () => {
    onAction && onAction(true);
    onClose();
  };

  const handleNo = () => {
    onAction && onAction(false);
    onClose();
  };

  const handleOk = () => {
    onClose();
  };

  return (
    <>
      <div className="modal fade show d-block">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content shadow-sm">
            {/* Header */}
            <div className="modal-header d-flex align-items-center justify-content-center gap-2">
              {type === "warning" && <GoAlert color="#9D231E" size={25} />}
              {type === "danger" && <RxCrossCircled color="red" size={25} />}
              {type === "success" && (
                <IoCheckmarkCircleOutline color="green" size={25} />
              )}
              <h5 className="modal-title mb-0">{title}</h5>
              <button className="btn-close" onClick={onClose}></button>
            </div>

            {/* Body */}
            <div className="modal-body text-center py-4">
              <p className="mb-0">{message}</p>
            </div>

            {/* Footer */}
            <div className="modal-footer justify-content-center">
              {showActions ? (
                <>
                  <button
                    className="btn btn-sm btn-secondary px-4"
                    onClick={handleNo}
                  >
                    No
                  </button>

                  <button
                    className="btn btn-sm btn-esic px-4"
                    onClick={handleYes}
                  >
                    Yes
                  </button>
                </>
              ) : (
                <button className="btn btn-sm btn-esic px-4" onClick={handleOk}>
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
