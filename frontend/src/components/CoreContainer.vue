<template>
  <div class="core-container">
    <slot />
  </div>
</template>

<script>
export default {
  name: 'CoreContainer',
};
</script>

<style scoped lang="scss">
  .core-container {
    margin: 0 auto;
    padding: 16px;
    display: flex;
    align-items: center;
    max-width: 1260px;
  }
</style>
