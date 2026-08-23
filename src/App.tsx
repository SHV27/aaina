import { Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home";
import { Jhalak } from "./pages/Jhalak";
import { AssessmentIntro } from "./pages/AssessmentIntro";
import { Assessment } from "./pages/Assessment";
import { Report } from "./pages/Report";
import { Saath } from "./pages/Saath";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/jhalak" element={<Jhalak />} />
      <Route path="/aaina" element={<AssessmentIntro />} />
      <Route path="/aaina/sawaal" element={<Assessment />} />
      <Route path="/report" element={<Report />} />
      <Route path="/saath" element={<Saath />} />
    </Routes>
  );
}
