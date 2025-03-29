import {
  FiBell,
  FiGift,
  FiGitBranch,
  FiGitCommit,
  FiGitPullRequest,
  FiPlusCircle,
} from "react-icons/fi";
import "../styles/request.css";
import { useState } from "react";
import RequestComponent from "./RequestComponent";
import AddRequest from "./AddRequest";
import Notification from "./Notification";
export default function UserMakeRequest() {
  const [showComponent, setShowComponent] = useState(false);

  const handleRequest = () => {
    setShowComponent("request");
  };
  const handleNotification = () => {
    setShowComponent("notification");
  };
  const handleAdd = () => {
    setShowComponent("add");
  };
  return (
    <div className="make-request-container">
      <div className="make-request-container-header">
        <div className="make-request-container-header-content">
          <div>
            <FiPlusCircle onClick={handleAdd} style={{ margin: "0 10px" }} />
            <FiBell onClick={handleNotification} style={{ margin: "0 10px" }} />
          </div>
        </div>
      </div>
      <div className="make-request-container-header-content-container">
        {showComponent === "request" ? (
          <RequestComponent />
        ) : showComponent === "notification" ? (
          <Notification />
        ) : showComponent === "add" ? (
          <AddRequest />
        ) : (
          <Notification />
        )}
      </div>
    </div>
  );
}
