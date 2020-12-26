<template>
  <section class="splitter__result result">
    <div class="result__title">Your music was parsed successfully!</div>
    <p class="result__paragraph">It's done! Listen now!</p>
    <div class="result__audios" ref="parsedAudios">
      <div
        v-for="{ url, name } in splitResult"
        :key="'audio' + name"
        class="audio"
      >
        <div class="audio__name">{{ name }}</div>
        <div class="audio__case">
          <audio :src="url" />
        </div>
        <CoreButton class="download-btn" @click="download(url, name)">Download</CoreButton>
      </div>
    </div>
    <div class="result__btn-case">
      <CoreButton @click="resetApp">New one</CoreButton>
    </div>
  </section>
</template>

<script>
import CoreButton from '@/components/CoreButton';
import Plyr from 'plyr';

export default {
  name: 'SplitterResult',
  props: {
    splitResult: {
      type: Array,
      required: true,
    },
  },
  mounted() {
    this.initPlayers();
  },
  methods: {
    initPlayers() {
      const audios = this.$refs.parsedAudios.querySelectorAll('audio');

      // init players
      const resultPlayers = [];
      audios.forEach(audioNode => {
        resultPlayers.push(new Plyr(audioNode));
      });
      this.$emit('set-players-style');
      // allow play only one player same time
      this.$emit('play-one-same-time', resultPlayers);
      this.syncPlayersTime(resultPlayers);
    },
    syncPlayersTime(players) {
      players.forEach(player => {
        player.on('timeupdate', () => {
          if (player.playing) {
            players.forEach(otherPlayer => {
              if (otherPlayer !== player) {
                otherPlayer.currentTime = player.currentTime;
              }
            });
          }
        });
      });
    },
    download(url, name) {
      const link = document.createElement('a');

      link.setAttribute('download', name);
      link.href = url;
      document.body.appendChild(link);
      link.click();
      link.remove();
    },
    resetApp() {
      this.$emit('reset-app');
    },
  },
  components: {
    CoreButton,
  },
};
</script>

<style scoped lang="scss">
// parsed result
.result {
  &__title {
    color: #5d7790;
    font-size: 2rem;
    line-height: 2.5rem;
    margin-bottom: 10px;
    @media (max-width: 576px) {
      margin-bottom: 0;
    }
    .loadingDots {
      text-align: start;
      display: inline-block;
      width: 20px;
    }
  }

  &__paragraph {
    display: none;
    font-size: 1rem;
    margin: 0;
    text-align: left;
    line-height: 1.75;
  }

  &__audios {
    width: 100%;

    .audio {
      display: flex;
      flex-wrap: wrap;

      &__name {
        margin: 20px 0 10px;
        flex: 1 1 100%;
      }

      &__case {
        box-shadow: 0 2px 15px rgba(0, 0, 0, 0.1);
        border-radius: 8px;

        flex: 1;
        margin-right: 20px;
        @media (max-width: 576px) {
          margin-right: 10px;
        }
      }
      .download-btn {
        @media (max-width: 576px) {
          padding: 7px;
        }
      }
    }
  }

  &__btn-case {
    margin-top: 20px;
    display: flex;
    justify-content: center;
  }
}
</style>
