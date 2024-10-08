import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import UserSelect from "./pages/UserSelect";
import Registration from "./pages/Registration";
import Success from "./pages/Success";
import Login from "./pages/Login";
import FinishSignIn from "./pages/FinishSignIn";
import CheckEmail from "./pages/CheckEmail";


function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/user-select" element={<UserSelect />} />
          <Route path="/registration" element={<Registration />} />
          <Route path="/login" element={<Login />} />
          <Route path="/finish-sign-in" element={<FinishSignIn />} />
          <Route path="/check-email" element={<CheckEmail />} />
          <Route path="/success" element={<Success />} />
          
          <Route path="*" element={<NotFound />} /> {/* 404 route */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
