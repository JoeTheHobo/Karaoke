
// Visibility handler — runs when user returns to the page
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    console.log("User returned to the app (visibilitychange)");
    setSplash(); // whatever you do
    forceReconnectSocket();
    // after reconnect, ask server for fresh state if needed:
    // socket.emit("requestState") — but only after connect; you can do that in 'connect' handler
  } else {
    console.log("User left the app (visibilitychange)");
  }
});

function reconnectSocket() {
    socket.close();
    
    setTimeout(() => {
        initSocket(); // create a brand new WebSocket
    }, 1000);
}
function initSocket() {
    if (socket) {
        try {
            socket.off();         // remove all listeners
            socket.disconnect();  // disconnect the client
        } catch (e) {
            console.warn("Error cleaning old socket:", e);
        }
        socket = null;
    }

    socket = io({
        transports: ["websocket"],
        reconnection: true,
        reconnectionAttempts: Infinity, 
        reconnectionDelay: 500,
    });

    socket.on("connect",() => {

        const path = window.location.pathname;
        if (path === "/user") {
            setScene("usersigned");
            user.type = "user";
            socket.emit("userJoined",sessionCode,user.code);
        } else if (path === "/" || path === "/screen") {
            user.type = "screen";
            setScene("screenSelection")
        } else {
            //Redirect to User
            setScene("usersigned");
            user.type = "user";
            socket.emit("userJoined",sessionCode,user.code);
        }
        
        if (adminCode.length === 4) {
            socket.emit("checkAdminCode",adminCode.join(""))
        }

        // Clear any reconnection timer state
        if (reconnectTimer) {
            clearTimeout(reconnectTimer);
            reconnectTimer = null;
        }
        
        socket.emit("updateQueue");
        setTimeout(function() {
            socket.emit("checkIfQR",sessionCode,user.uid)
        },50);

        if (loadImages) setImages();

    })

}
initSocket();

function forceReconnectSocket() {
  // If socket exists, try to use the same instance
  if (socket) {
    if (!socket.connected) {
      console.log("Force reconnect via socket.connect()");
      try {
        socket.connect(); // tells the same socket instance to reconnect
      } catch (e) {
        console.warn("socket.connect() failed, re-initting", e);
        scheduleFullReconnect();
      }
    } else {
      console.log("Socket already connected");
    }
  } else {
    console.log("No socket instance — creating a new one");
    initSocket();
  }
}
function scheduleFullReconnect() {
  if (reconnectTimer) return;
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    initSocket(); // full re-init
  }, 800); // small backoff
}