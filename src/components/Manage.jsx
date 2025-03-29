import { useState } from "react";
import "../styles/manage.css";
import { FiUser } from "react-icons/fi";
import ManageUser from "../components/ManageUser";

export default function Manage() {
  const [showComponent, setShowComponent] = useState(false);

  return (
    <>
      <ManageUser />
    </>
  );
}
