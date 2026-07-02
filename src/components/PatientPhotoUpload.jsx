import { useRef, useEffect } from "react";
import { showToast } from "../util/toastUtil";
import { MdUpload } from "react-icons/md";
import { MdCancel } from "react-icons/md";
import { FaUser } from "react-icons/fa6";

import { useAlert } from "./alert/AlertContext";

const PatientPhotoUpload = ({ photo, onPhotoChange }) => {
  const fileRef = useRef();
  const { alert, confirm } = useAlert();

  // Convert external image URL → Base64
  const convertUrlToBase64 = async (url) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();

      const reader = new FileReader();

      reader.onloadend = () => {
        onPhotoChange(reader.result);
      };

      reader.readAsDataURL(blob);
    } catch (err) {
      // showToast(`Image conversion failed: ${err}`, "danger");
      showToast(`Image conversion failed: ${err}`, "danger");
      onPhotoChange(null);
    }
  };

  useEffect(() => {
    if (!photo) return;

    // if already base64 do nothing
    if (photo.startsWith("data:image")) return;

    // otherwise convert url → base64
    convertUrlToBase64(photo);
  }, [photo]);

  const handlePhotoUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      // showToast("Image must be less than 2MB", "warning");
      alert("Image must be less than 2MB", "warning");
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        const targetRatio = 7 / 9;

        let cropWidth = img.width;
        let cropHeight = img.height;

        if (img.width / img.height > targetRatio) {
          cropWidth = img.height * targetRatio;
        } else {
          cropHeight = img.width / targetRatio;
        }

        const startX = (img.width - cropWidth) / 2;
        const startY = (img.height - cropHeight) / 2;

        canvas.width = 280;
        canvas.height = 360;

        ctx.drawImage(
          img,
          startX,
          startY,
          cropWidth,
          cropHeight,
          0,
          0,
          canvas.width,
          canvas.height,
        );

        const base64 = canvas.toDataURL("image/jpeg", 0.9);

        onPhotoChange(base64);
      };

      img.src = e.target.result;
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="text-center">
      {photo ? (
        <img
          src={photo}
          alt="Beneficiary"
          className="img-thumbnail shadow-sm"
          style={{
            width: "130px",
            height: "160px",
            objectFit: "cover",
          }}
        />
      ) : (
        <div
          className="border rounded d-flex flex-column align-items-center justify-content-center"
          style={{
            width: "130px",
            height: "160px",
            margin: "auto",
            background: "#f8f9fa",
          }}
        >
          {/* <i
            className="bi bi-person-fill"
            style={{ fontSize: "55px", color: "#c0c0c0" }}
          ></i> */}
          <FaUser />

          <small className="text-muted mt-1">Upload Photo</small>
        </div>
      )}

      <div className="mt-2">
        <button
          className="btn btn-sm btn-outline btn-esic"
          onClick={() => fileRef.current.click()}
        >
          <MdUpload /> {photo ? "Change Photo" : "Upload Photo"}
        </button>

        {/* {photo && (
          <button
            className="btn btn-sm btn-outline btn-danger ms-2"
            onClick={() => {
              onPhotoChange(null);
              fileRef.current.value = "";
            }}
          >
            <MdCancel /> Remove
          </button>
        )} */}

        <input
          type="file"
          accept="image/*"
          ref={fileRef}
          hidden
          onChange={handlePhotoUpload}
        />
      </div>
    </div>
  );
};

export default PatientPhotoUpload;
