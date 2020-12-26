<template>
  <main class="splitter">
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
  //height: fit-content;
  display: flex;
  flex-direction: column;
  @media (max-width: 910px) {
    height: fit-content;
  }

  .core-container {
    justify-content: space-between;
    @media (max-width: 910px) {
      display: block;
    }
    .about {
      margin-right: 48px;
      max-width: 400px;
      z-index: 1;
      //padding-bottom: 32px;
      @media (max-width: 910px) {
        margin-right: 0;
        margin-bottom: 40px;
        max-width: none;
      }
      &__title {
        font-size: 4rem;
        letter-spacing: -.025em;
        line-height: 1.2;
        font-weight: 600;
        color: $coreColor;
        margin: 0 0 24px;

        @media (max-width: 910px) {
          margin: 0 0 40px;
        }
        @media (max-width: 576px) {
          margin: 0 0 30px;
        }
      }

      p {
        font-size: 1rem;
        margin: 0 0 24px;
        text-align: left;
        font-family: 'Gordita Medium', Gordita, Avenir, "Helvetica Neue", sans-serif,
        "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
        line-height: 1.75;

        @media (max-width: 576px) {
          margin: 0 0 12px;
        }
      }
    }
  }
}
</style>
