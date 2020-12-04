<template>
  <div class="core-btn" @click.self="$emit('click')">
    <slot/>
  </div>
</template>

<script>
export default {
  name: 'CoreButton',
};
</script>

<style scoped lang="scss">
  .core-btn {
    min-width: 84px;
    border-radius: 4px;
    cursor: pointer;
    background-color: #00B3FF;
    color: #fff;
    font-weight: 600;
    padding: 12px 20px;
    transition: all .2s ease;
    font-size: .9375rem;
    line-height: 1.75;
    box-shadow: 0 2px 15px rgba(0,0,0,.1);
    &:hover {
      background-color: #1ABAFF;
      box-shadow: none;
    }
  }
</style>
