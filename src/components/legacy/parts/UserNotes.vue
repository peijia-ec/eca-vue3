<template>
  <div style="margin-bottom: 1em;">
    <div class="field">
      <div
        class="control"
        :class="{'is-loading is-large': loading}"
        style="max-width: 600px;"
      >
        <textarea
          v-model="notes"
          class="textarea"
          :class="{'has-text-primary': !loading}"
          placeholder="Add your notes..."
          style="height:8em"
        />
      </div>
    </div>
    <div class="field">
      <div class="control">
        <a
          class="button"
          :class="{'is-loading': processing}"
          @click="save"
        >
          <span class="icon"><i class="fa fa-floppy-o" /></span>
          <span>Save notes</span>
        </a>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserNotes',
  props: ['uid'],
  data () {
    return {
      notes: 'Please wait, loading notes...',
      processing: false,
      loading: true
    }
  },
  async mounted () {
    try {
      this.notes = await this.apiv2('admin', 'getUserNotes', {uid: this.uid})
    } catch (e) {
      this.$buefy.toast.open({
        message: 'Failed to get user notes',
        type: 'is-danger'
      })
    }
    this.loading = false
  },
  methods: {
    save () {
      if (this.processing) {
        return
      }
      this.processing = true
      this.ecApi('admin', 'saveNotes', {
        uid: this.uid,
        notes: this.notes
      })
        .then(() => {
          this.$buefy.toast.open('Notes saved')
          this.processing = false
        })
        .catch((e) => {
          console.log(e)
          this.$buefy.toast.open({
            message: 'Failed to save notes, try again',
            type: 'is-danger'
          })
          this.processing = false
        })
    }
  }
}
</script>
