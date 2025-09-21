import { useState } from "react";
import { useLocation } from "react-router-dom";
import "./CardFormPage.css";

const CardFormPage = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const paymentID = queryParams.get("paymentID");

    const [cardNumber, setCardNumber] = useState<string>("");
    const [ccv, setCcv] = useState<string>("");
    const [expirationDate, setExpirationDate] = useState<string>("");
    const [holder, setHolder] = useState<string>("");
    const [loading, setLoading] = useState(false);

    const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, "");
        if (value.length > 16) value = value.slice(0, 16);
        const formatted = value.replace(/(.{4})/g, "$1 ").trim();
        setCardNumber(formatted);
    };

    const handleExpirationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, "");

        if (value.length >= 1) {
            let month = parseInt(value.slice(0, 2));
            if (isNaN(month) || month === 0) month = 1;
            if (month > 12) month = 12;
            value = month.toString().padStart(2, "0") + value.slice(2);
        }

        if (value.length > 4) value = value.slice(0, 4);

        if (value.length > 2) {
            value = value.slice(0, 2) + "/" + value.slice(2);
        }

        setExpirationDate(value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!paymentID) {
            alert("Payment ID nije prosleđen!");
            return;
        }

        const cleanCardNumber = cardNumber.replace(/\s/g, "");

        if (cleanCardNumber.length !== 16 || ccv.length !== 3 || !/^\d{2}\/\d{2}$/.test(expirationDate) || !holder) {
            alert("Uneti podaci nisu validni!");
            return;
        }

        const payload = {
            primaryAccountNumber: cleanCardNumber,
            cardHolderName: holder,
            expirationDate: expirationDate,
            securityCode: ccv,
            paymentRequestId: paymentID
        };

        try {
            setLoading(true);
            try {
                const response = await fetch(`https://ebanksep-be.azurewebsites.net/api/payment/${paymentID}/pay`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });

                const data = await response.json();

                // Loguj sve što stigne iz backend-a
                console.log("[DEBUG] Backend response:", data);

                if (!response.ok) {
                    // Ako backend pošalje error, redirektuj na ErrorUrl (ako ga vraća)
                    if (data.redirectURL) {
                        const url = new URL(data.redirectURL);
                        url.searchParams.set("merchantOrderID", data.merchantOrderId);
                        console.log("[DEBUG] Redirecting to:", url.toString());
                        window.location.href = url.toString();
                        return;
                    }
                    throw new Error(data.error || "Nepoznata greška");
                }

                // Redirekcija na success ili failed URL koji backend vraća
                if (data.redirectURL) {
                    // Dodaj merchantOrderID u query param
                    const url = new URL(data.redirectURL);
                    url.searchParams.set("merchantOrderID", data.merchantOrderId);
                    console.log("[DEBUG] Redirecting to:", url.toString());
                    window.location.href = url.toString();
                } else {
                    // fallback
                    console.log("[DEBUG] Fallback alert, status:", data.status);
                    alert(`Status transakcije: ${data.status}`);
                }
            } catch (err) {
                console.error("[ERROR] Fetch error:", err);
                alert("Došlo je do greške pri povezivanju sa serverom.");
            } finally {
                setLoading(false);
            }

        } catch (err) {
            console.error(err);
            alert("Došlo je do greške pri povezivanju sa serverom.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card-form-container">
            <form className="card-form" onSubmit={handleSubmit}>
                <h2>Kreditna kartica</h2>
                <label>Broj kartice</label>
                <input
                    type="text"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    maxLength={19}
                    placeholder="1234 5678 9012 3456"
                />
                <label>CCV</label>
                <input
                    type="text"
                    value={ccv}
                    onChange={(e) => setCcv(e.target.value.replace(/\D/g, ""))}
                    maxLength={3}
                    placeholder="123"
                />
                <label>Datum isteka</label>
                <input
                    type="text"
                    value={expirationDate}
                    onChange={handleExpirationChange}
                    maxLength={5}
                    placeholder="MM/YY"
                />
                <label>Ime vlasnika</label>
                <input
                    type="text"
                    value={holder}
                    onChange={(e) => setHolder(e.target.value)}
                    placeholder="Ime i prezime"
                />
                <button type="submit" disabled={loading}>
                    {loading ? "Procesiranje..." : "Potvrdi"}
                </button>
            </form>
        </div>
    );
};

export default CardFormPage;
