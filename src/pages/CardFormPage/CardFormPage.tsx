import { useState } from "react";
import "./CardFormPage.css";

const CardFormPage = () => {
    const [cardNumber, setCardNumber] = useState<string>("");
    const [ccv, setCcv] = useState<string>("");
    const [expirationDate, setExpirationDate] = useState<string>("");
    const [holder, setHolder] = useState<string>("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (cardNumber.length !== 16) {
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

        alert(`Uspešno uneti podaci:
    Kartica: ${cardNumber}
    CCV: ${ccv}
    Datum isteka: ${expirationDate}
    Vlasnik: ${holder}`);
    };

    return (
        <div className="card-form-container">
            <form className="card-form" onSubmit={handleSubmit}>
                <h2>Kreditna kartica</h2>

                <label>Broj kartice</label>
                <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ""))}
                    maxLength={16}
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
                    onChange={(e) => setExpirationDate(e.target.value)}
                    placeholder="MM/YY"
                />

                <label>Ime vlasnika</label>
                <input
                    type="text"
                    value={holder}
                    onChange={(e) => setHolder(e.target.value)}
                    placeholder="Ime i prezime"
                />

                <button type="submit">Potvrdi</button>
            </form>
        </div>
    );
};

export default CardFormPage;
