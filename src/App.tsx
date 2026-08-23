import { Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home";
import { Skeleton } from "./pages/Skeleton";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/jhalak" element={<Skeleton />} />
    </Routes>
  );
}
