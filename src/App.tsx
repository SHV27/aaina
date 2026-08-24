import { Routes, Route, Navigate } from "react-router-dom";
import { Landing } from "./v2/ui/Landing";
import { Start } from "./v2/ui/Start";
import { Assessment } from "./v2/ui/Assessment";
import { Safety } from "./v2/ui/Safety";
import { Report } from "./v2/ui/Report";
import { Privacy } from "./v2/ui/Privacy";
import { Science } from "./v2/ui/Science";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/start" element={<Start />} />
      <Route path="/assessment" element={<Assessment />} />
      <Route path="/safety" element={<Safety />} />
      <Route path="/report" element={<Report />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/science" element={<Science />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
