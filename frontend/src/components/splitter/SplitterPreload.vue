<template>
  <section class="splitter__preload">
    <form
      class="box"
      ref="boxForm"
      :class="{
            'drag-and-drop': canDragNDrop,
            'box__error': highlightError
          }"
    >
      <div class="box__input">
        <input
          key="boxInput"
          ref="boxInput"
          class="box__file"
          type="file"
          @input="loadFile"
          id="boxFile"
        />
        <label key="boxLabel" ref="boxLabel" for="boxFile">
          <span key="icon" class="icon-container">
            <img src="@/assets/images/upload-icon.png" alt="upload">
          </span>
          <span key="label-text" class="label-text">
            <span class="default">Choose a file</span>
            <span class="box__dragndrop"> or drag it here</span>.
          </span>
          <span :key="errorMsg" v-if="highlightError" class="error-msg">{{ errorMsg }}</span>
        </label>
      </div>
    </form>

    <form class="youtube">
      <div class="youtube__input">
        <div class="logo-container">
          <div class="logo">
            <img src="@/assets/images/youtube.svg" alt="youtube">
            <div class="logo__name">YouTube</div>
          </div>
        </div>
        <input type="text" v-model="ytUrl">
      </div>
      <CoreButton @click="loadYtAudio" class="youtube__btn">
        <transition mode="out-in" name="appear">
          <div :key="ytAudioIsLoading" v-if="ytAudioIsLoading" class="youtube__loader" />
          <div key="Load" v-else>Load</div>
        </transition>
      </CoreButton>
    </form>

    <transition name="appear" mode="out-in" @enter="initDefaultPlayer">
      <div v-show="chosenFile || ytAudioInfo.originalUrl" class="preplay">
        <div class="preplay__audio">
          <audio ref="defaultPlayer" />
        </div>
        <CoreButton @click="splitAudio">
          Parse
        </CoreButton>
      </div>
    </transition>
  </section>
</template>

<script>
import axios from 'axios';
import CoreButton from '@/components/CoreButton';
import Plyr from 'plyr';
import { mapActions } from 'vuex';

export default {
  name: 'SplitterPreload',
  data: () => ({
    ytUrl: '',
    ytAudioInfo: {
      originalUrl: null,
      filename: null,
    },
    ytAudioIsLoading: false,
    canDragNDrop: false,
    fileLimits: {
      // in MB
      size: 80,
      types: ['audio/wav', 'audio/mpeg'],
    },
    errorMsg: '',
    highlightError: false,
    defaultPlayer: null,
    chosenFile: null,
  }),
  mounted() {
    this.initDragNDrop();
  },
  computed: {
    YTUrlIsValid() {
      const YTRegExp = /http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-_]*)(&(amp;)?[\w?=]*)?/gi;

      return YTRegExp.test(this.ytUrl);
    },
  },
  methods: {
    ...mapActions([
      'initAudioVisual',
    ]),
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
    showError(msg) {
      this.chosenFile = null;
      this.ytAudioInfo = { originalUrl: null, filename: null };
      this.errorMsg = msg;
      this.highlightError = true;
      this.$refs.defaultPlayer.pause();
    },
    checkFile(file) {
      if (!file) return;
      const validType = this.fileLimits.types.find(type => type === file.type);

      this.$refs.boxInput.blur();
      if (validType) {
        // in MB
        const fileSize = ((file.size / 1024) / 1024).toFixed(4);

        if (fileSize > this.fileLimits.size) {
          this.showError(`Max size is ${this.fileLimits.size}MB! Try again!`);
        } else {
          this.highlightError = false;
          return true;
        }
      } else {
        this.showError('Invalid type. Try again!');
      }
      return false;
    },
    loadFile(e) {
      if (this.ytAudioIsLoading) {
        this.showError('Wait! YouTube audio is loading now!');
        return;
      }

      this.chosenFile = e.dataTransfer
        ? e.dataTransfer.files[0]
        : e.target.files[0];
      const validFile = this.checkFile(this.chosenFile);

      if (validFile) {
        this.$refs.defaultPlayer.src = URL.createObjectURL(this.chosenFile);
        this.ytAudioInfo.originalUrl = null;
      }
    },
    splitAudio() {
      this.$emit('split-audio', this.ytAudioInfo, this.chosenFile);
    },
    initDefaultPlayer() {
      this.defaultPlayer = new Plyr(this.$refs.defaultPlayer);
      this.$emit('set-players-style');
      this.defaultPlayer.play();
    },
    loadYtAudio() {
      if (this.ytAudioIsLoading) return;
      if (!this.YTUrlIsValid) {
        this.showError('Pass valid YouTube link!');
        return;
      }
      axios.post('/api/splitter/youtube', { ytUrl: this.ytUrl })
        .then(res => {
          this.ytAudioInfo = res.data;
          this.$refs.defaultPlayer.src = res.data.originalUrl;
          this.highlightError = false;
          this.chosenFile = null;
          this.ytAudioIsLoading = false;
        })
        .catch(() => {
          this.showError('Try another link.');
          this.ytAudioIsLoading = false;
        });
      this.highlightError = false;
      this.ytAudioIsLoading = true;
    },
  },
  components: {
    CoreButton,
  },
};
</script>

<style scoped lang="scss">
.splitter__preload {
  .box {
    box-shadow: 0 2px 15px rgba(0, 0, 0, .1);
    margin-bottom: 20px;
    background-color: #2fbbfe;
    transition: .2s ease-in-out;
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

    &__error {
      background-color: #ec375c;
    }
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

          &__name {
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
    &__loader {
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
    &__loader:before {
      width: 50%;
      height: 50%;
      background: #ffffff;
      border-radius: 100% 0 0 0;
      position: absolute;
      top: 0;
      left: 0;
      content: '';
    }
    &__loader:after {
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

    .youtube__btn {
      margin-left: 20px;
    }
  }

  .preplay {
    width: 100%;
    display: flex;
    &__audio {
      box-shadow: 0 2px 15px rgba(0, 0, 0, .1);
      border-radius: 8px;
      width: 100%;
    }

    .core-btn {
      margin-left: 20px;
    }
  }
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
</style>
