<template>
<div class="about">
  {{ name }}
</div>
</template>

<script>
export default {
  name: 'About',
  metaInfo: {
    // if no subcomponents specify a metaInfo.title, this title will be used
    title: 'Prerender Info',
  },
  data: () => ({
    name: 'About',
  }),
};
</script>

<style scoped>

</style>
