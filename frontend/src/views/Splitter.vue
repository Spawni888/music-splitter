<template>
  <main class="splitter">
    <canvas ref="audioVisual"/>
    <CoreContainer>
      <section class="splitter__about about">
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

      <SplitterContent />
    </CoreContainer>
  </main>
</template>

<script>
import SplitterContent from '@/components/splitter/SplitterContent';
import CoreContainer from '@/components/CoreContainer';

export default {
  name: 'Splitter',
  metaInfo: {
    // if no subcomponents specify a metaInfo.title, this title will be used
    title: 'Splitter',
  },
  mounted() {
  },
  methods: {
  },
  components: {
    CoreContainer,
    SplitterContent,
  },
};
</script>
<style scoped lang="scss">
.splitter {
  height: 100%;
  display: flex;
  flex-direction: column;

  .core-container {
    justify-content: space-between;

    .about {
      margin-right: 48px;
      max-width: 400px;
      z-index: 1;
      //padding-bottom: 32px;

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
  }
  canvas {
    z-index: 0;
    height: 100%;
    width: 100%;
    top: 0;
    left: 0;
    position: absolute;
  }
}
</style>
