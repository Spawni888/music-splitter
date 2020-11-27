<template>
  <main class="home">
    <CoreContainer>
      <section class="about">
        <h1 class="about__title">
          Music Splitter
        </h1>
      </section>
    </CoreContainer>
<!--    <input ref="fileInput" type="file" @change="loadFile">-->
<!--    <button @click="sendFile($refs.fileInput)">send file</button>-->
  </main>
</template>

<script>
import axios from 'axios';
import CoreContainer from '@/components/CoreContainer';

export default {
  name: 'Home',
  metaInfo: {
    // if no subcomponents specify a metaInfo.title, this title will be used
    title: 'Splitter',
  },
  data: () => ({
    showSendBtn: false,
  }),
  computed: {
    music() {
      return this.$refs.fileInput.files[0];
    },
  },
  methods: {
    loadFile() {
      // const file = e.target.files[0];
      // const formData = new FormData();
      //
      // formData.append('music', file);
      // axios.request({
      //   method: 'post',
      //   url: '/splitter',
      //   data: formData,
      //   header: {
      //     'Content-Type': 'multipart/form-data',
      //   },
      // })
      //   .then(res => console.log(res.data));
    },
    sendFile(fileInput) {
      const file = fileInput.files[0];
      const formData = new FormData();

      formData.append('music', file);
      axios.request({
        method: 'post',
        url: '/splitter',
        data: formData,
        header: {
          'Content-Type': 'multipart/form-data',
        },
      })
        .then(res => console.log(res.data));
    },
  },
  components: {
    CoreContainer,
  },
};
</script>
<style scoped lang="scss">
  .home {
    .about {
      &__title {
        color: $coreColor;
      }
    }
  }
</style>
