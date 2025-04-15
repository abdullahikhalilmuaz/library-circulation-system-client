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
  return (
    <div className="make-request-container">
      <div className="make-request-container-header-content-container">
        <AddRequest />
      </div>
    </div>
  );
}
