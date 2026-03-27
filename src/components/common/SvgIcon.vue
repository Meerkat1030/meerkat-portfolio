<template>
  <span class="svg-icon" :style="{ width: size + 'px', height: size + 'px' }" v-html="svgContent" />
</template>

<script>
const svgModules = import.meta.glob('@/assets/icons/*.svg', { as: 'raw', eager: true })

export default {
  name: 'SvgIcon',
  props: {
    name: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      default: 16,
    },
  },

  computed: {
    svgContent() {
      const key = `/src/assets/icons/${this.name}.svg`
      return svgModules[key] ?? ''
    },
  },
}
</script>

<style scoped>
.svg-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: inherit;
}

.svg-icon :deep(svg) {
  width: 100%;
  height: 100%;
  stroke: currentColor;
  fill: none;
}
</style>
