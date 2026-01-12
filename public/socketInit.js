
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

        const path = window.location.pathname;
        if (path === "/user") {
            setScene("sessions");
            user.type = "user";
            socket.emit("userJoined",sessionCode,user.code,user.showName);
        } else if (path === "/" || path === "/screen") {
            user.type = "screen";
            setScene("screenSelection")
        } else {
            //Redirect to User
            setScene("user");
            user.type = "user";
            socket.emit("userJoined",sessionCode,user.code,user.showName);
        }
        
        checkThemes();
        
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