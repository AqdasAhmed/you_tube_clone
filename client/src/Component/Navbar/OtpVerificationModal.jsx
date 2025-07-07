import React, { useState, useEffect, useRef } from "react";

const OtpVerificationModal = ({ open, onClose, method, target, onVerified }) => {
    const [otp, setOtp] = useState("");
    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(30);
    const [resending, setResending] = useState(false);
    const timerRef = useRef();

    useEffect(() => {
        if (!open) return;
        setTimer(30);
        setStatus("");
        setOtp("");
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setTimer(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timerRef.current);
    }, [open, target]);

    const handleVerify = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus("");
        try {
            if (method === "mobile") {
                if (!window.confirmationResult) {
                    setStatus("OTP session expired or not found. Please resend OTP.");
                    setLoading(false);
                    return;
                }
                try {
                    await window.confirmationResult.confirm(otp);
                    setStatus("OTP verified successfully!");
                    setTimeout(() => { onVerified && onVerified(); }, 500);
                } catch (error) {
                    console.error("OTP verification failed:", error);
                    let msg = "OTP verification failed. ";
                    if (error.code === 'auth/invalid-verification-code') {
                        msg += "Invalid or expired OTP.";
                    } else if (error.code === 'auth/missing-verification-code') {
                        msg += "Please enter the OTP.";
                    } else if (error.code === 'auth/invalid-verification-id') {
                        msg += "Session expired. Please resend OTP.";
                    } else {
                        msg += error.message || "Unknown error.";
                    }
                    setStatus(msg);
                }
            } else {
                const res = await fetch("https://play-tube-clone.onrender.com/api/otp/verify", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: target, otp }),
                });
                const data = await res.json();
                if (res.ok && data.success) {
                    setStatus("OTP verified successfully!");
                    setTimeout(() => { onVerified && onVerified(); }, 500);
                } else {
                    setStatus(data.error || "Invalid OTP");
                }
            }
        } catch (err) {
            setStatus("Verification failed. " + err.message);
        }
        setLoading(false);
    };

    const handleResend = async () => {
        setResending(true);
        setStatus("");
        setOtp("");
        setTimer(30);
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setTimer(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        try {
            if (method === "mobile") {
                if (window.recaptchaVerifier && target) {
                    let formattedTarget = target;
                    if (/^\d{10}$/.test(target)) {
                        formattedTarget = "+91" + target;
                    }
                    const { sendOtp } = await import("../../utils/firbaseOtp");
                    await sendOtp(formattedTarget);
                    setStatus("OTP resent to your phone.");
                } else {
                    setStatus("Unable to resend OTP. Please refresh and try again.");
                }
            } else {
                await fetch("https://play-tube-clone.onrender.com/api/otp/send", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: target, method: "email" }),
                });
                setStatus("OTP resent to your email.");
            }
        } catch (err) {
            setStatus("Failed to resend OTP. " + err.message);
        }
        setResending(false);
    };

    if (!open) return null;

    return (
        <div style={{
            position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.4)", zIndex: 9999,
            display: "flex", alignItems: "center", justifyContent: "center"
        }}>
            <div style={{ color: "black", background: "#fff", padding: 24, borderRadius: 8, minWidth: 320 }}>
                <h3>Verify OTP</h3>
                <p>
                    {method === "email" ? `Enter the OTP sent to your email: ${target}` : `Enter the OTP sent to your phone: ${target}`}
                </p>
                <form onSubmit={handleVerify}>
                    <input
                        type="text"
                        value={otp}
                        onChange={e => setOtp(e.target.value)}
                        placeholder="Enter OTP"
                        style={{ width: "94.5%", padding: 8, marginBottom: 12 }}
                        maxLength={6}
                        required
                    />
                    <button type="submit" disabled={loading} style={{ width: "100%", padding: 8 }}>
                        {loading ? "Verifying..." : "Verify"}
                    </button>
                </form>
                <button
                    onClick={handleResend}
                    disabled={timer > 0 || resending}
                    style={{ marginTop: 12, width: "100%", padding: 8 }}
                >
                    {resending ? "Resending..." : timer > 0 ? `Resend OTP in ${timer}s` : "Resend OTP"}
                </button>
                {status && <div style={{ marginTop: 12, color: status.includes("success") ? "green" : "red" }}>{status}</div>}
            </div>
        </div>
    );
};

export default OtpVerificationModal;
