import React from 'react';
import { BiLogOut } from 'react-icons/bi';
import { Link } from 'react-router-dom';
import { googleLogout } from '@react-oauth/google';
import "./Auth.css";
import { useDispatch } from "react-redux";
import { setcurrentuser } from '../../action/currentuser';

const Auth = ({ user, setauthbtn, seteditcreatechanelbtn }) => {
    const dispatch = useDispatch();

    const logout = () => {
        localStorage.removeItem("otpTriggered");
        dispatch(setcurrentuser(null));
        localStorage.clear();
        googleLogout();
    };

    return (
        <div className="Auth_container" onClick={() => setauthbtn(false)}>
            <div className="Auth_container2">
                <div className="User_Details">
                    <div className="Chanel_logo_App">
                        <p className="fstChar_logo_App">
                            {user?.result.name ? (
                                <>{user?.result.name.charAt(0).toUpperCase()}</>
                            ) : (
                                <>{user?.result.email.charAt(0).toUpperCase()}</>
                            )}
                        </p>
                    </div>
                    <div className="email_auth">{user?.result.email}</div>
                </div>
                <div className="btns_Auth">
                    {user?.result.name ? (
                        <>
                            <Link to={`/channel/${user?.result?._id}`} className='btn_Auth'>Your Channel</Link>
                        </>
                    ) : (
                        <>
                            <input type="submit" className='btn_Auth' value="Create Your Own Channel" onClick={() => seteditcreatechanelbtn(true)} />
                        </>
                    )}
                    <Link
                        to="/userprofile"
                        className="btn_Auth"
                        style={{ marginLeft: 12, textDecoration: "none", color: "inherit" }}
                    >
                        Your Profile
                    </Link>
                    <div>
                        <div className="btn_Auth" onClick={logout}>
                            <BiLogOut />
                            Log Out
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Auth;
