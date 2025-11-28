import "../styles/dashboard.css";

const HomeComponent = () => {
  const userData = JSON.parse(localStorage.getItem("dear-user"));

  return (
    <div className="user-dashboard">
      <h2 style={{textAlign:"center", fontSize:"2rem"}} className="something">
        Welcome back, {userData.firstname}!
      </h2>
    </div>
  );
};

export default HomeComponent;