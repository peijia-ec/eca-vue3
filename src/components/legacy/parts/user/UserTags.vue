<template>
  <b-taglist v-if="user">
    <b-tag
      v-for="(tag, i) in tags"
      :key="'tag'+i"
      :type="tag.colour"
    >
      <span class="icon"><i :class="tag.icon" /></span>
      <span>{{ short ? tag.short : tag.label }}</span>
    </b-tag>
  </b-taglist>
</template>

<script>
export default {
  name: 'UserTags',
  props: {
    user: Object,
    short: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    tags () {
      let tags = []
      let tag = function (label, colour, icon, short) {
        return {
          label: label,
          colour: colour,
          icon: 'fa fa-' + icon,
          short: short
        }
      }
      if (this.user) {
        let u = this.user
        if (u.fraud) {
          tags.push(tag('Banned', 'is-danger', 'ban', 'BAN'))
        }
        if (u.suspicious) {
          tags.push(tag('Frozen', 'is-danger', 'stop', 'FRZ'))
        }
        if (u.pah) {
          tags.push(tag('Orders held', 'is-dark', 'pause', 'PAH'))
        }
        if (u.holdTilReceived) {
          tags.push(tag('Orders held until received', 'is-warning', 'download', 'HTR'))
        }
      }
      return tags
    }
  }
}
</script>
