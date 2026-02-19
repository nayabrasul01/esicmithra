/**
 * Bootstrap Toast Utility
 * 
 * Usage:
 * import { showToast } from './toastUtil';
 * 
 * showToast("Data saved successfully!", "success");
 * showToast("Failed to upload file!", "danger");
 * showToast("Warning: Check input fields.", "warning");
 * showToast("Information: Job is running.", "info");
 */
import * as bootstrap from "bootstrap";

export function showToast(message, type = "info") {
  // Ensure Bootstrap JS is loaded
  if (typeof bootstrap === "undefined") {
    console.error("Bootstrap JS not found. Please include Bootstrap bundle JS.");
    // Dynamically load Bootstrap JS if not found
    const script = document.createElement("script");
    script.src = "bootstrap/js/bootstrap.bundle.min.js";
    script.onload = () => {
      showToast(message, type); // Retry after loading
    };
    script.onerror = () => {
      console.error("Failed to load Bootstrap JS from CDN.");
    };
    document.head.appendChild(script);
    return;
  }

  // Create the toast container if it doesn’t exist
  let container = document.querySelector(".toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container position-fixed top-0 end-0 p-3 m-3";
    document.body.appendChild(container);
  }

  // Create the toast element
  const toast = document.createElement("div");
  toast.className = `toast align-items-center text-bg-${getBootstrapColor(
    type
  )} border-0 shadow-lg`;
  toast.setAttribute("role", "alert");
  toast.setAttribute("aria-live", "assertive");
  toast.setAttribute("aria-atomic", "true");

  toast.innerHTML = `
    <div class="d-flex align-items-center px-3 py-2">
      <div class="toast-body flex-grow-1 fw-medium">
        ${message}
      </div>
      <button 
        type="button" 
        class="btn-close btn-close-white ms-3" 
        data-bs-dismiss="toast" 
        aria-label="Close"
      ></button>
    </div>
  `;

  // Append to container
  container.appendChild(toast);

  // Initialize Bootstrap toast instance
  const bsToast = new bootstrap.Toast(toast, {
    delay: 4000, // Toast will auto-hide after 4s
    autohide: true,
  });

  // Show the toast
  bsToast.show();

  // Cleanup after toast hides
  toast.addEventListener("hidden.bs.toast", () => {
    toast.remove();
  });
}

/**
 * Helper to map message type to Bootstrap background color
 */
function getBootstrapColor(type) {
  switch (type.toLowerCase()) {
    case "success":
      return "success";
    case "danger":
    case "error":
      return "danger";
    case "warning":
      return "warning";
    case "info":
      return "bg-light";
    default:
      return "info";
  }
}
