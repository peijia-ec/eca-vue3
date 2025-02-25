<template>
  <span>
    <template v-if="active && text && text.length > length">
      <template v-if="tooltip">
        <b-tooltip :label="text">
          {{ truncate(text) }}
        </b-tooltip>
      </template>
      <template v-else>
        {{ truncate(text) }}
      </template>
    </template>
    <template v-else>
      {{ text }}
    </template>
  </span>
</template>

<script>
export default {
  name: 'Truncate',
  props: {
    length: {
      type: Number,
      default: 12
    },
    text: {
      type: String,
      default: ''
    },
    tooltip: {
      type: Boolean,
      default: true
    },
    active: {
      type: Boolean,
      default: true
    }
  },
  methods: {
    truncate (val) {
      return (val.length > this.length) ? val.substring(0, this.length - 2) + '...' : val
    }
  }
}
</script>

<style scoped>

</style>
