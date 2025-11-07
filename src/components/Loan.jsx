import { useEffect, useState } from "react";
import "../styles/loan.css";
import PostLoanTrack from "./PostLoanTrack";

const GET_URL = "https://circulation-system-server-1.onrender.com/api/get/loan";
const UPDATE_URL = "https://circulation-system-server-1.onrender.com/api/update/loan";

export default function Loan() {
  const [tableData, setTableData] = useState([]);
  const [showComponent, setShowComponent] = useState("table");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const toggleComponent = () => {
    setShowComponent((prev) => (prev === "table" ? "add_Data" : "table"));
  };

  useEffect(() => {
    const getData = async () => {
      try {
        const res = await fetch(GET_URL);
        if (!res.ok) throw new Error("Failed to fetch data");
        const data = await res.json();
        setTableData(data.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, []);

  const refreshData = async () => {
    setLoading(true);
    try {
      const res = await fetch(GET_URL);
      const data = await res.json();
      setTableData(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = async (loanId, field) => {
    setUpdatingId(loanId);
    try {
      const loanToUpdate = tableData.find((loan) => loan.id === loanId);
      const updatedValue = !loanToUpdate[field];

      const response = await fetch(UPDATE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          loanId,
          field,
          value: updatedValue,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update loan status");
      }

      // Update local state optimistically
      setTableData((prevData) =>
        prevData.map((loan) =>
          loan.id === loanId ? { ...loan, [field]: updatedValue } : loan
        )
      );
    } catch (err) {
      setError(err.message);
      // Revert local state if update fails
      refreshData();
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <div className="loading">Loading loan data...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="loan-container">
      <div className="loan-header">
        <h1 className="track-loan">Track Loans</h1>
        <button className="btn" onClick={toggleComponent}>
          {showComponent === "table" ? "Add New Loan +" : "View Loans"}
        </button>
      </div>

      {showComponent === "table" ? (
        <div className="loan-table-container">
          {tableData.length === 0 ? (
            <div className="no-data">No loan records found</div>
          ) : (
            <div className="table-responsive">
              <table className="loan-table">
                <thead>
                  <tr>
                    <th>S/N</th>
                    <th>User ID</th>
                    <th>Username</th>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Matric No</th>
                    <th>Book</th>
                    <th>Collected?</th>
                    <th>Date Collected</th>
                    <th>Return Status</th>
                    <th>Date Returned</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((loan, index) => (
                    <tr key={`${loan.id}-${index}`}>
                      <td>{index + 1}</td>
                      <td>{loan.id}</td>
                      <td>{loan.username}</td>
                      <td>{loan.firstname}</td>
                      <td>{loan.lastname}</td>
                      <td>{loan.registration_number}</td>
                      <td>{loan.book_name}</td>
                      <td>
                        <input
                          type="checkbox"
                          checked={loan.collected || false}
                          onChange={() =>
                            handleCheckboxChange(loan.id, "collected")
                          }
                          disabled={updatingId === loan.id}
                        />
                        {updatingId === loan.id && (
                          <span className="updating-spinner"></span>
                        )}
                      </td>
                      <td>
                        {loan.collection_date
                          ? new Date(loan.collection_date).toLocaleDateString()
                          : "Not collected"}
                      </td>
                      <td>
                        <input
                          type="checkbox"
                          checked={loan.returned || false}
                          onChange={() =>
                            handleCheckboxChange(loan.id, "returned")
                          }
                          disabled={updatingId === loan.id}
                        />
                        {updatingId === loan.id && (
                          <span className="updating-spinner"></span>
                        )}
                      </td>
                      <td>
                        {loan.returning_date
                          ? new Date(loan.returning_date).toLocaleDateString()
                          : "Not returned"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <PostLoanTrack
          onSuccess={refreshData}
          onCancel={() => setShowComponent("table")}
        />
      )}
    </div>
  );
}
