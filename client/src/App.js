import './App.css';
import './light-theme.css'
import React, { useEffect, useState } from "react"
import Navbar from './Component/Navbar/Navbar';
import { useDispatch, useSelector } from 'react-redux';
import Allroutes from "../src/Allroutes"
import { BrowserRouter as Router } from 'react-router-dom';
import Drawersliderbar from '../src/Component/Leftsidebar/Drawersliderbar'
import Createeditchannel from './Pages/Channel/Createeditchannel';
import Videoupload from './Pages/Videoupload/Videoupload';
import { fetchallchannel } from './action/channeluser';
import { getallvideo } from './action/video';
import { getallcomment } from './action/comment';
import { getallhistory } from './action/history';
import { getalllikedvideo } from './action/likedvideo';
import { getallwatchlater } from './action/watchlater';
import { getUserLocation, triggerOtp } from './utils/useLocationInfo';
import { getThemeAndOtpMethod } from './utils/themeAndOtpUtils';

if (typeof window !== 'undefined' && !window.__unhandledRejectionHandlerAdded) {
  window.addEventListener('unhandledrejection', function (event) {
    console.error('UNHANDLED PROMISE REJECTION:', event.reason);
  });
  window.__unhandledRejectionHandlerAdded = true;
}

function App() {
  const [theme, setTheme] = useState('dark');
  const [toggledrawersidebar, settogledrawersidebar] = useState({
    display: "none"
  });
  const dispatch = useDispatch()

  const user = useSelector((state) => state.currentUserReducer);
  useEffect(() => {

    async function sendInitialOtp() {
      if (!user || localStorage.getItem("otpTriggered")) return;

      const location = await getUserLocation();
      const { otpMethod } = getThemeAndOtpMethod(location.state);

      const email = user?.result?.email;
      const mobile = user?.result?.mobile;

      if ((otpMethod === 'email' && email) || (otpMethod === 'mobile' && mobile)) {
        try {
          await triggerOtp({ email, mobile, method: otpMethod });
          localStorage.setItem("otpTriggered", "true");
        } catch (error) {
          console.error("Failed to trigger OTP:", error);
        }
      }
    }

    sendInitialOtp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    dispatch(fetchallchannel())
    dispatch(getallvideo())
    dispatch(getallcomment())
    dispatch(getallhistory())
    dispatch(getalllikedvideo())
    dispatch(getallwatchlater())
    setInitialTheme();
  }, [dispatch])

  async function setInitialTheme() {
    const location = await getUserLocation();
    const { theme } = getThemeAndOtpMethod(location.state);
    setTheme(theme)
    document.body.setAttribute('data-theme', theme);
  }

  const toggledrawer = () => {
    if (toggledrawersidebar.display === "none") {
      settogledrawersidebar({
        display: "flex",
      });
    } else {
      settogledrawersidebar({
        display: "none",
      });
    }
  }

  const [editcreatechanelbtn, seteditcreatechanelbtn] = useState(false);
  const [videouploadpage, setvideouploadpage] = useState(false);


  return (
    <div className={`app ${theme}`}>
      <Router>
        {
          videouploadpage && <Videoupload setvideouploadpage={setvideouploadpage} />
        }
        {editcreatechanelbtn && (
          <Createeditchannel seteditcreatechanelbtn={seteditcreatechanelbtn} />
        )}
        <Navbar seteditcreatechanelbtn={seteditcreatechanelbtn} toggledrawer={toggledrawer} />
        <Drawersliderbar toggledraw={toggledrawer} toggledrawersidebar={toggledrawersidebar} />
        <Allroutes seteditcreatechanelbtn={seteditcreatechanelbtn} setvideouploadpage={setvideouploadpage} />
      </Router>
    </div>
  );
}

export default App;