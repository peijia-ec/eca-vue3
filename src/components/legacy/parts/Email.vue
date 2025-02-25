<template>
  <div
    v-if="show"
    class="modal"
    :class="{'is-active': show}"
  >
    <div class="modal-background" />
    <div class="modal-content">
      <div class="box is-size-7-mobile">
        <div class="field">
          <label class="label">Email</label>
          <div class="control has-icons-left">
            <input
              v-model="email"
              class="input"
              type="email"
            >
            <span class="icon is-small is-left"><i class="fa fa-envelope" /></span>
          </div>
        </div>
        <div class="field">
          <label class="label">Subject</label>
          <div class="control">
            <input
              v-model="subject"
              class="input"
              type="text"
            >
          </div>
        </div>
        <div class="field">
          <label class="label">Message</label>
          <div class="control">
            <textarea
              v-model="body"
              class="textarea"
              rows="5"
            />
          </div>
        </div>
        <div class="field">
          <b-checkbox v-model="noreply">
            Don't accept replies
          </b-checkbox>
        </div>
        <div class="buttons">
          <a
            class="button is-primary"
            :class="{'is-loading': processing}"
            @click="send"
          >Send</a>
          <a
            class="button"
            @click="close"
          >Cancel</a>
        </div>
      </div>
    </div>
    <button
      class="modal-close is-large"
      aria-label="close"
      @click="close"
    />
  </div>
</template>

<script>
import store from '@/store'

export default {
  name: 'EmailUser',
  props: ['data', 'resolve', 'reject'],
  data () {
    return {
      show: true,
      email: null,
      subject: null,
      body: null,
      noreply: false,
      processing: false,
      what: null
    }
  },
  mounted () {
    let name = store.getters['goauth/firstName'] || 'Easy Crypto'

    this.email = this.data && this.data.hasOwnProperty('email') ? this.data.email : ''
    this.subject = this.data && this.data.hasOwnProperty('subject') ? this.data.subject : ''
    this.noreply = this.data && this.data.hasOwnProperty('noreply') ? this.data.noreply : false
    this.what = this.data && this.data.hasOwnProperty('what') ? this.data.what : ''

    // Add a sign-off and sender name to the body
    this.body = this.data && this.data.hasOwnProperty('body') ? this.data.body : ''
    this.body += `\n\nBest regards\n\n${name}`
  },
  methods: {
    send () {
      if (this.processing) {
        return
      }
      this.processing = true

      this.apiv2('mail', 'sendEmail', {
        noreply: this.noreply,
        email: this.email,
        subject: this.subject,
        sender: store.getters['goauth/logName'],
        body: this.body,
        what: this.what
      })
        .then(() => {
          this.$buefy.toast.open('Email sent!')
          this.processing = false
          this.show = false
          this.resolve()
        })
        .catch((e) => {
          console.log(e)
          this.$buefy.toast.open({
            message: 'Email failed!! :(',
            type: 'is-danger'
          })
          this.processing = false
          this.reject(e)
        })
    },
    close () {
      this.show = false
      this.reject()
    }
  }
}
</script>
