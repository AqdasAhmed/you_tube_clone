import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import io from "socket.io-client";
import Leftsidebar from "../../Component/Leftsidebar/Leftsidebar";
import { TbCopy, TbCopyCheckFilled } from "react-icons/tb";
import "./Videocall.css";

const socket = io("https://play-tube-clone-voip.onrender.com")

const VideoCall = () => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const screenVideoRef = useRef(null);
  const pc = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunks = useRef([]);
  const screenTrackRef = useRef(null);
  const pendingCandidates = useRef([]);

  const [screenStream, setScreenStream] = useState(null);

  const SOCKET_ID_KEY = "voipSocketId";
  const SOCKET_ID_TIME_KEY = "voipSocketIdTime";
  const SOCKET_ID_LOCK_KEY = "voipSocketIdLock";
  const SOCKET_UNUSED_TIMEOUT = 3 * 60 * 1000;
  const SOCKET_DISCONNECT_TIMEOUT = 30 * 1000;

  const isAndroid = /Android/i.test(navigator.userAgent);
  const isChrome = /Chrome/i.test(navigator.userAgent);
  const isScreenShareUnsupported = isAndroid && isChrome;

  const clearSocketId = () => {
    localStorage.removeItem(SOCKET_ID_KEY);
    localStorage.removeItem(SOCKET_ID_TIME_KEY);
    localStorage.removeItem(SOCKET_ID_LOCK_KEY);
  };

  const generateNewSocketId = () => {
    if (socket && socket.connected) {
      socket.disconnect();
    }
    clearSocketId();
    setMyId("");
    setTimeout(() => {
      if (!socket.connected) socket.connect();
    }, 100);
  };

  const getOrCreateSocketId = () => {
    let storedId = localStorage.getItem(SOCKET_ID_KEY);
    let storedTime = localStorage.getItem(SOCKET_ID_TIME_KEY);
    let locked = localStorage.getItem(SOCKET_ID_LOCK_KEY) === "1";
    const now = Date.now();
    if (storedId && storedTime && !locked) {
      if (now - Number(storedTime) > SOCKET_UNUSED_TIMEOUT) {
        generateNewSocketId();
        return "";
      }
      return storedId;
    }
    if (storedId && locked) {
      return storedId;
    }
    if (socket.id) {
      localStorage.setItem(SOCKET_ID_KEY, socket.id);
      localStorage.setItem(SOCKET_ID_TIME_KEY, now.toString());
      return socket.id;
    }
    return "";
  };

  const [myId, setMyId] = useState(getOrCreateSocketId());
  const [otherId, setOtherId] = useState("");
  const [callStarted, setCallStarted] = useState(false);
  const [connected, setConnected] = useState(false);
  const [recording, setRecording] = useState(false);
  const [isRemoteFullScreen, setIsRemoteFullScreen] = useState(false);
  const [isSharingScreen, setIsSharingScreen] = useState(false);
  const [isOtherSharing, setIsOtherSharing] = useState(false);
  const [copied, setCopied] = useState(false)
  const [recordSource, setRecordSource] = useState("screen");

  const currentuser = useSelector(state => state.currentuserreducer);

  const setupPeerConnection = () => {
    const configuration = {
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    };
    pc.current = new RTCPeerConnection(configuration);

    pc.current.onicecandidate = (e) => {
      if (e.candidate && otherId) {
        socket.emit("ice-candidate", { targetId: otherId, candidate: e.candidate });
      }
    };

    pc.current.ontrack = (event) => {
      let inboundStream =
        event.streams && event.streams[0]
          ? event.streams[0]
          : new MediaStream([event.track]);

      if (remoteVideoRef.current && remoteVideoRef.current.srcObject !== inboundStream) {
        remoteVideoRef.current.srcObject = inboundStream;
      }
    };

  };

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (navigator.sendBeacon) {
        navigator.sendBeacon("/voip/cleanup");
      }
      clearSocketId();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let unusedTimeout = null;
    let disconnectTimeout = null;

    const resetUnusedTimeout = () => {
      if (unusedTimeout) clearTimeout(unusedTimeout);
      let locked = localStorage.getItem(SOCKET_ID_LOCK_KEY) === "1";
      if (!locked && !connected) {
        unusedTimeout = setTimeout(() => {
          generateNewSocketId();
        }, SOCKET_UNUSED_TIMEOUT);
      }
    };

    const handleConnect = () => {
      let storedId = localStorage.getItem(SOCKET_ID_KEY);
      let locked = localStorage.getItem(SOCKET_ID_LOCK_KEY) === "1";
      if (!storedId && socket.id) {
        localStorage.setItem(SOCKET_ID_KEY, socket.id);
        localStorage.setItem(SOCKET_ID_TIME_KEY, Date.now().toString());
        setMyId(socket.id);
      } else if (storedId) {
        setMyId(storedId);
      } else if (socket.id) {
        setMyId(socket.id);
      }
      if (!locked) {
        localStorage.setItem(SOCKET_ID_TIME_KEY, Date.now().toString());
      }
      setConnected(false);
      resetUnusedTimeout();
    };
    const handleDisconnect = () => {
      setConnected(false);
      disconnectTimeout = setTimeout(() => {
        generateNewSocketId();
      }, SOCKET_DISCONNECT_TIMEOUT);
    };

    const handleSocketIdChange = () => {
      if (!connected && !callStarted) {
        let storedId = localStorage.getItem(SOCKET_ID_KEY);
        let locked = localStorage.getItem(SOCKET_ID_LOCK_KEY) === "1";
        if (storedId && !locked) {
          setMyId(storedId);
        } else if (socket.id) {
          localStorage.setItem(SOCKET_ID_KEY, socket.id);
          localStorage.setItem(SOCKET_ID_TIME_KEY, Date.now().toString());
          setMyId(socket.id);
        }
      } else {
        console.log("Socket ID changed but user is in a call; myId not updated.");
      }
    };
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("reconnect", handleSocketIdChange);
    socket.on("connect_error", handleSocketIdChange);
    socket.on("connect_timeout", handleSocketIdChange);
    socket.on("ping", handleSocketIdChange);
    socket.on("pong", handleSocketIdChange);

    resetUnusedTimeout();

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("reconnect", handleSocketIdChange);
      socket.off("connect_error", handleSocketIdChange);
      socket.off("connect_timeout", handleSocketIdChange);
      socket.off("ping", handleSocketIdChange);
      socket.off("pong", handleSocketIdChange);
      if (unusedTimeout) clearTimeout(unusedTimeout);
      if (disconnectTimeout) clearTimeout(disconnectTimeout);
    };
    // eslint-disable-next-line
  }, [connected, callStarted, SOCKET_UNUSED_TIMEOUT, SOCKET_DISCONNECT_TIMEOUT]);

  useEffect(() => {
    if (connected) {
      localStorage.setItem(SOCKET_ID_LOCK_KEY, "1");
    } else {
      localStorage.removeItem(SOCKET_ID_LOCK_KEY);
    }
  }, [connected]);

  const startCall = async () => {
    setupPeerConnection();

    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localVideoRef.current.srcObject = stream;
    stream.getTracks().forEach(track => pc.current.addTrack(track, stream));

    const offer = await pc.current.createOffer();
    await pc.current.setLocalDescription(offer);
    socket.emit("call-user", { targetId: otherId, offer });

    setCallStarted(true);
    setConnected(true);
  };

  const endCall = () => {
    if (pc.current) {
      pc.current.getSenders().forEach(sender => sender.track?.stop());
      pc.current.close();
    }

    if (localVideoRef.current?.srcObject) {
      localVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
      localVideoRef.current.srcObject = null;
    }

    if (remoteVideoRef.current?.srcObject) {
      remoteVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
      remoteVideoRef.current.srcObject = null;
    }

    if (screenVideoRef.current?.srcObject) {
      screenVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
      screenVideoRef.current.srcObject = null;
    }

    setConnected(false);
    setCallStarted(false);
    setIsSharingScreen(false);
    setIsOtherSharing(false);
    setScreenStream(null);
    screenTrackRef.current = null;
    socket.emit("screen-sharing-status", { targetId: otherId, isSharing: false });

    if (otherId) {
      socket.emit("end-call", { targetId: otherId });
    }
  };

  const shareScreen = async () => {
    if (!pc.current || !connected) return;

    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const screenTrack = screenStream.getVideoTracks()[0];
      screenTrackRef.current = screenTrack;

      setScreenStream(screenStream);
      if (screenVideoRef.current) {
        screenVideoRef.current.srcObject = screenStream;
      }

      const sender = pc.current.getSenders().find(s => s.track?.kind === "video");
      if (sender) {
        sender.replaceTrack(screenTrack);
        setIsSharingScreen(true);
        socket.emit("screen-sharing-status", { targetId: otherId, isSharing: true });

        screenTrack.onended = () => {
          stopSharing();
        };
      }
    } catch (err) {
      console.error("Error sharing screen:", err);
    }
  };

  const stopSharing = async () => {
    const videoSender = pc.current.getSenders().find(s => s.track?.kind === "video");
    const localStream = await navigator.mediaDevices.getUserMedia({ video: true });

    if (videoSender) {
      const localTrack = localStream.getVideoTracks()[0];
      videoSender.replaceTrack(localTrack);
      localVideoRef.current.srcObject = localStream;
    }

    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
      setScreenStream(null);
      if (screenVideoRef.current) {
        screenVideoRef.current.srcObject = null;
      }
    }

    screenTrackRef.current?.stop();
    screenTrackRef.current = null;
    setIsSharingScreen(false);
    socket.emit("screen-sharing-status", { targetId: otherId, isSharing: false });
  };

  const startRecording = () => {
    let stream = null;
    if (recordSource === "screen") {
      stream = screenVideoRef.current?.srcObject;
    } else if (recordSource === "remote") {
      stream = remoteVideoRef.current?.srcObject;
    }
    if (!stream) return;

    mediaRecorderRef.current = new MediaRecorder(stream);
    recordedChunks.current = [];

    mediaRecorderRef.current.ondataavailable = (e) => {
      if (e.data.size > 0) recordedChunks.current.push(e.data);
    };

    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(recordedChunks.current, { type: "video/mp4" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "recording.mp4";
      a.click();
    }

    mediaRecorderRef.current.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const toggleFullscreen = () => {
    if (!remoteVideoRef.current) return;

    if (!document.fullscreenElement) {
      remoteVideoRef.current.requestFullscreen();
      setIsRemoteFullScreen(true);
    } else {
      document.exitFullscreen();
      setIsRemoteFullScreen(false);
    }
  };

  const copyMyId = () => {
    if (myId) {
      navigator.clipboard.writeText(myId);
    }
  };

  useEffect(() => {
    socket.on("incoming-call", async ({ from, offer }) => {
      setOtherId(from);
      setupPeerConnection();

      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localVideoRef.current.srcObject = stream;
      stream.getTracks().forEach(track => pc.current.addTrack(track, stream));

      await pc.current.setRemoteDescription(new RTCSessionDescription(offer));
      for (const candidate of pendingCandidates.current) {
        try {
          await pc.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error("Error adding queued ice candidate", err);
        }
      }
      pendingCandidates.current = [];
      const answer = await pc.current.createAnswer();
      await pc.current.setLocalDescription(answer);

      socket.emit("answer-call", { targetId: from, answer });
      setCallStarted(true);
      setConnected(true);
    });

    socket.on("call-answered", async ({ from, answer }) => {
      await pc.current.setRemoteDescription(new RTCSessionDescription(answer));
      for (const candidate of pendingCandidates.current) {
        try {
          await pc.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error("Error adding queued ice candidate", err);
        }
      }
      pendingCandidates.current = [];
    });

    socket.on("ice-candidate", async (candidate) => {
      if (!pc.current) return;

      if (pc.current.remoteDescription && pc.current.remoteDescription.type) {
        try {
          await pc.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error("Error adding received ice candidate", err);
        }
      } else {
        pendingCandidates.current.push(candidate);
      }
    });

    socket.on("call-ended", () => {
      endCall();
    });

    socket.on("screen-sharing-status", ({ isSharing }) => {
      setIsOtherSharing(isSharing);
    });

    return () => {
      socket.off("incoming-call");
      socket.off("call-answered");
      socket.off("ice-candidate");
      socket.off("call-ended");
      socket.off("screen-sharing-status");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="container_Pages_App">
      <Leftsidebar />
      <div className='container2_Pages_App'>
        <div className="container_videocall">
          <h1>Video Call</h1>
          {currentuser?.result?._id ? (
            <>
              <p>
                Your ID: {myId}
                {copied ? (
                  <TbCopyCheckFilled title="Copied!" className="copy_id_btn copied" />
                ) : (
                  <TbCopy
                    title="Copy your ID"
                    onClick={() => {
                      copyMyId();
                      setCopied(true);
                    }}
                    disabled={!myId}
                    className="copy_id_btn"
                  />
                )}
              </p>
              <div className="call_controls">
                <input
                  placeholder="Friend's ID"
                  value={otherId}
                  onChange={(e) => setOtherId(e.target.value)}
                  disabled={connected}
                />

                {!callStarted ? (
                  <button onClick={startCall} disabled={!otherId}>Call</button>
                ) : (
                  <button onClick={endCall}>End</button>
                )}

                {!isSharingScreen ? (
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <button
                      onClick={shareScreen}
                      disabled={!connected || isOtherSharing}
                    >
                      Share
                    </button>
                    {isScreenShareUnsupported && (
                      <span style={{ color: "red", fontSize: "0.9em", marginTop: "4px" }}>
                        ⚠️ Screen sharing is not supported by Chrome on Android.
                      </span>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={stopSharing}
                    disabled={!isSharingScreen || isOtherSharing}
                  >
                    Stop
                  </button>
                )}

                <select
                  value={recordSource}
                  onChange={e => setRecordSource(e.target.value)}
                  disabled={recording}
                  style={{ marginRight: 8 }}
                  className="record_source_select"
                >
                  <option value="screen">My Screen</option>
                  <option value="remote">Remote Screen</option>
                </select>
                {!recording ? (
                  <button onClick={startRecording} disabled={
                    (recordSource === "screen" && !isSharingScreen) ||
                    (recordSource === "remote" && !connected)
                  }>
                    Record
                  </button>
                ) : (
                  <button onClick={stopRecording}>Stop & Save</button>
                )}

                <button onClick={toggleFullscreen} disabled={!connected}>
                  {isRemoteFullScreen ? "Exit Fullscreen" : "Fullscreen"}
                </button>
              </div>

              <div className="video_container">
                <div className="remote_video_container">
                  <video
                    className="remote_video"
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                  />
                </div>

                <div className="localvideo_screenvideo_container">
                  <video
                    className="local_video"
                    ref={localVideoRef}
                    autoPlay
                    muted
                    playsInline
                  />

                  <video
                    className="screen_video"
                    ref={screenVideoRef}
                    autoPlay
                    muted
                    playsInline
                    style={{ display: isSharingScreen ? "block" : "none" }}
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="videocall_login">
              <h1>Please login to start a video call</h1>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoCall;
