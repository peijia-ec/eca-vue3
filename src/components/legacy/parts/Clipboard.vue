<template>
  <span
    v-if="text"
    style="cursor: pointer;"
    title="Click to copy"
    @click="copy"
  >
    <span
      v-if="!iconOnly"
      :class="classes"
    ><slot /><template v-if="suffix"> {{ suffix }}</template></span>
    <span
      v-if="icon"
      class="icon has-text-grey-light"
    ><i class="fa fa-clipboard" /></span>
  </span>
</template>

<script>
export default {
  name: 'Clipboard',
  props: {
    copyValue: String,
    classes: String,
    suffix: String,
    icon: {
      type: Boolean,
      default: true
    },
    iconOnly: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      text: null,
      timer: null
    }
  },
  mounted () {
    // Slots don't seem to detect changes in content (not even with a watcher),
    // so this function is to watch for changes and update this.text when the slot or prop changes
    this.timer = setInterval(() => {
      let now = this.copyValue || this.$slots.default[0].text.trim()
      if (now !== this.text) {
        this.text = now
      }
    }, 500)
  },
  beforeDestroy () {
    clearInterval(this.timer)
  },
  methods: {
    copy () {
      let temp = document.createElement('input')
      document.body.appendChild(temp)
      temp.style.cssText = 'position: absolute; left: -1000px; top: -1000px;'
      temp.value = this.text
      if (navigator.userAgent.match(/ipad|ipod|iphone/i)) {
        let el = temp.get(0)
        el.contentEditable = true
        el.readOnly = false
        let range = document.createRange()
        range.selectNodeContents(el)
        let sel = window.getSelection()
        sel.removeAllRanges()
        sel.addRange(range)
        el.setSelectionRange(0, 999999)
      } else {
        temp.select()
      }
      document.execCommand('copy')
      document.body.removeChild(temp)
      this.$buefy.toast.open('Copied to clipboard')
    }
  }
}
</script>
