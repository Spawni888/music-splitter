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

      <transition @enter="initLoadingPlayers" name="appear" mode="out-in">
        <div v-if="parseWaiting" class="content parser-loading">
          <div class="title">
            Your music is parsing now. Wait a couple of minutes.
          </div>
          <div ref="loadingAudios" class="audio-container">
            <audio />
            <audio />
            <audio />
          </div>
        </div>

        <section v-else class="content">
          <form
            class="box"
            ref="boxForm"
            :class="{
            'drag-and-drop': canDragNDrop,
            'error': errorMsg
          }"
          >
            <transition-group name="appear" tag="div" mode="in-out" class="box__input">
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
            </transition-group>
          </form>
          <transition name="appear" mode="out-in">
            <div v-show="defaultPlayer.enabled" class="preplay-container">
              <div class="audio-container">
                <audio class="default-player" ref="defaultPlayer" preload="auto"></audio>
              </div>
              <CoreButton @click="parseFile">Parse</CoreButton>
            </div>
          </transition>
        </section>
      </transition>

    </CoreContainer>
  </main>
</template>

<script>
import axios from 'axios';
import Plyr from 'plyr';
import CoreContainer from '@/components/CoreContainer';
import CoreButton from '@/components/CoreButton';
import 'plyr/src/sass/plyr.scss';
import firebase from 'firebase/app';
import 'firebase/storage';
import 'firebase/firestore';

export default {
  name: 'Home',
  metaInfo: {
    // if no subcomponents specify a metaInfo.title, this title will be used
    title: 'Splitter',
  },
  data: () => ({
    canDragNDrop: false,
    parseWaiting: false,
    fileLimits: {
      // in MB
      size: 80,
      types: ['audio/wav', 'audio/mpeg'],
    },
    errorMsg: '',
    defaultPlayer: {
      enabled: false,
    },
    loadingAudiosLinks: [],
    loadingPlayers: [],
    playersControls: ['play', 'progress', 'duration', 'mute', 'volume'],
  }),
  computed: {
    music() {
      return this.$refs.fileInput.files[0];
    },
  },
  mounted() {
    this.initFirebase();

    // init default player
    this.defaultPlayer = Object.assign(
      this.defaultPlayer, new Plyr(this.$refs.defaultPlayer, {
        controls: this.playersControls,
      }),
    );

    this.initDragNDrop();
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

      firebase.firestore().collection('music')
        .orderBy('uploadTime')
        .limit(3)
        .get()
        .then(snapshot => {
          snapshot.forEach(doc => {
            this.loadingAudiosLinks.push(doc.data().coreUrl);
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
      const file = e.dataTransfer
        ? e.dataTransfer.files[0]
        : e.target.files[0];
      const validFile = this.checkFile(file);

      if (validFile) {
        this.defaultPlayer.enabled = true;
        this.$refs.defaultPlayer.src = URL.createObjectURL(file);
        this.$refs.defaultPlayer.parentNode.style.width = '100%';
        this.$refs.defaultPlayer.parentNode.style.borderRadius = '8px';
      }
    },
    setError(msg) {
      this.errorMsg = msg;
      this.defaultPlayer.enabled = false;
      this.$refs.defaultPlayer.pause();
    },
    parseFile() {
      const file = this.$refs.boxInput.files[0];
      const formData = new FormData();

      formData.append('music', file);
      console.log(axios);
      // axios.request({
      //   method: 'post',
      //   url: '/api/splitter',
      //   data: formData,
      //   header: {
      //     'Content-Type': 'multipart/form-data',
      //   },
      // })
      //   .then(res => console.log(res.data))
      //   .catch(() => {
      //     this.parseWaiting = false;
      //     this.errorMsg = 'Something went wrong with your file.';
      //   });

      this.parseWaiting = true;
    },
    initLoadingPlayers() {
      this.$refs.loadingAudios.childNodes.forEach((audioNode, i) => {
        console.log(1);
        audioNode.src = this.loadingAudiosLinks[i];
        this.loadingPlayers.push(new Plyr(audioNode), {
          controls: this.playersControls,
        });
      });

      // play only one
      this.loadingPlayers.forEach(player => {
        player.on('play', () => {
          // player.elements.container.classList.add('player-expand');
          this.loadingPlayers.forEach(otherPlayer => {
            if (otherPlayer !== player && otherPlayer.playing) {
              otherPlayer.pause();
            }
          });
          // player.toggleControls('progress');
        });
        // player.addEventListener('pause', () => {
        //   if (!player.seeking) {
        //     player.elements.container.classList.remove('player-expand');
        //   }
        // });
      });

      // const playButtons = document.querySelectorAll('.play-button');
      // playButtons.forEach(playButton => {
      //   playButton.addEventListener('click', event => {
      //     event.preventDefault();
      //     console.log(playButton.parentNode.querySelector('.audio-player'));
      //     const player = playButton.parentNode.querySelector('.plyr');
      //     player.style.display = 'block';
      //     playButton.style.opacity = 0;
      //   });
      // });
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
      padding-bottom: 32px;

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
        box-shadow: 0 2px 15px rgba(0,0,0,.1);
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
          box-shadow: 0 2px 15px rgba(0,0,0,.1);
          border-radius: 8px;
          width: 100%;
        }
        .core-btn {
          margin-left: 20px;
        }
      }
    }
  }
  .loader {
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    .lds-roller {
      display: inline-block;
      position: relative;
      width: 80px;
      height: 80px;
    }
    .lds-roller div {
      animation: lds-roller 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
      transform-origin: 40px 40px;
    }
    .lds-roller div:after {
      content: " ";
      display: block;
      position: absolute;
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #fff;
      margin: -4px 0 0 -4px;
    }
    .lds-roller div:nth-child(1) {
      animation-delay: -0.036s;
    }
    .lds-roller div:nth-child(1):after {
      top: 63px;
      left: 63px;
    }
    .lds-roller div:nth-child(2) {
      animation-delay: -0.072s;
    }
    .lds-roller div:nth-child(2):after {
      top: 68px;
      left: 56px;
    }
    .lds-roller div:nth-child(3) {
      animation-delay: -0.108s;
    }
    .lds-roller div:nth-child(3):after {
      top: 71px;
      left: 48px;
    }
    .lds-roller div:nth-child(4) {
      animation-delay: -0.144s;
    }
    .lds-roller div:nth-child(4):after {
      top: 72px;
      left: 40px;
    }
    .lds-roller div:nth-child(5) {
      animation-delay: -0.18s;
    }
    .lds-roller div:nth-child(5):after {
      top: 71px;
      left: 32px;
    }
    .lds-roller div:nth-child(6) {
      animation-delay: -0.216s;
    }
    .lds-roller div:nth-child(6):after {
      top: 68px;
      left: 24px;
    }
    .lds-roller div:nth-child(7) {
      animation-delay: -0.252s;
    }
    .lds-roller div:nth-child(7):after {
      top: 63px;
      left: 17px;
    }
    .lds-roller div:nth-child(8) {
      animation-delay: -0.288s;
    }
    .lds-roller div:nth-child(8):after {
      top: 56px;
      left: 12px;
    }
    @keyframes lds-roller {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }
  }
}
/* parser-loading */
.parser-loading {
  .title {
    color: #5d7790;
    font-size: 2rem;
    line-height: 2.5rem;
  }
}
</style>
