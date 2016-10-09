"use strict";

window.onload = function() {
    initVideo();
    console.log("Done.");
};


function initVideo() {
    var videos = document.getElementsByTagName('video');
    console.log(videos);
    for(var i = 0; i < videos.length; i++) {
        var video = videos.item(i);
        video.onclick = function(){
            console.log(this);
            if(this.paused) {
                this.play();
                this.parentNode.className = "videoItem play";
            } else {
                this.pause();
                this.parentNode.className = "videoItem pause";
            }
        };

        video.parentNode.className = "videoItem pause";
    }
}