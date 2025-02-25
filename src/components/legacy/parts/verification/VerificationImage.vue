<template>
  <div v-if="url">
    <h6
      class="title is-6"
      style="margin-top: 1em"
    >
      {{ title }}
    </h6>
    <a
      target="_blank"
      :href="url"
    >
      <img
        v-if="isImage"
        :src="url"
        style="max-width: 400px;max-height: 400px;"
      >
      <span v-else><span class="icon"><i class="fa fa-external-link" /></span> View in full size</span>
    </a>
  </div>
</template>

<script>
export default {
  name: 'VerificationImage',
  props: {
    title: String,
    url: String
  },
  computed: {
    isImage () {
      return !!((this.url || '').split('?')[0].match(/\.(jpg|jpeg|png)$/i)) ||
      (this.url || '').split('/')[0] === 'data:image'
    }
  }
}
</script>
