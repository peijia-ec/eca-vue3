<template>
  <button
    class="button is-danger"
    :class="classes"
    @click="markFraud"
  >
    <span class="icon"><i class="fa fa-bomb" /></span>
    <span>Mark as <span v-if="isFraud">NOT</span> fraud</span>
  </button>
</template>

<script>
export default {
  name: 'MarkFraud',
  props: ['isFraud', 'classes', 'uid'],
  methods: {
    markFraud () {
      if (!this.uid) {
        return
      }
      if (this.isFraud) {
        // Already fraud - mark as NOT fraud
        this.$buefy.dialog.prompt({
          message: 'Are you SURE you want to mark this user as NOT fraudulent? Please give the reason:',
          inputAttrs: {
            value: 'Known fraud account'
          },
          onConfirm: (value) => {
            this.ecApi('admin', 'setFraudUsers', {
              uids: [this.uid],
              what: 'Marking as NOT fraud account',
              who: this.$store.state.goauth.name,
              why: value,
              notFraud: true
            })
              .then(() => {
                this.$buefy.toast.open('Marked as NOT fraud account')
                this.$emit('complete')
              })
              .catch(() => {
                this.$buefy.toast.open('An error occured')
              })
          }
        })
      } else {
        // Mark as fraud
        this.$buefy.dialog.prompt({
          message: 'Are you SURE you want to mark this user as fraudulent? Please give the reason:',
          inputAttrs: {
            value: 'Known fraud account'
          },
          onConfirm: (value) => {
            this.ecApi('admin', 'setFraudUsers', {
              uids: [this.uid],
              what: 'Marking as fraud account',
              who: this.$store.state.goauth.name,
              why: value
            })
              .then(() => {
                this.$buefy.toast.open('Marked as fraud account')
                this.$emit('complete')
              })
              .catch(() => {
                this.$buefy.toast.open('An error occured')
              })
          }
        })
      }
    }
  }
}
</script>
