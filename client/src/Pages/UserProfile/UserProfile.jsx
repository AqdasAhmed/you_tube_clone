import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import "./UserProfile.css";
import Downloads from "./Downloads";
import Leftsidebar from '../../Component/Leftsidebar/Leftsidebar';
import PremiumModal from "../../Component/PremiumModal";

const UserProfile = () => {
    const user = useSelector((state) => state.currentuserreducer);
    const [isPremium, setIsPremium] = useState(false);
    const [premiumModal, setPremiumModal] = useState(false);

    useEffect(() => {
        const fetchPremiumStatus = async () => {
            if (user?.result?._id) {
                try {
                    const res = await axios.get(`https://play-tube-clone.onrender.com/api/razorpay/user/${user.result._id}`);
                    setIsPremium(res.data?.user?.premium || false);
                } catch (err) {
                    console.error("Failed to fetch premium status", err);
                }
            }
        };
        fetchPremiumStatus();
    }, [user?.result?._id]);

    return (
        <div className="container_Pages_App">
            <Leftsidebar />
            <div className='container2_Pages_App'>
                <div className="userProfile">
                    <div className="userInfo">
                        <h1>{user?.result?.name || user?.result?.email}'s Profile</h1>
                        <p>{user?.result?.email}</p>

                        {!isPremium ? (
                            <button onClick={() => setPremiumModal(true)} className="go-premium-btn">
                                Go Premium
                            </button>
                        ) : (
                            <button className="go-premium-btn">
                                Premium User
                            </button>
                        )}
                    </div>

                    <div className="userDownloads">
                        <Downloads />
                    </div>
                </div>
            </div>

            {premiumModal && (
                <PremiumModal
                    onClose={() => setPremiumModal(false)}
                    onSuccess={async () => {
                        try {
                            const res = await axios.get(`https://play-tube-clone.onrender.com/api/razorpay/user/${user.result._id}`);
                            setIsPremium(res.data?.user?.premium || false);
                        } catch (err) {
                            console.error("Failed to refresh premium status after payment", err);
                        }
                        setPremiumModal(false);
                    }}
                />
            )}
        </div>
    );
};

export default UserProfile;
