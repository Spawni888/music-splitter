<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<style lang="scss">
#app {
  min-height: 100%;
  height: 100%;
  background-color: #EBF9FF;
  @media (max-width: 910px) {
    height: fit-content;
  }
}
</style>
