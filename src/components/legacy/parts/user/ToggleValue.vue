<template>
  <button
    class="button"
    :class="classes"
    @click="toggle"
  >
    <span
      v-if="icon"
      class="icon"
    ><i :class="`fa ${icon}`" /></span>
    <span>{{ ucFirst(fullText) }}</span>
  </button>
</template>

<script>
export default {
  name: 'ToggleValue',
  props: {
    field: {
      type: String,
      required: true
    },
    current: [Boolean, Number],
    text: {
      type: String,
      required: true
    },
    uid: {
      type: String,
      required: true
    },
    icon: String,
    disabledColour: String,
    enabledColour: String,
    size: String
  },
  data () {
    return {
      processing: false
    }
  },
  computed: {
    fullText () {
      let prefix = this.current ? 'disable' : 'enable'
      return `${prefix} ${this.text}`
    },
    classes () {
      let classes = {
        'is-loading': this.processing
      }
      if (this.size) {
        classes[this.size] = true
      }
      if (this.disabledColour) {
        classes[this.disabledColour] = !this.current
      }
      if (this.enabledColour) {
        classes[this.enabledColour] = this.current
      }
      return classes
    }
  },
  methods: {
    toggle () {
      if (this.processing) {
        return
      }
      this.$buefy.dialog.confirm({
        message: `Are you sure you want to ${this.fullText}?`,
        onConfirm: async () => {
          this.processing = true
          try {
            await this.apiv2('admin', 'toggle', {
              uid: this.uid,
              field: this.field,
              value: this.current ? 0 : 1,
              who: this.$store.state.goauth.name
            })
            this.$buefy.toast.open(`User set to ${this.fullText}`)
            this.$emit('updated', true)
          } catch (e) {
            console.log(e)
          }
          this.processing = false
        }
      })
    }
  }
}
</script>
