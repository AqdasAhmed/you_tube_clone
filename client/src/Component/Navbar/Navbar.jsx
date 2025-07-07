import React, { useState, useEffect } from 'react'
import logo from "./logo.ico"
import "./Navbar.css"
import { useDispatch, useSelector } from 'react-redux'
import { Link } from "react-router-dom"
import { RiVideoAddLine } from "react-icons/ri"
import { IoMdNotificationsOutline } from "react-icons/io"
import { BiUserCircle } from "react-icons/bi"
import Searchbar from './Searchbar/Searchbar'
import Auth from '../../Pages/Auth/Auth'
import axios from "axios"
import { login } from "../../action/auth"
import { useGoogleLogin, googleLogout } from '@react-oauth/google';
import { setcurrentuser } from '../../action/currentuser';

import { jwtDecode } from "jwt-decode"
import { getUserLocation, triggerOtp } from '../../utils/useLocationInfo';
import { getThemeAndOtpMethod } from '../../utils/themeAndOtpUtils';
import { sendOtp } from '../../utils/firbaseOtp'
import OtpVerificationModal from "./OtpVerificationModal"
import MobileNumberModal from "./MobileNumberModal"

const Navbar = ({ toggledrawer, seteditcreatechanelbtn }) => {
    const [authbtn, setauthbtn] = useState(false)
    const [user, setuser] = useState(null)
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otpMethodUsed, setOtpMethodUsed] = useState(null);
    const [otpTarget, setOtpTarget] = useState("");
    const [pendingGoogleProfile, setPendingGoogleProfile] = useState(null);
    const [showMobileModal, setShowMobileModal] = useState(false);
    const dispatch = useDispatch()

    const currentuser = useSelector(state => state.currentuserreducer);

    const google_login = useGoogleLogin({
        onSuccess: tokenResponse => setuser(tokenResponse),

        onError: (error) => console.log("Login Failed", error)
    });

    useEffect(() => {
        if (user) {
            axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${user.access_token}`, {
                headers: {
                    Authorization: `Bearer ${user.access_token}`,
                    Accept: 'application/json'
                }
            })
                .then(async (res) => {
                    const email = res.data.email;
                    try {
                        const backendRes = await axios.post(
                            'https://play-tube-clone.onrender.com/user/login',
                            { email }
                        );
                        const userPhone =
                            backendRes.data?.phone
                            ?? backendRes.data?.result?.phone
                            ?? backendRes.data?.user?.phone;
                        if (userPhone) {
                            setPendingGoogleProfile({ ...res.data, phone: userPhone, isNewUser: false });
                        } else {
                            setPendingGoogleProfile({ ...res.data, isNewUser: true });
                        }
                    } catch (err) {
                        setPendingGoogleProfile({ ...res.data, isNewUser: true });
                    }
                })

        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    useEffect(() => {
        if (pendingGoogleProfile && !localStorage.getItem("otpTriggered")) {
            const startOtpFlow = async () => {
                const location = await getUserLocation();
                const { otpMethod } = getThemeAndOtpMethod(location.state);
                const email = pendingGoogleProfile.email;
                let mobile = pendingGoogleProfile.phone;
                if (otpMethod === 'mobile') {
                    if (pendingGoogleProfile.isNewUser) {
                        setShowMobileModal(true);
                        return;
                    } else if (mobile) {
                        try {
                            let formattedMobile = mobile;
                            if (/^\d{10}$/.test(mobile)) {
                                formattedMobile = '+91' + mobile;
                            }
                            await sendOtp(formattedMobile);
                            setOtpMethodUsed('mobile');
                            setOtpTarget(formattedMobile);
                            setShowOtpModal(true);
                        } catch (error) {
                            console.error("Failed to trigger Firebase mobile OTP:", error);
                        }
                        return;
                    }
                }
                if (otpMethod === 'email' && email) {
                    try {
                        await triggerOtp({ email, mobile, method: otpMethod });
                        setOtpMethodUsed('email');
                        setOtpTarget(email);
                        setShowOtpModal(true);
                    } catch (error) {
                        console.error("Failed to trigger nodemailer/email OTP:", error);
                    }
                }
            };
            startOtpFlow();
        }
    }, [pendingGoogleProfile]);

    const handleOtpVerified = async () => {
        if (pendingGoogleProfile) {
            if (pendingGoogleProfile.isNewUser) {
                await dispatch(login({
                    email: pendingGoogleProfile.email,
                    name: pendingGoogleProfile.name,
                    phone: otpTarget.replace('+91', ''),
                }));
            } else {
                await dispatch(login({ email: pendingGoogleProfile.email }));
            }
            localStorage.setItem("otpTriggered", "true");
            setShowOtpModal(false);
            setPendingGoogleProfile(null);
        }
        if (otpMethodUsed === "mobile") {
            localStorage.setItem("userMobile", otpTarget);
        }
    };

    const logout = () => {
        localStorage.removeItem("otpTriggered");
        dispatch(setcurrentuser(null))
        googleLogout()
        localStorage.clear()
    }
    useEffect(() => {
        const token = currentuser?.token;
        if (token) {
            const decodetoken = jwtDecode(token)
            if (decodetoken.exp * 1000 < new Date().getTime()) {
                logout()
            }
        }
        dispatch(setcurrentuser(JSON.parse(localStorage.getItem("Profile"))))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentuser?.token, dispatch]
    )

    return (
        <>
            <div className="Container_Navbar">
                <div className="Burger_Logo_Navbar">
                    <div className="burger" onClick={() => toggledrawer()}>
                        <p></p>
                        <p></p>
                        <p></p>
                    </div>
                    <Link to={"/"} className='logo_div_Navbar'>
                        <img src={logo} alt="logo" />
                        <p className="logo_title_navbar">Your-Tube</p>
                    </Link>
                </div>
                <Searchbar />
                <RiVideoAddLine size={22} className={"vid_bell_Navbar"} />
                <div className="apps_Box">
                    <p className="appBox"></p>
                    <p className="appBox"></p>
                    <p className="appBox"></p>
                    <p className="appBox"></p>
                    <p className="appBox"></p>
                    <p className="appBox"></p>
                    <p className="appBox"></p>
                    <p className="appBox"></p>
                    <p className="appBox"></p>
                </div>

                <IoMdNotificationsOutline size={22} className={"vid_bell_Navbar"} />
                <div className="Auth_cont_Navbar">
                    {currentuser ? (
                        <>
                            <div className="Chanel_logo_App" onClick={() => setauthbtn(true)}>
                                <p className="fstChar_logo_App">
                                    {currentuser?.result.name ? (
                                        <>{currentuser?.result.name.charAt(0).toUpperCase()}</>
                                    ) : (
                                        <>{currentuser?.result.email.charAt(0).toUpperCase()}</>
                                    )}
                                </p>
                            </div>
                        </>
                    ) : (
                        <>
                            <p
                                className='Auth_Btn'
                                onClick={() => {
                                    google_login();
                                }}
                            >
                                <BiUserCircle size={22} />
                                <b>Sign in</b>
                            </p>
                        </>
                    )}
                </div>
            </div>
            {
                authbtn &&
                <Auth seteditcreatechanelbtn={seteditcreatechanelbtn} setauthbtn={setauthbtn} user={currentuser} />
            }
            {showOtpModal && (
                <OtpVerificationModal
                    open={showOtpModal}
                    onClose={() => { }}
                    method={otpMethodUsed}
                    target={otpTarget}
                    onVerified={handleOtpVerified}
                />
            )}
            <MobileNumberModal
                open={showMobileModal}
                onSubmit={async (mobile) => {
                    setShowMobileModal(false);
                    if (!mobile) {
                        alert("Mobile number is required for OTP.");
                        return;
                    }
                    try {
                        let formattedMobile = mobile;
                        if (/^\d{10}$/.test(mobile)) {
                            formattedMobile = '+91' + mobile;
                        }
                        await sendOtp(formattedMobile);
                        setOtpMethodUsed('mobile');
                        setOtpTarget(formattedMobile);
                        setShowOtpModal(true);
                    } catch (error) {
                        alert("Failed to send OTP: " + error.message);
                    }
                }}
                onClose={() => {
                    setShowMobileModal(false);
                }}
            />
        </>
    )
}

export default Navbar