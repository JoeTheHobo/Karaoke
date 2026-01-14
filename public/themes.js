let themes = {};

themes["Valentines"] = {
    priority: 2,
    date: {
        start: { month: 2, day: 14 },
        end: { month: 2, day: 14 },
    },
    screen: {
        queue: {
            border: "2px solid #ff5cb6",
            boxShadow: "inset 0 0 10px rgba(255, 92, 206, 0.6), inset 0 0 25px rgba(255, 92, 174, 0.4), 0 0 10px rgba(255, 92, 255, 0.8), 0 0 25px rgba(255, 92, 193, 0.9)",
        },
        banner: {
            imgSrc: "valentines.png",
        },
        effects: {
            hearts: true,
        }
    }
}
themes["April Fools"] = {
    priority: 2,
    date: {
        start: { month: 4, day: 1 },
        end: { month: 4, day: 1 },
    },
    screen: {
        queue: {
            border: "2px solid #77ff5c",
            boxShadow: "inset 0 0 10px rgba(130, 255, 92, 0.6), inset 0 0 25px rgba(130, 255, 92, 0.4), 0 0 10px rgba(130, 255, 92, 0.8), 0 0 25px rgba(111, 255, 92, 0.9)",
        },
        banner: {
            imgSrc: "april_fools.png",
        },
        effects: {

        }
    }
}
themes["Halloween"] = {
    priority: 2,
    date: {
        start: { month: 10, day: 1 },
        end: { month: 10, day: 31 },
    },
    screen: {
        queue: {
            border: "2px solid #f57c35",
            boxShadow: "inset 0 0 10px rgba(255, 138, 92, 0.6), inset 0 0 25px rgba(255, 157, 92, 0.4), 0 0 10px rgba(255, 152, 92, 0.8), 0 0 25px rgba(255, 165, 92, 0.9)",
        },
        banner: {
            imgSrc: "halloween.png",
        },
        effects: {

        }
    }
}
themes["New Years"] = {
    priority: 2,
    date: {
        start: { month: 12, day: 31 },
        end: { month: 1, day: 1 },
    },
    screen: {
        queue: {
            border: "2px solid #ffd65c",
            boxShadow: "inset 0 0 10px rgba(255, 214, 92, 0.6), inset 0 0 25px rgba(255, 214, 92, 0.4), 0 0 10px rgba(255, 214, 92, 0.8), 0 0 25px rgba(255, 214, 92, 0.9)",
        },
        banner: {
            imgSrc: "new_years.png",
        },
        effects: {
            fireworks: true,
        }
    }
}


themes["Winter"] = {
    priority: 1,
    date: {
        start: { month: 12, day: 1 },
        end: { month: 2, day: 28 },
    },
    screen: {
        queue: {
        },
        banner: {
            imgSrc: "winter.png",
        },
        effects: {
            snow: true,
        }
    }
}
themes["Summer"] = {
    priority: 1,
    date: {
        start: { month: 6, day: 1 },
        end: { month: 8, day: 31 },
    },
    screen: {
        queue: {
            border: "2px solid #ffd65c",
            boxShadow: "inset 0 0 10px rgba(255, 214, 92, 0.6), inset 0 0 25px rgba(255, 214, 92, 0.4), 0 0 10px rgba(255, 214, 92, 0.8), 0 0 25px rgba(255, 214, 92, 0.9)",
        },
        banner: {
            imgSrc: "summer.png",
        },
        effects: {
        }
    }
}


function checkThemes() {
    let selected_themes = [];
    Object.keys(themes).forEach((key) => {
        let theme = themes[key];
        if (isThemeActive(theme)) selected_themes.push(theme);
    })
    
    if (selected_themes.length === 0) return;

    selected_themes.sort((a,b) => b.priority - a.priority);

    setTheme(selected_themes[0]);
    

}
function isThemeActive(theme, now = new Date()) {
  const m = now.getMonth() + 1; // JS months are 0-based
  const d = now.getDate();

  const { start, end } = theme.date;

  // Same-year range (e.g. July 4 → July 6)
  if (
    start.month < end.month ||
    (start.month === end.month && start.day <= end.day)
  ) {
    return (
      (m > start.month || (m === start.month && d >= start.day)) &&
      (m < end.month   || (m === end.month   && d <= end.day))
    );
  }

  // Cross-year range (e.g. Dec 31 → Jan 1)
  return (
    (m > start.month || (m === start.month && d >= start.day)) ||
    (m < end.month   || (m === end.month   && d <= end.day))
  );
}
function setTheme(theme) {
    currentTheme = theme;
    if (user.type === "screen") {
        let screen = theme.screen;

        if (screen.queue.border) $(".s2_column_b").style.border = screen.queue.border;
        if (screen.queue.boxShadow) $(".s2_column_b").style.boxShadow = screen.queue.boxShadow;

        if (screen.banner.imgSrc) $(".s2_art_display").$("<img").src = "banners/" + screen.banner.imgSrc;

        //Handle Effects

        startThemeEffects();
    }
}


function startThemeEffects() {
    if (currentTheme?.screen?.effects?.fireworks) startFireworks();
    if (currentTheme?.screen?.effects?.snow) startSnow();
    if (currentTheme?.screen?.effects?.hearts) startHearts();
}
function stopThemeEffects() {
    stopFireworks();
    stopSnow();
    stopHearts();
}