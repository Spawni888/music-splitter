<template>
  <main class="home">
    <CoreContainer>
      <section class="about">
        <h1 class="about__title">
          Music Splitter
        </h1>
        <p>
          Do you want to remove vocal from a track?
          <br>
          Or maybe you want to get a vocal of some music mix?
        </p>
        <p>
          Now artificial network can do it for you for free!
        </p>
        <p>
          Just upload your music or pass youtube link for music video
          you want to split.
        </p>
      </section>

      <transition @enter="initPlayers" name="appear" mode="out-in">
        <section key="parsedResult" v-if="parsedResult.length" class="content parsed-result">
          <div class="content__title">Your music was parsed successfully!</div>
          <p class="content__paragraph">It's done! Listen now!</p>
          <div class="parsed-audios" ref="parsedAudios">
            <div
              v-for="{ url, name } in parsedResult"
              :key="'audio' + name"
              class="result-audio"
            >
              <div class="audio-name">{{ name }}</div>
              <div class="audio-case">
                <audio :src="url" />
              </div>
              <CoreButton @click="download(url, name)">Download</CoreButton>
            </div>
          </div>
          <div class="btn-container">
            <CoreButton @click="resetApp">New one</CoreButton>
          </div>
        </section>

        <section :key="parseWaiting" v-else-if="parseWaiting" class="content parser-loading">
          <div class="content__title" >
            Your music is parsing now. Wait a couple of minutes
            <span class="loadingDots"></span>
          </div>
          <p class="content__paragraph">
            You can listen 3 last uploaded tracks while waiting.
          </p>
          <div ref="loadingAudios" class="loading-audios">
            <div
              v-for="link in loadingAudiosLinks"
              :key="link"
              class="audio-case">
              <audio :src="link" />
            </div>
          </div>
        </section>

        <section key="box" v-else class="content">
          <form
            class="box"
            ref="boxForm"
            :class="{
            'drag-and-drop': canDragNDrop,
            'error': errorMsg
          }"
          >
            <div class="box__input">
              <input
                key="boxInput"
                ref="boxInput"
                class="box__file"
                type="file"
                @input="loadFile"
                id="file"
              />
              <label key="boxLabel" ref="boxLabel" for="file">
            <span key="icon" class="icon-container">
              <img src="@/assets/images/upload-icon.png" alt="upload">
            </span>
                <span key="label-text" class="label-text">
              <span class="default">Choose a file</span>
              <span class="box__dragndrop"> or drag it here</span>.
            </span>
                <span :key="errorMsg" v-if="errorMsg" class="error-msg">{{ errorMsg }}</span>
              </label>
            </div>
          </form>
          <form class="youtube">
            <div class="youtube__input">
              <div class="logo-container">
                <div class="logo">
                  <img src="@/assets/images/youtube.svg">
                  <div class="name">YouTube</div>
                </div>
              </div>
              <input type="text" v-model="ytUrl">
            </div>
            <CoreButton @click="loadYTAudio">
              <transition mode="out-in" name="appear">
                <div :key="ytUrlLoading" v-if="ytUrlLoading" class="yt-loader" />
                <div key="Load" v-else>Load</div>
              </transition>
            </CoreButton>
          </form>
          <transition name="appear" mode="out-in" @enter="initDefaultPlayer">
            <div v-show="chosenFile || ytFirebase.originalUrl" class="preplay-container">
              <div class="audio-container">
                <audio class="default-player" ref="defaultPlayer" preload="auto"></audio>
              </div>
              <CoreButton @click="parseFile">
                Parse
              </CoreButton>
            </div>
          </transition>
        </section>
      </transition>

    </CoreContainer>
  </main>
</template>

<script>
import axios from 'axios';
import { gsap, TimelineMax } from 'gsap';
import { TextPlugin } from 'gsap/TextPlugin';
import Plyr from 'plyr';
import CoreContainer from '@/components/CoreContainer';
import CoreButton from '@/components/CoreButton';
import 'plyr/src/sass/plyr.scss';
import firebase from 'firebase/app';
import 'firebase/storage';
import 'firebase/firestore';

gsap.registerPlugin(TextPlugin);

export default {
  name: 'Home',
  metaInfo: {
    // if no subcomponents specify a metaInfo.title, this title will be used
    title: 'Splitter',
  },
  data: () => ({
    ytUrl: '',
    ytUrlLoading: false,
    ytFirebase: {
      originalUrl: null,
      filename: null,
    },
    canDragNDrop: false,
    parseWaiting: false,
    fileLimits: {
      // in MB
      size: 80,
      types: ['audio/wav', 'audio/mpeg'],
    },
    errorMsg: '',
    defaultPlayer: null,
    loadingAudiosLinks: [],
    loadingPlayers: [],
    parsedResult: [],
    resultPlayers: [],
    chosenFile: null,
  }),
  mounted() {
    this.initFirebase();
    this.getLoadingTracks();

    this.initDragNDrop();
  },
  computed: {
    YTUrlIsValid() {
      const YTRegExp = /http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-_]*)(&(amp;)?[\w?=]*)?/gi;

      return YTRegExp.test(this.ytUrl);
    },
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
      // Initialize Firebase
      firebase.initializeApp(firebaseConfig);
    },
    getLoadingTracks() {
      firebase.firestore().collection('music')
        .orderBy('uploadTime', 'desc')
        .limit(3)
        .get()
        .then(snapshot => {
          snapshot.forEach(doc => {
            this.loadingAudiosLinks.push(doc.data().originalUrl);
          });
        });
    },
    initDragNDrop() {
      this.canDragNDrop = (function browserSupportDragNDrop() {
        const div = document.createElement('div');
        return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)) && 'FormData' in window && 'FileReader' in window;
      }());

      if (this.canDragNDrop) {
        const { boxForm } = this.$refs;
        // counter of events to prevent animation cancel;
        let counter = 0;
        this.addMultipleListeners(
          boxForm,
          'drag dragstart dragend dragover dragenter dragleave drop',
          (e) => {
            e.preventDefault();
            e.stopPropagation();
          },
        );

        this.addMultipleListeners(
          boxForm,
          'dragover dragenter',
          () => {
            boxForm.classList.add('is-dragover');
          },
        );
        boxForm.addEventListener('dragenter', () => {
          counter += 1;
        });
        this.addMultipleListeners(
          boxForm,
          'dragleave dragend drop',
          () => {
            counter -= 1;
            if (counter <= 0) {
              boxForm.classList.remove('is-dragover');
            }
          },
        );

        boxForm.addEventListener('drop', this.loadFile);
      }
    },
    addMultipleListeners(el, eventNames, listener) {
      const events = eventNames.split(' ');

      events.forEach(event => el.addEventListener(event, listener));
    },
    checkFile(file) {
      if (!file) return;
      const validType = this.fileLimits.types.find(type => type === file.type);

      this.$refs.boxInput.blur();
      if (validType) {
        // in MB
        const fileSize = ((file.size / 1024) / 1024).toFixed(4);

        if (fileSize > this.fileLimits.size) {
          this.setError(`Max size is ${this.fileLimits.size}MB! Try again!`);
        } else {
          this.errorMsg = '';
          return true;
        }
      } else {
        this.setError('Invalid type. Try again!');
      }
      return false;
    },
    loadFile(e) {
      if (this.ytUrlLoading) {
        this.errorMsg = 'Wait! YouTube audio is loading now!';
        return;
      }

      this.chosenFile = e.dataTransfer
        ? e.dataTransfer.files[0]
        : e.target.files[0];
      const validFile = this.checkFile(this.chosenFile);

      if (validFile) {
        this.$refs.defaultPlayer.src = URL.createObjectURL(this.chosenFile);
        this.ytFirebase.originalUrl = null;
      }
    },
    setError(msg) {
      this.errorMsg = msg;
      this.$refs.defaultPlayer.pause();
    },
    parseFile() {
      if (this.ytFirebase.originalUrl) {
        axios.request({
          method: 'post',
          url: '/api/splitter',
          data: this.ytFirebase,
        })
          .then(({ data }) => {
            this.parseWaiting = false;
            this.parsedResult = data;
          })
          .catch(() => {
            this.parseWaiting = false;
            this.chosenFile = null;
            this.errorMsg = 'Something went wrong with your file.';
          });
      } else {
        const formData = new FormData();

        formData.append('music', this.chosenFile);
        axios.request({
          method: 'post',
          url: '/api/splitter',
          data: formData,
          header: {
            'Content-Type': 'multipart/form-data',
          },
        })
          .then(({ data }) => {
            this.parseWaiting = false;
            this.parsedResult = data;
          })
          .catch(() => {
            this.parseWaiting = false;
            this.chosenFile = null;
            this.errorMsg = 'Something went wrong with your file.';
          });
      }
      this.parseWaiting = true;
    },
    initPlayers() {
      if (this.parseWaiting) {
        // init loading players
        this.$refs.loadingAudios.querySelectorAll('audio').forEach((audioNode) => {
          this.loadingPlayers.push(new Plyr(audioNode));
        });
        this.setPlayersStyle();

        // play only one
        this.playOneSameTime(this.loadingPlayers);

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
      }
      else if (this.parsedResult.length) {
        const audios = this.$refs.parsedAudios.querySelectorAll('audio');

        // init players
        audios.forEach(audioNode => {
          this.resultPlayers.push(new Plyr(audioNode));
        });
        this.setPlayersStyle();
        // allow play only one player same time
        this.playOneSameTime(this.resultPlayers);
      }
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
    download(url, name) {
      const link = document.createElement('a');

      link.setAttribute('download', name);
      link.href = url;
      document.body.appendChild(link);
      link.click();
      link.remove();
    },
    resetApp() {
      this.parsedResult = [];
      this.resultPlayers = [];
      this.loadingAudiosLinks = [];
      this.ytFirebase.originalUrl = null;
      this.chosenFile = null;
      this.getLoadingTracks();
    },
    initDefaultPlayer() {
      // init default player
      this.defaultPlayer = new Plyr(this.$refs.defaultPlayer);
      this.setPlayersStyle();
    },
    setPlayersStyle() {
      const audios = document.body.querySelectorAll('audio');

      audios.forEach(audio => {
        audio.parentNode.style.width = '100%';
        audio.parentNode.style.borderRadius = '8px';
      });
    },
    loadYTAudio() {
      if (this.ytUrlLoading) return;
      if (!this.YTUrlIsValid) {
        this.errorMsg = 'Pass valid YouTube link!';
        return;
      }
      axios.post('/api/splitter/youtube', { ytUrl: this.ytUrl })
        .then(res => {
          this.errorMsg = '';
          this.$refs.defaultPlayer.src = res.data.originalUrl;
          this.ytFirebase = res.data;
          this.chosenFile = null;
          this.ytUrlLoading = false;
        })
        .catch(() => {
          this.errorMsg = 'Try another link.';
          this.ytUrlLoading = false;
        });
      this.errorMsg = '';
      this.ytUrlLoading = true;
    },
  },
  components: {
    CoreContainer,
    CoreButton,
  },
};
</script>
<style scoped lang="scss">
.home {
  height: 100%;
  display: flex;
  flex-direction: column;

  .core-container {
    justify-content: space-between;

    .about {
      margin-right: 48px;
      max-width: 400px;
      //padding-bottom: 32px;

      &__title {
        font-size: 4rem;
        letter-spacing: -.025em;
        line-height: 1.2;
        font-weight: 600;
        color: $coreColor;
        margin: 0 0 24px;
      }

      p {
        font-size: 1rem;
        margin: 0 0 24px;
        text-align: left;
        font-family: 'Gordita Medium', Gordita, Avenir, "Helvetica Neue", sans-serif,
        "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
        line-height: 1.75;
      }
    }

    .content {
      display: flex;
      flex-direction: column;
      width: 50%;
      align-items: center;
      padding-bottom: 1px;
      text-align: center;
      height: 400px;

      .box {
        box-shadow: 0 2px 15px rgba(0, 0, 0, .1);
        margin-bottom: 20px;
        background-color: #2fbbfe;
        transition: .2s ease-in-out;
        //background-color: #25baff;
        //flex: 1;
        border-radius: 10px;
        height: 250px;
        width: 100%;

        &__input {
          height: 100%;
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;

          .icon-container {
            margin-bottom: 10px;

            display: block;
            width: 100%;
            text-align: center;

            img {
              transition: .2s ease-in-out;

              height: auto;
              width: 100%;
              max-width: 80px;
              display: inline-block;
            }
          }

          input {
            width: 0.1px;
            height: 0.1px;
            opacity: 0;
            overflow: hidden;
            position: absolute;
            z-index: -1;
          }

          label {
            width: 100%;
            height: 100%;
            font-size: 1.25rem;
            font-weight: 700;
            color: #EBF9FF;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;

            .label-text {
              display: block;
            }
          }

          input + label:hover {
            cursor: pointer;

            img {
              transform: scale(1.2);
            }
          }
        }

        &__dragndrop,
        &__uploading,
        &__success,
        &__error {
          display: none;
        }
      }

      .error {
        background-color: #ec375c;
      }

      .box.is-dragover {
        label {
          outline: 4px dashed #EBF9FF;
          outline-offset: -15px;
          transition: .2s ease-in-out;

          img {
            transform: scale(1.2);
          }
        }
      }

      .drag-and-drop {
        label {
          outline: 4px dashed #EBF9FF;
          outline-offset: -25px;
          transition: .2s ease-in-out;
        }

        .box__dragndrop {
          display: inline;
        }
      }

      .preplay-container {
        width: 100%;
        display: flex;

        .audio-container {
          box-shadow: 0 2px 15px rgba(0, 0, 0, .1);
          border-radius: 8px;
          width: 100%;
        }

        .core-btn {
          margin-left: 20px;
        }
      }

      &__title {
        color: #5d7790;
        font-size: 2rem;
        line-height: 2.5rem;
        margin-bottom: 40px;
      }

      &-paragraph {
        font-size: 1rem;
        margin: 0 0 24px;
        text-align: left;
        line-height: 1.75;
      }

      .youtube {
        margin-bottom: 20px;

        border-radius: 8px;
        width: 100%;
        display: flex;

        &__input {
          border-radius: 8px;
          display: flex;
          width: 100%;
          box-shadow: 0 2px 15px rgba(0, 0, 0, .1);

          .logo-container {
            text-decoration: none;
            cursor: default;
            border-top-left-radius: 8px;
            border-bottom-left-radius: 8px;
            background-color: #00B3FF;
            display: flex;
            justify-content: center;
            align-items: center;

            .logo {
              display: flex;
              align-items: center;
              padding: 10px;

              .name {
                color: #ffffff;
                font-size: 0.8rem;
              }

              img {
                margin-right: 5px;
                max-width: 20px;
                width: 100%;
                height: auto;
                filter: invert(1);
              }
            }
          }

          input {
            color: #4a5764;
            text-overflow: ellipsis;
            flex: 1;
            padding: 0 10px;
            height: 100%;
            overflow: hidden;
            border-radius: 8px;
            outline: none;
            width: 100%;
            border: none;
          }
        }

        .core-btn {
          margin-left: 20px;
        }
      }
    }

    /* parser-loading */
    .parser-loading {
      height: auto;

      .content__title {
        .loadingDots {
          text-align: start;
          display: inline-block;
          width: 20px;
        }
      }

      .loading-audios {
        width: 100%;

        .audio-case {
          width: 100%;
          margin-bottom: 18px;
          box-shadow: 0 2px 15px rgba(0, 0, 0, 0.1);
          border-radius: 8px;
        }
      }
    }

    // parsed result
    .parsed-result {
      .content__title {
        margin-bottom: 10px;
      }

      .content__paragraph {
        display: none;
        margin-bottom: 0;
      }

      .parsed-audios {
        width: 100%;

        .result-audio {
          display: flex;
          flex-wrap: wrap;

          .audio-name {
            margin: 20px 0 10px;
            flex: 1 1 100%;
          }

          .audio-case {
            box-shadow: 0 2px 15px rgba(0, 0, 0, 0.1);
            border-radius: 8px;

            flex: 1;
            margin-right: 20px;
          }
        }
      }

      .btn-container {
        margin-top: 20px;
        display: flex;
        justify-content: center;
      }
    }
  }
  .yt-loader {
    font-size: 2px;
    margin: 0 auto;
    text-indent: -9999em;
    width: 11em;
    height: 11em;
    border-radius: 50%;
    background: #ffffff;
    background: -moz-linear-gradient(left, #ffffff 10%, rgba(255, 255, 255, 0) 42%);
    background: -webkit-linear-gradient(left, #ffffff 10%, rgba(255, 255, 255, 0) 42%);
    background: -o-linear-gradient(left, #ffffff 10%, rgba(255, 255, 255, 0) 42%);
    background: -ms-linear-gradient(left, #ffffff 10%, rgba(255, 255, 255, 0) 42%);
    background: linear-gradient(to right, #ffffff 10%, rgba(255, 255, 255, 0) 42%);
    position: relative;
    -webkit-animation: load3 1.4s infinite linear;
    animation: load3 1.4s infinite linear;
    -webkit-transform: translateZ(0);
    -ms-transform: translateZ(0);
    transform: translateZ(0);
  }
  .yt-loader:before {
    width: 50%;
    height: 50%;
    background: #ffffff;
    border-radius: 100% 0 0 0;
    position: absolute;
    top: 0;
    left: 0;
    content: '';
  }
  .yt-loader:after {
    background: $coreColor;
    width: 75%;
    height: 75%;
    border-radius: 50%;
    content: '';
    margin: auto;
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
  }
  @-webkit-keyframes load3 {
    0% {
      -webkit-transform: rotate(0deg);
      transform: rotate(0deg);
    }
    100% {
      -webkit-transform: rotate(360deg);
      transform: rotate(360deg);
    }
  }
  @keyframes load3 {
    0% {
      -webkit-transform: rotate(0deg);
      transform: rotate(0deg);
    }
    100% {
      -webkit-transform: rotate(360deg);
      transform: rotate(360deg);
    }
  }
}
</style>
