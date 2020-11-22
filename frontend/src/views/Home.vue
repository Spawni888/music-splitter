<template>
  <div class="home">
    <input ref="fileInput" type="file" @change="loadFile">
    <button @click="sendFile">send file</button>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'Home',
  data: () => ({
    showSendBtn: false,
  }),
  computed: {
    music() {
      return this.$refs.fileInput.files[0];
    },
  },
  methods: {
    loadFile(e) {
      const file = e.target.files[0];
      // axios.request({
      //   method: 'post',
      //   url: '/splitter',
      //   data: file,
      //   header: {
      //     'Content-Type': file.type,
      //   },
      // })
      //   .then(res => console.log(res.data));
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
    sendFile() {
      console.log(this.music);
      const formData = new FormData();

      formData.append('music', this.music);
      axios.request({
        method: 'post',
        url: '/splitter',
        data: formData,
      });
    },
  },
  components: {
  },
};
</script>
<style scoped lang="scss">

</style>
