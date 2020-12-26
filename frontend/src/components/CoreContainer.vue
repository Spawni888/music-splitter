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
    padding: 16px 50px;
    display: flex;
    align-items: center;
    max-width: 1100px;
    width: 100%;
    flex: 1;
    @media (max-width: 910px) {
      padding: 50px 50px;
    }
    @media (max-width: 576px) {
      padding: 40px;
    }
  }
</style>
