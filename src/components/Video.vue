<template>
  <div>
    <button @click="mask">body-pix 1</button>
    <button @click="maskWithBokeh">blur</button>
    <button @click="stop = true">stop</button>
    <br />
    <label for="segmentationThreshold">segmentationThreshold:</label>
    <input
      type="number"
      name="segmentationThreshold"
      min="0.0"
      max="1.0"
      step="0.1"
      v-model="segmentationThreshold"
    />
    <br />
    <div class="flex">
      <video id="myVideo" class="video-js vjs-default-skin" playsinline></video>
      <canvas id="video-canvas" class="video-canvas" ref="output" />
    </div>
  </div>
</template>

<script>
/* eslint-disable */
import "video.js/dist/video-js.css";
import "videojs-record/dist/css/videojs.record.css";
import videojs from "video.js";
import "webrtc-adapter";
import RecordRTC from "recordrtc";
import Record from "videojs-record/dist/videojs.record.js";
import * as bodyPix from "@tensorflow-models/body-pix";

export default {
  data() {
    return {
      segmentationThreshold: 0.7,
      stop: false,
      player: "",
      options: {
        controls: true,
        autoplay: false,
        fluid: false,
        loop: true,
        width: 640,
        height: 480,
        bigPlayButton: false,
        controlBar: {
          volumePanel: false,
          pictureInPictureToggle: false,
          fullscreenToggle: false,
        },
        plugins: {
          // configure videojs-record plugin
          record: {
            audio: false,
            video: {
              // video media constraints: set resolution of camera
              width: 640,
              height: 480,
            },
            debug: true,
          },
        },
      },
    };
  },
  async mounted() {
    /* eslint-disable no-console */
    // this.player = videojs("#myVideo", this.options, () => {
    //   // print version information at startup
    //   var msg =
    //     "Using video.js " +
    //     videojs.VERSION +
    //     " with videojs-record " +
    //     videojs.getPluginVersion("record") +
    //     " and recordrtc " +
    //     RecordRTC.version;
    //   videojs.log(msg);
    // });

    // // device is ready
    // this.player.on("deviceReady", () => {
    //   console.log("device is ready!");
    // });

    // // user clicked the record button and started recording
    // this.player.on("startRecord", () => {
    //   console.log("started recording!");
    // });

    // // user completed recording and stream is available
    // this.player.on("finishRecord", () => {
    //   // the blob object contains the recorded data that
    //   // can be downloaded by the user, stored on server etc.
    //   console.log("finished recording: ", this.player.recordedData);
    // });

    // // error handling
    // this.player.on("error", (element, error) => {
    //   console.warn(error);
    // });

    // this.player.on("deviceError", () => {
    //   console.error("device error:", this.player.deviceErrorCode);
    // });

    const getUserMedia =
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia;

    getUserMedia(
      { video: true, audio: false },
      function (stream) {
        document.getElementById("myVideo").srcObject = stream;
        document.getElementById("myVideo").play();
        console.log("set");
      },
      function (err) {
        console.log("Failed to get local stream", err);
      }
    );

    this.net = await bodyPix.load(/** optional arguments, see below **/);
  },
  beforeDestroy() {
    if (this.player) {
      this.player.dispose();
      this.player;
    }
  },
  methods: {
    mask() {
      this.stop = false;
      this.doBodyPix();
    },
    maskWithBokeh() {
      this.stop = false;
      console.log("bokeh");
      this.bokeh();
    },
    doBodyPix() {
      const canvas = document.getElementById("video-canvas");
      canvas.setAttribute("width", 640);
      canvas.setAttribute("height", 480);
      const video = document.getElementById("myVideo");
      video.setAttribute("width", 640);
      video.setAttribute("height", 480);
      const self = this;
      async function updateFrame() {
        try {
          const segmentation = await self.net.segmentPerson(video, {
            segmentationThreshold: Number(self.segmentationThreshold),
          });
          self.drawMask(segmentation, canvas, video, {
            r: 61,
            g: 220,
            b: 132,
            a: 255,
          });
        } catch (e) {
          console.log(e);
          window.console.log("Retrying...");
        } finally {
          if (self.stop) {
            return;
          }
          requestAnimationFrame(updateFrame);
        }
      }
      updateFrame();
    },
    drawMask(segmentation, canvas, video, color) {
      const mask = bodyPix.toMask(
        segmentation,
        { r: 0, g: 0, b: 0, a: 0 },
        color,
        false
      );
      bodyPix.drawMask(canvas, video, mask, 1.0, 0, false);
    },
    bokeh() {
      const canvas = document.getElementById("video-canvas");
      canvas.setAttribute("width", 640);
      canvas.setAttribute("height", 480);
      const video = document.getElementById("myVideo");
      video.setAttribute("width", 640);
      video.setAttribute("height", 480);
      const self = this;
      async function updateFrame() {
        try {
          const segmentation = await self.net.segmentPerson(video);
          bodyPix.drawBokehEffect(canvas, video, segmentation, 1, 5, false);
        } catch (e) {
          console.log(e);
          window.console.log("Retrying...");
        } finally {
          if (self.stop) {
            return;
          }
          requestAnimationFrame(updateFrame);
        }
      }
      updateFrame();
    },
  },
};
</script>

<style>
.flex {
  display: flex;
  justify-content: center;
  margin: 0 auto;
}
#myVideo {
  width: 640px;
  height: 480px;
  background-color: darkgray;
}
</style>
