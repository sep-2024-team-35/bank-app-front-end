import {useState} from "react";
import {useLocation} from "react-router-dom";
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

        const cleanCardNumber = cardNumber.replace(/\s/g, ""); // bez space

        if (cleanCardNumber.length !== 16) {
            alert("Broj kartice mora imati 16 cifara!");
            return;
        }
        if (ccv.length !== 3) {
            alert("CCV mora imati 3 cifre!");
            return;
        }
        if (!/^\d{2}\/\d{2}$/.test(expirationDate)) {
            alert("Datum isteka mora biti u formatu MM/YY!");
            return;
        }
        if (!holder) {
            alert("Ime vlasnika je obavezno!");
            return;
        }

        const payload = {
            PrimaryAccountNumber: cleanCardNumber,
            CardHolderName: holder,
            ExpirationDate: expirationDate,
            CVV: ccv
        };

        try {
            setLoading(true);
            const response = await fetch(`https://ebanksep-be.azurewebsites.net/api/payment/${paymentID}/pay`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                alert(`Greška prilikom plaćanja: ${data.error || JSON.stringify(data)}`);
                return;
            }

            alert(`Transakcija uspešno izvršena!
Transaction ID: ${data.transactionID}
Status: ${data.status}`);

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
                    maxLength={19} // 16 cifara + 3 space-a
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
                    maxLength={5} // MM/YY
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
