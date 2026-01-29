// import { useEffect } from "react";
// import { useNavigate, useSearchParams } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";

// const OAuthSuccess = () => {
//   const [params] = useSearchParams();
//   const navigate = useNavigate();
//   const { login } = useAuth();

//   useEffect(() => {
//     const token = params.get("token");

//     if (!token) {
//       navigate("/");
//       return;
//     }

//     login(token);
//     navigate("/ai");
//   }, []);

//   return <p>Signing you in...</p>;
// };

// export default OAuthSuccess;


import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const OAuthSuccess = () => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  useEffect(() => {
    const init = async () => {
      await refreshUser();
      navigate("/ai");
    };

    init();
  }, []);

  return <p>Signing you in...</p>;
};

export default OAuthSuccess;
