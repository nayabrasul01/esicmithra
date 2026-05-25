import { createContext, useContext, useState, useCallback } from "react";

import AlertModal from "./AlertModal";

const AlertContext = createContext();

export function AlertProvider({ children }) {
  const [modalState, setModalState] = useState({
    show: false,
    title: "Alert",
    message: "",
    type: "info",
    showActions: false,
    resolve: null,
  });

  // Alert popup
  const alert = useCallback((message, type = "info", title = "Alert") => {
    return new Promise((resolve) => {
      setModalState({
        show: true,
        message,
        type,
        title,
        showActions: false,
        resolve,
      });
    });
  }, []);

  // Confirm popup
  const confirm = useCallback(
    (message, type = "warning", title = "Confirmation") => {
      return new Promise((resolve) => {
        setModalState({
          show: true,
          message,
          type,
          title,
          showActions: true,
          resolve,
        });
      });
    },
    [],
  );

  const closeModal = () => {
    setModalState((prev) => ({
      ...prev,
      show: false,
    }));
  };

  const handleAction = (result) => {
    modalState.resolve?.(result);
    closeModal();
  };

  return (
    <AlertContext.Provider value={{ alert, confirm }}>
      {children}

      <AlertModal
        show={modalState.show}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        showActions={modalState.showActions}
        onClose={() => handleAction(false)}
        onAction={handleAction}
      />
    </AlertContext.Provider>
  );
}

export function useAlert() {
  return useContext(AlertContext);
}
