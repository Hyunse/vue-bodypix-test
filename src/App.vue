<template>
  <div id="app" class="wapper">
    <Video />
  </div>
</template>

<script>
import Video from "./components/Video.vue";

export default {
  name: "App",
  components: {
    Video,
  },
  data() {
    return {
      page: 1,
    };
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  margin-top: 60px;
}
</style>
