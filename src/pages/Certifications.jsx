import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { showToast } from '../util/toastUtil';  

export default function Certifications() {
  const location = useLocation();
  const user = location.state;
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      showToast("User data not found. Please login again.", "warning");
      navigate("/login");
    }
  }, [user, navigate]);

//   const [visitorCount, setVisitorCount] = useState(0);

//   useEffect(() => {
//     (async () => {
//       try {
//         if (authAPI && authAPI.visitorCount) {
//      const count = await authAPI.visitorCount();
//           setVisitorCount(count);
//         }
//       } catch (err) {
//         // console.error(err.message);
//         showToast("Something went wrong. Visitor count not loaded.", "danger");
//       }
//     })();
//   }, []);

return <p>Certificate</p>

}