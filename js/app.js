"use strict";

document.addEventListener('DOMContentLoaded', bootstrap);

/**
 * Once all html markup is loaded (post load) methods.
 */
function bootstrap() {
    initVideo();
    finish();
}


/**
 * Searches for all video frames (declared as such in its class) and sets up those.
 */
function initVideo() {
    var frames = document.getElementsByClassName('videoFrame');
    for (var i = 0; i < frames.length; i++) {
        var element = frames.item(i);
        setupButtons(element);
    }
}

/**
 * Give it a video frame and this wires up the buttons up.
 * @param element a HTML markup of class "videoFrame"
 */
function setupButtons(element) {
    var video = element.getElementsByTagName("video")[0];
    var play = element.getElementsByClassName("play")[0];
    var stop = element.getElementsByClassName("stop")[0];
    var progressBar = element.getElementsByClassName("progress")[0];
    var backward = element.getElementsByClassName("previous")[0];
    var forward = element.getElementsByClassName("next")[0];
    var fullscreen = element.getElementsByClassName("fullscreen")[0];

    var videoPlay = function () {
        if (video.paused) {
            video.play();
            play.innerText = "pause"
        } else {
            video.pause();
            play.innerText = "play_arrow"
        }
    };

    play.onclick = videoPlay;
    video.onclick = videoPlay;
    video.onended = function () {
        play.innerText = "play_arrow";
    };

    stop.onclick = function () {
        video.pause();
        video.currentTime = 0;
        play.innerText = "play_arrow"
    };

    var timeSkip = function (operation) {
        var stamp = operation(video.currentTime, video.duration / 10);
        if (stamp < 0) {
            video.currentTime = 0;
        } else if (stamp > video.duration) {
            video.currentTime = video.duration;
        }
        video.currentTime = stamp;
    };

    backward.onclick = function () {
        timeSkip(function (left, right) {
            return left - right
        })
    };

    forward.onclick = function () {
        timeSkip(function (left, right) {
            return left + right
        })
    };

    fullscreen.onclick = function () {
        // a fall through method to try fullscreen in various browsers - note the capital S in moz/firefox.
        if (video.requestFullscreen) {
            video.requestFullscreen();
        } else if (video.mozRequestFullScreen) {
            video.mozRequestFullScreen();
        } else if (video.webkitRequestFullscreen) {
            video.webkitRequestFullscreen();
        } else if (video.msRequestFullscreen) {
            video.msRequestFullscreen();
        }
    };

    /* To justify myself, in case someone reads that:
     There is an ontimeupdate event, but it's restricted to update between 4hz and 66hz (sic!), based on the
     event loop timing of the DOM. In most browsers this sucks ass and looks super choppy. So, what do we do?
     We just update that every 33ms - which makes it look smooth.
     */
    setInterval(function () {
        progressBar.style.width = video.currentTime / video.duration * 100 + "%";
    }, 33)
}

/**
 * Prints into the developer console that the operation finished.
 * @param n An integer for debugging purposes - selects a certain element.
 */
function finish(n) {
    var elements = [
        "//i.imgur.com/KnWUMK2.gif", "//i.imgur.com/g2H7ygS.gif", "//i.imgur.com/3yzmA2S.gif",
        "//i.imgur.com/nVJXCxo.gif", "//i.imgur.com/zTeCKbU.gif", "//i.imgur.com/aYMCJFM.gif",
        "//i.imgur.com/RYgqqnr.gif", "//i.imgur.com/EVPBjCu.gif", "//i.imgur.com/azyruE3.gif"
    ];

    var i = new Image;
    i.onload = function () {
        var padding = "padding: " + this.height / 100 * 45 + "px " + this.width / 2 + "px;";
        console.log(
            "%c",
            padding + "line-height:" + (this.height + 20) + "px; background: none, url(" + this.src + "); " +
            "color: transparent;");
        console.log(
            "%c> when your js actually works",
            'font-size: 20pt;color:#212121;text-shadow:0 1px 0#ccc,0 2px 0  #c9c9c9 ,0 3px 0  #bbb ,0 4px 0 ' +
            ' #b9b9b9 ,0 5px 0  #aaa ,0 6px 1px rgba(0,0,0,.1),0 0 5px rgba(0,0,0,.1),0 1px 3px rgba(0,0,0,.3),0' +
            ' 3px 5px rgba(0,0,0,.2),0 5px 10px rgba(0,0,0,.25),0 10px 10px rgba(0,0,0,.2),0 20px 20px ' +
            'rgba(0,0,0,.15);'
        )
    };
    n = n || Math.floor(Math.random() * elements.length);
    i.src = elements[n];
}