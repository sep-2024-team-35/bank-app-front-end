import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import CardFormPage from "./pages/CardFormPage/CardFormPage.tsx";

function App() {
    return (
        <Router>
            <Routes>
                {/* Kada aplikacija krene, redirektuj sa "/" na "/card" */}
                <Route path="/" element={<Navigate to="/card" />} />
                <Route path="/card" element={<CardFormPage />} />
            </Routes>
        </Router>
    );
}

export default App;
