<template>
  <section class="splitter__loading loading">
    <div class="loading__title" >
      Your music is parsing now. Wait a couple of minutes
      <span class="loadingDots"></span>
    </div>
    <p class="loading__paragraph">
      You can listen 3 last uploaded tracks while waiting.
    </p>
    <div ref="loadingAudios" class="loading__audios">
      <div
        v-for="link in loadingAudios"
        :key="link"
        class="audio-case"
      >
        <audio :src="link" />
      </div>
    </div>
  </section>
</template>

<script>
import Plyr from 'plyr';
import { gsap, TimelineMax } from 'gsap';
import { TextPlugin } from 'gsap/TextPlugin';

gsap.registerPlugin(TextPlugin);

export default {
  name: 'SplitterLoading',
  props: {
    loadingAudios: {
      type: Array,
      required: true,
    },
  },
  mounted() {
    this.initPlayers();
  },
  methods: {
    initPlayers() {
      // init loading players
      const loadingPlayers = [];
      this.$refs.loadingAudios.querySelectorAll('audio').forEach(audioNode => {
        loadingPlayers.push(new Plyr(audioNode));
      });

      this.$emit('play-one-same-time', loadingPlayers);
      this.$emit('set-players-style');

      // dots animation
      const dots = new TimelineMax({
        paused: true,
        repeat: -1,
        repeatDelay: 0.5,
      })
        .to('.loadingDots', 0.3, { text: ' .' })
        .to('.loadingDots', 0.3, { text: ' ..' })
        .to('.loadingDots', 0.3, { text: ' ...' });

      dots.play();
    },
  },
};
</script>

<style scoped lang="scss">
.loading {
  height: auto;

  &__title {
    color: #5d7790;
    font-size: 2rem;
    line-height: 2.5rem;
    margin-bottom: 40px;
    .loadingDots {
      text-align: start;
      display: inline-block;
      width: 20px;
    }
  }

  &__paragraph {
    font-size: 1rem;
    margin: 0 0 24px;
    text-align: left;
    line-height: 1.75;
  }

  .loading__audios {
    width: 100%;

    .audio-case {
      width: 100%;
      margin-bottom: 18px;
      box-shadow: 0 2px 15px rgba(0, 0, 0, 0.1);
      border-radius: 8px;
    }
  }
}
</style>
