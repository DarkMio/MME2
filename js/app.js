"use strict";

document.addEventListener('DOMContentLoaded', bootstrap);

function bootstrap() {
    initVideo();
    console.log(
        "%c ᕕ(˵•̀෴•́˵)ᕗ",
        'font-size: 15pt; padding: 75px 55px; line-height: 205px; ' +
        'background: none,url(http://i.imgur.com/KnWUMK2.gif); color: rgba(255, 255, 255, 0.8);'
    )

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