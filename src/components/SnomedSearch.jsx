import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { fetchSnomed, fetchICDCode } from "../services/referralService";
import { showToast } from "../util/toastUtil";
import { useAlert } from "./../components/alert/AlertContext";

const SnomedSearch = ({ onSelect, initialValue }) => {

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const { alert, confirm } = useAlert();

  const debounceRef = useRef(null);
  const skipSearchRef = useRef(false);
  // const isInitializedRef = useRef(false);

  useEffect(() => {
    if (initialValue && initialValue !== query) {
      skipSearchRef.current = true;
      setQuery(initialValue);
      // isInitializedRef.current = true;
    }
  }, [initialValue]);

  useEffect(() => {

    if (skipSearchRef.current) {
      skipSearchRef.current = false;
      return;
    }

    // if (!isInitializedRef.current) {
    //   return;
    // }

    if (query.length < 3) {
      setResults([]);
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      searchSnomed(query);
    }, 500);

  }, [query]);

  const searchSnomed = async (keyword) => {
    try {
      setLoading(true);
      const res = await fetchSnomed(keyword)
  
      const data = res.data || [];
      setResults(data.slice(0, 5));
      setShowDropdown(true);
    } catch (err) {
      showToast(`SNOMED search error : ${err}`, "danger");
    } finally {
      setLoading(false);
    }
  };

  const fetchICD = async (conceptId, term) => {
    try {
      const res = await fetchICDCode(conceptId)

      const icdCode =
        res.data?.mapGroup?.[0]?.mappedICDCode || "";

      if(icdCode === "")
        // showToast("No ICD code found for the given SNOMED CT search. Please try with other terms.", "warning");
      await alert(
        "No ICD code found for the given SNOMED CT search. Please try with other terms.",
        "warning",
      );

      onSelect({
        snomedDiagnosis: term,
        icdCode: icdCode,
        conceptId
      });

      skipSearchRef.current = true;   // prevent next search after query is set
      setQuery(term);
      setResults([]);
      setShowDropdown(false);
    } catch (err) {
      showToast(`ICD code fetch error : ${err}`, "danger");
    }
  };

  return (

    <div className="position-relative">

      <input
        type="text"
        className="form-control"
        placeholder={"Search SNOMED CT diagnosis..."}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {loading && (
        <div className="small text-muted mt-2">
          <div className="spinner-border spinner-border-sm" role="status"></div> Searching...
        </div>
      )}

      {showDropdown && results.length > 0 && (

        <ul
          className="list-group position-absolute w-100 shadow"
          style={{ zIndex: 999 }}
        >

          {results.map((item) => (

            <li
              key={item.id}
              className="list-group-item list-group-item-action"
              style={{ cursor: "pointer" }}
              onClick={() =>
                fetchICD(item.conceptId, item.term)
              }
            >

              <div className="fw-semibold">
                {item.term}
              </div>

              <small className="text-muted">
                Concept ID: {item.conceptId}
              </small>

            </li>

          ))}

        </ul>

      )}

    </div>
  );
};

export default SnomedSearch;