<template>
  <div>
    <div
      v-for="(file, i) in list"
      :key="i"
      class="mb-4"
    >
      <h6>Supporting file #{{ i + 1 }}</h6>
      <object
        :data="file"
        style="height:auto; width:100%"
      />
      <a
        :href="file"
        target="_blank"
        title="Click to view full size image"
      >
        <Truncate
          :tooltip="false"
          :length="50"
          :text="file"
        />
      </a>
    </div>
  </div>
</template>

<script>
import Truncate from '@/components/Truncate.vue'

export default {
  name: 'FileList',
  props: ['files'],
  computed: {
    list () {
      if (Array.isArray(this.files)) {
        return this.files
      } else {
        let files
        try {
          files = JSON.parse(this.files)
        } catch (e) {
          // nothing
        }
        return Array.isArray(files) ? files : []
      }
    }
  },
  components: { Truncate }
}
</script>

<style scoped>
.mb-4 {
  margin-bottom: 1rem;
}
</style>
