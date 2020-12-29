<template>
  <transition name="appear" mode="out-in" @enter="showErrors">
    <SplitterResult
      v-if="splitResult.length"
      key="splitResult"
      class="content"
      :split-result="splitResult"
      @set-players-style="setPlayersStyle"
      @play-one-same-time="playOneSameTime"
      @reset-app="resetApp"
    />

    <SplitterLoading
      v-else-if="audioIsSplitting"
      :key="audioIsSplitting"
      class="content"
      @set-players-style="setPlayersStyle"
      @play-one-same-time="playOneSameTime"
      :loading-audios="loadingAudios"
    />

    <SplitterPreload
      v-else
      ref="splitterPreload"
      key="box"
      class="content"
      @set-players-style="setPlayersStyle"
      @split-audio="splitAudio"
     />
  </transition>
</template>

<script>
import SplitterResult from '@/components/splitter/SplitterResult';
import SplitterLoading from '@/components/splitter/SplitterLoading';
import SplitterPreload from '@/components/splitter/SplitterPreload';
import axios from 'axios';
import 'plyr/src/sass/plyr.scss';
import firebase from 'firebase/app';
import 'firebase/storage';
import 'firebase/firestore';

export default {
  name: 'SplitterContent',
  data: () => ({
    audioIsSplitting: false,
    loadingAudios: [],
    splitResult: [],
    errorMsg: null,
  }),
  mounted() {
    this.initFirebase();
    this.getLoadingAudios();
  },
  methods: {
    initFirebase() {
      const firebaseConfig = {
        apiKey: 'AIzaSyBZzV-ERo3e3HfwiTyS1J-dZA1g6ae6-tc',
        authDomain: 'sound-whale.firebaseapp.com',
        databaseURL: 'https://sound-whale.firebaseio.com',
        projectId: 'sound-whale',
        storageBucket: 'sound-whale.appspot.com',
        messagingSenderId: '588528124575',
        appId: '1:588528124575:web:c09f9aec159d37be40d8aa',
      };
      firebase.initializeApp(firebaseConfig);
    },
    getLoadingAudios() {
      firebase.firestore().collection('music')
        .orderBy('uploadTime', 'desc')
        .limit(3)
        .get()
        .then(snapshot => {
          snapshot.forEach(doc => {
            this.loadingAudios.push(doc.data().originalUrl);
          });
        });
    },
    splitAudio(ytAudioInfo, chosenFile) {
      if (ytAudioInfo.originalUrl) {
        axios.request({
          method: 'post',
          url: '/api/splitter',
          data: ytAudioInfo,
        })
          .then(({ data }) => {
            this.audioIsSplitting = false;
            this.splitResult = data;
          })
          .catch(() => {
            this.audioIsSplitting = false;
            this.$refs.splitterPreload.showError('Something went wrong with your file.');
          });
      } else {
        const formData = new FormData();

        formData.append('music', chosenFile);
        axios.request({
          method: 'post',
          url: '/api/splitter',
          data: formData,
          header: {
            'Content-Type': 'multipart/form-data',
          },
        })
          .then(({ data }) => {
            this.audioIsSplitting = false;
            this.splitResult = data;
          })
          .catch(() => {
            this.audioIsSplitting = false;
            this.errorMsg = 'Something went wrong with your file.';
          });
      }
      this.audioIsSplitting = true;
    },
    playOneSameTime(players) {
      players.forEach(player => {
        player.on('play', () => {
          players.forEach(otherPlayer => {
            if (otherPlayer !== player && otherPlayer.playing) {
              otherPlayer.pause();
            }
          });
        });
      });
    },
    resetApp() {
      this.splitResult = [];
      this.loadingAudios = [];
      this.getLoadingAudios();
    },
    setPlayersStyle() {
      const audios = document.body.querySelectorAll('audio');

      audios.forEach(audio => {
        audio.parentNode.style.width = '100%';
        audio.parentNode.style.borderRadius = '8px';
      });
    },
    showErrors() {
      if (this.errorMsg) {
        this.$refs.splitterPreload.showError(this.errorMsg);
        this.errorMsg = null;
      }
    },
  },
  components: {
    SplitterResult,
    SplitterPreload,
    SplitterLoading,
  },
};
</script>

<style scoped lang="scss">
.content {
  z-index: 1;
  display: flex;
  flex-direction: column;
  width: 50%;
  align-items: center;
  padding-bottom: 1px;
  text-align: center;
  height: 400px;

  @media (max-width: 910px) {
    width: 100%;
  }
  @media (max-width: 576px) {
    width: 100%;
    height: auto;
  }
}
</style>
