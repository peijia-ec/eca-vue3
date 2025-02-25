<template>
  <b-dropdown
    aria-role="list"
    @change="onSelect"
    :disabled="isLoading"
  >
    <template #trigger>
      <b-button
        class="cursor"
        size="is-small"
        :class="UNUSUAL_ACTIVITY[unusualActivity].class + (isLoading ? ' is-loading' : '')"
      >
        {{ UNUSUAL_ACTIVITY[unusualActivity].label }}
      </b-button>
    </template>
    <template v-for="ua in UNUSUAL_ACTIVITY">
      <b-dropdown-item
        :key="ua.id"
        v-if="unusualActivity !== ua.id"
        :value="ua.id"
        aria-role="listitem"
      >
        {{ ua.label }}
      </b-dropdown-item>
    </template>
  </b-dropdown>
</template>

<script>
export const UNUSUAL_ACTIVITY = [{
  id: 0,
  label: 'None',
  class: ''
}, {
  id: 1,
  label: 'Suspicious',
  class: 'is-danger'
}, {
  id: 2,
  label: 'Concerning',
  class: 'is-warning'
}]

export default {
  name: 'UnusualActivityDropdown',
  data() {
    return {
      UNUSUAL_ACTIVITY
    }
  },
  props: {
    orderId: {
      type: String,
      default: ''
    },
    unusualActivity: {
      type: Number,
      default: 0
    },
    loading: {
      type: [Boolean, String],
      default: false
    },
  },
  computed: {
    isLoading () {
      return this.loading === this.orderId
    }
  },
  methods: {
    onSelect (value) {
      if (this.isLoading) {
        return
      }
      this.$emit('select', {
        orderId: this.orderId,
        value
      })
    }
  }
}
</script>

<style scoped>
.button.is-small {
  height: 2em;
  border-radius: 4px;
}
</style>
