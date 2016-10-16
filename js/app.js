"use strict";

window.onload = function() {
    initVideo2();
    console.log("Done.");
};


function initVideo2() {
    var frames = document.getElementsByClassName('videoFrame');
    for(var i = 0; i < frames.length; i++) {
        var element = frames.item(i);
        setupVideo(element);
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

function setupVideo(element) {
    var video = element.getElementsByTagName("video")[0];
    console.log(video);
    video.onclick = function() {
        if (this.paused) {
            this.play();
            // this.parentNode.className = "videoItem play";
        } else {
            this.pause();
            // this.parentNode.className = "videoItem pause";
        }
    }
}


function setupButtons(element) {
    var video = element.getElementsByTagName("video")[0];
    var play = element.getElementsByClassName("ic-play")[0];
    var stop = element.getElementsByClassName("ic-stop")[0];
    var progressBar = element.getElementsByClassName("progress")[0];
    var backward = element.getElementsByClassName("ic-step-backward")[0];
    var forward = element.getElementsByClassName("ic-step-forward")[0];
    var fullscreen = element.getElementsByClassName("ic-full-screen")[0];

    var videoPlay = function() {
        if(video.paused) {
            video.play();
            play.className = "ic ic-pause";
        } else {
            video.pause();
            play.className = "ic ic-play";
        }
    };

    video.onended = function() {
        play.className = "ic ic-play";
    };

    video.onclick = videoPlay;

    play.onclick = videoPlay;

    stop.onclick = function() {
        video.pause();
        video.currentTime = 0;
        play.className = "ic ic-play";
    };

    backward.onclick = function() {
        var stamp = video.currentTime - (video.duration / 10);
        if(stamp < 0) {
            video.currentTime = 0;
        } else if (stamp > video.duration) {
            video.currentTime = video.duration;
        }
        video.currentTime = stamp;
    };

    forward.onclick = function() {
        var stamp = video.currentTime + (video.duration / 10);
        if(stamp < 0) {
            video.currentTime = 0;
        } else if (stamp > video.duration) {
            video.currentTime = video.duration;
        }
        video.currentTime = stamp;
    };

    fullscreen.onclick = function() {
        if(video.requestFullscreen) {
            video.requestFullscreen();
        } else if(video.mozRequestFullscreen) {
            video.mozRequestFullscreen();
        } else if(video.webkitRequestFullscreen) {
            video.webkitRequestFullscreen();
        } else if(video.msRequestFullscreen) {
            video.msRequestFullscreen();
        }
    };

    /* To justify myself, in case someone reads that:
       There is an ontimeupdate event, but it's restricted to update between 4hz and 66hz (sic!), based on the
       event loop timing of the DOM. In most browsers this sucks ass and looks super choppy. So, what do we do?
       We just update that every 33ms - which makes it look smooth.
     */
    setInterval(function() {
        progressBar.style.width = video.currentTime / video.duration * 100 + "%";
    }, 33)
}