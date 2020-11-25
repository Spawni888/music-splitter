<template>
  <div class="home">
    <input ref="fileInput" type="file" @change="loadFile">
    <button @click="sendFile($refs.fileInput)">send file</button>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'Home',
  metaInfo: {
    // if no subcomponents specify a metaInfo.title, this title will be used
    title: 'Default Title',
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
  components: {},
};
</script>
<style scoped lang="scss">

</style>
