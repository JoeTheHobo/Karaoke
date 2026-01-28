
// Visibility handler — runs when user returns to the page
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState !== "visible") return;

  setSplash();
  forceReconnectSocket();
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

        let path = window.location.pathname;

        if (path === "/") {
            user.type = "screen";
            if (sessionCode) {
                path[0] = sessionCode;
            }
            setScene("sessions")
        }


        path = path.subset(1,true);
        path = path.split("_");

        sessionCode = Number(path[0]);
        if (path.includes("user")) {
            user.type = "user";
            socket.emit("userJoined",sessionCode,user.uid,user.showName);
            //setScene("user");

        }
        
        checkThemes();
        
        if (adminCode.length === 4 && user.type === "user") {
            socket.emit("checkAdminCode",adminCode.join(""))
        }

        // Clear any reconnection timer state
        if (reconnectTimer) {
            clearTimeout(reconnectTimer);
            reconnectTimer = null;
        }
        
        socket.emit("updateQueue");

        if (loadImages) setImages();

    })

}
if (!offlineMode) initSocket();
else {
    socket = {
        on: () => {
            
        }
    }
}

function forceReconnectSocket() {
  // If socket exists, try to use the same instance
  if (!socket) {
    initSocket();
    return;
  }
  if (socket.connected) return;

  try {
    socket.connect(); // tells the same socket instance to reconnect
  } catch (e) {
    console.warn("socket.connect() failed, re-initting", e);
    scheduleFullReconnect();
  }
}
function scheduleFullReconnect() {
  if (reconnectTimer) return;
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    initSocket(); // full re-init
  }, 800); // small backoff
}


function setScene(scene) {
    $(".scene").hide();
    $("scene_" + scene).show("flex");

    if (scene === "adminSignin") resetAdminPinPad();
}

socket.on("quitAdmin",() => {
    quitAdmin();
})