import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, asset } from '../services/api';

export default function Checkout() {
  const { id } = useParams();

  const [b, setB] = useState(null);
  const [amount, setAmount] = useState('');
  const [paymentReference, setPaymentReference] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const nav = useNavigate();

  useEffect(() => {
    api(`/ebooks/${id}`)
      .then(d => setB(d.book))
      .catch(e => setError(e.message));
  }, [id]);

  const pay = async e => {
  e.preventDefault();
  setBusy(true);
  setError('');

  const enteredAmount = Number(amount);
  const bookPrice = Number(b.price);

  if (!Number.isFinite(enteredAmount)) {
    setError('Please enter a valid purchase amount.');
    setBusy(false);
    return;
  }

  if (enteredAmount !== bookPrice) {
    setError(
      `Please enter the exact purchase amount of $${bookPrice.toFixed(2)}.`
    );
    setBusy(false);
    return;
  }

  try {
    await api(`/ebooks/${id}/buy`, {
      method: 'POST',
      body: JSON.stringify({
        amount: enteredAmount,
        paymentReference
      })
    });

    nav('/order-confirm');
  } catch (err) {
    setError(err.message);
  } finally {
    setBusy(false);
  }
};

  if (!b) {
    return <div className="center-page">Loading…</div>;
  }

  const bookPrice = Number(b.price);

  return (
    <section className="checkout">
      <div className="checkout-card">
        <img src={asset(b.coverImage)} alt={b.title} />

        <div>
          <p className="eyebrow">Demo checkout</p>

          <h1>Complete Your Purchase</h1>

          <h2>{b.title}</h2>

          <p>
            by {b.author?.name || b.author?.username}
          </p>

          <div className="checkout-price">
            ${bookPrice.toFixed(2)}
          </div>

          {error && (
            <p className="checkout-error" style={{color:'red'}}>
              {error}
            </p>
          )}

          <form onSubmit={pay}>
            <label>
              Purchase Amount
            </label>

            <input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder={`Enter $${bookPrice.toFixed(2)}`}
              required
            />

            <label>
              Demo Card / UPI Reference
            </label>

            <input
              value={paymentReference}
              onChange={e => setPaymentReference(e.target.value)}
              placeholder="Demo card / UPI reference"
              required
            />

            <button
              className="dark-btn big"
              disabled={busy}
            >
              {busy
                ? 'Processing Demo Payment…'
                : 'Proceed to Payment'}
            </button>
          </form>

          <small>
            No real payment is processed. The purchase will be
            completed only when the entered amount exactly matches
            the book price.
          </small>
        </div>
      </div>
    </section>
  );
}