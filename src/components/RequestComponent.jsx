import { useEffect, useState } from "react";
const URL = "http://localhost:3000/api/makerequest/get";
export default function RequestComponent() {
  const [requestData, setRequestData] = useState([]);
  async function fetchRequests() {
    const res = await fetch(URL);
    const data = await res.json();
    setRequestData(data.message);
  }
  fetchRequests();
  return (
    // <div>
    //   <h3>Books Arrived</h3>
    //   <table>
    //     <thead>
    //       <th>S/N</th>
    //       <th>Book Name</th>
    //       <th>BookID</th>
    //       <th>U_ID</th>
    //       <th>Date</th>
    //     </thead>
    //     <tbody>
    //       <td>1</td>
    //       <td>Chronicles of Nania</td>
    //       <td>10001</td>
    //       <td>NR/21/CSC-BIO/440490</td>
    //       <td>Red</td>
    //       <td>27/03/2025</td>
    //     </tbody>
    //   </table>
    // </div>
    <div>something</div>
  );
}
