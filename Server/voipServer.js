import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on("connection", socket => {
  console.log("User connected: ", socket.id);

  socket.on("call-user", ({ targetId, offer }) => {
    io.to(targetId).emit("incoming-call", { from: socket.id, offer });
  });

  socket.on("answer-call", ({ targetId, answer }) => {
    io.to(targetId).emit("call-answered", { from: socket.id, answer });
  });

  socket.on("ice-candidate", ({ targetId, candidate }) => {
    if (candidate && candidate.sdpMid && candidate.sdpMLineIndex !== null) {
      io.to(targetId).emit("ice-candidate", candidate);
    }
  });

  socket.on("screen-sharing-status", ({ targetId, isSharing }) => {
    io.to(targetId).emit("screen-sharing-status", { isSharing });
  });

  socket.on("end-call", ({ targetId }) => {
    io.to(targetId).emit("call-ended");
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(5001, () => console.log("VoIP server running on port 5001"));
