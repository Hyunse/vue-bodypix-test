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
      <video id="myVideo" class="default-skin" playsinline></video>
      <canvas id="video-canvas" class="video-canvas" ref="output" />
    </div>
  </div>
</template>

<script>
/* eslint-disable */
import "webrtc-adapter";
import "@tensorflow/tfjs";
import * as bodyPix from "@tensorflow-models/body-pix";

export default {
  data() {
    return {
      net: {},
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
      let segmentation;
      const updateFrame = async () => {
        try {
          segmentation = await this.net.segmentPerson(video);
          bodyPix.drawBokehEffect(canvas, video, segmentation, 3, 7, false);
        } catch (e) {
          console.log(e);
          window.console.log("Retrying...");
        } finally {
          if (this.stop) {
            return;
          }
          requestAnimationFrame(updateFrame);
        }
      };
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