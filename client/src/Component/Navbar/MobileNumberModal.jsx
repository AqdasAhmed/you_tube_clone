import React, { useState } from 'react';

const MobileNumberModal = ({ open, onSubmit, onClose }) => {
    const [mobile, setMobile] = useState('');
    const [error, setError] = useState('');

    if (!open) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        let value = mobile.trim().replace(/\s+/g, '');
        if (!value.startsWith('+')) {
            value = '+91' + value;
        }
        const isValid = /^\+91\d{10}$/.test(value);
        if (!isValid) {
            setError('Invalid mobile number. Please enter a valid 10-digit Indian number.');
            return;
        }
        setError('');
        onSubmit(value);
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.4)', zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <div style={{ color: 'black', background: '#fff', padding: 24, borderRadius: 8, minWidth: 320 }}>
                <h3>Enter Mobile Number</h3>
                <form onSubmit={handleSubmit}>
                    <input
                        type="tel"
                        value={mobile}
                        onChange={e => setMobile(e.target.value)}
                        placeholder="10-digit mobile number"
                        style={{ width: '94.5%', padding: 8, marginBottom: 12 }}
                        maxLength={10}
                        required
                    />
                    <button type="submit" style={{ width: '100%', padding: 8 }}>Submit</button>
                </form>
                {error && <div style={{ marginTop: 12, color: 'red' }}>{error}</div>}
                <button onClick={onClose} style={{ marginTop: 12, width: '100%', padding: 8 }}>Cancel</button>
            </div>
        </div>
    );
};

export default MobileNumberModal;
