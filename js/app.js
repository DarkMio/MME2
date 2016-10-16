"use strict";

document.addEventListener('DOMContentLoaded', bootstrap);

function bootstrap() {
    initVideo();
    finish(0);
}


/*
 Basic structure of n-Frames
 + div .videoFrame
 |
 +- video
 |
 +-+ ul .videoControls
 |
 + li (play)
 + li (pause)
 * li (+ / -)
 */
function initVideo() {
    var frames = document.getElementsByClassName('videoFrame');
    for (var i = 0; i < frames.length; i++) {
        var element = frames.item(i);
        setupButtons(element);
    }
    /*
     Basic structure of n-Frames
     + div .videoFrame
     |
     +- video
     |
     +-+ ul .videoControls
     |
     + li (play)
     + li (pause)
     * li (+ / -)
     */


}

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

    video.onended = function () {
        play.innerText = "play_arrow";
    };

    video.onclick = videoPlay;

    play.onclick = videoPlay;

    stop.onclick = function () {
        video.pause();
        video.currentTime = 0;
        play.innerText = "play_arrow"
    };

    backward.onclick = function () {
        var stamp = video.currentTime - (video.duration / 10);
        if (stamp < 0) {
            video.currentTime = 0;
        } else if (stamp > video.duration) {
            video.currentTime = video.duration;
        }
        video.currentTime = stamp;
    };

    forward.onclick = function () {
        var stamp = video.currentTime + (video.duration / 10);
        if (stamp < 0) {
            video.currentTime = 0;
        } else if (stamp > video.duration) {
            video.currentTime = video.duration;
        }
        video.currentTime = stamp;
    };

    fullscreen.onclick = function () {
        if (video.requestFullscreen) {
            video.requestFullscreen();
        } else if (video.mozRequestFullscreen) {
            video.mozRequestFullscreen();
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

function finish(n) {
    var elements = [
        "//i.imgur.com/KnWUMK2.gif", "//i.imgur.com/g2H7ygS.gif", "//i.imgur.com/3yzmA2S.gif",
        "//i.imgur.com/nVJXCxo.gif", "//i.imgur.com/zTeCKbU.gif", "//i.imgur.com/aYMCJFM.gif",
        "//i.imgur.com/RYgqqnr.gif", "//i.imgur.com/EVPBjCu.gif", "//i.imgur.com/azyruE3.gif"
    ];

    var i = new Image;
    i.onload = function() {
        var padding = "padding: " + this.height / 100 * 45 + "px " + this.width / 2 + "px;";
        console.log("%c", padding + "line-height:" + (this.height + 20) + "px; background: none, url(" + this.src + "); color: transparent;");
        console.log("%c> when your js actually works",  'font-size: 20pt;color:#212121;text-shadow:0 1px 0#ccc,0 2px 0  #c9c9c9 ,0 3px 0  #bbb ,0 4px 0  #b9b9b9 ,0 5px 0  #aaa ,0 6px 1px rgba(0,0,0,.1),0 0 5px rgba(0,0,0,.1),0 1px 3px rgba(0,0,0,.3),0 3px 5px rgba(0,0,0,.2),0 5px 10px rgba(0,0,0,.25),0 10px 10px rgba(0,0,0,.2),0 20px 20px rgba(0,0,0,.15);')
    };
    n = n || Math.floor(Math.random() * elements.length);
    i.src = elements[n];
}