"use strict";

window.onload = function() {
    initVideo();
    console.log("Done.");
};


function initVideo2() {
    var frames = document.getElementsByClassName('videoFrame');
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


function iterator(iterable) {
    // @TODO: check for iteration first

    var iterable = iterable;
    var count = 0;
    var max = iterable.length;
    return {
        next: function() {
            if(count >= max) {
                return null;
            }
            return iterable[count++];
        }
    }
}

function initVideo() {
    var videos = document.getElementsByTagName('video');
    console.log(videos);
    for(var i = 0; i < videos.length; i++) {
        var video = videos.item(i);
        video.onclick = function(){
            if(this.paused) {
                this.play();
                // this.parentNode.className = "videoItem play";
            } else {
                this.pause();
                // this.parentNode.className = "videoItem pause";
            }
        };

        // video.parentNode.className = "videoItem pause";
    }
}