<template>
  <div style="position:relative">
    <h3 class="title is-6">
      Upload Bank CSV
    </h3>
    <b-field
      v-if="!uploaded"
      class="file"
    >
      <b-upload
        v-model="file"
        :disabled="processing"
      >
        <a class="button is-primary">
          <b-icon icon="upload" />
          <span>Click to upload</span>
        </a>
      </b-upload>
      <span
        v-if="file"
        class="file-name"
      >{{ file.name }}</span>
    </b-field>
    <b-notification
      v-if="uploaded"
      type="is-success"
      has-icon
      :closable="false"
    >
      Successfully uploaded bank CSV!
    </b-notification>
    <b-loading
      :is-full-page="false"
      :active="processing"
    />
  </div>
</template>

<script>
export default {
  name: 'BankCsvUpload',
  data () {
    return {
      file: null,
      uploaded: false,
      processing: false
    }
  },
  watch: {
    file () {
      if (this.file) {
        this.processing = true
        let fd = new FormData()
        fd.append('raw', this.file)
        let xhr = new XMLHttpRequest()
        xhr.open('POST', this.$local.pdb + '/pdb/eca/upload-csv', true)
        xhr.setRequestHeader('Authorization', 'Bearer ' + this.$store.state.goauth.token)

        xhr.onerror = (e) => {
          this.processing = false
          this.file = null
          console.log(e)
        }

        xhr.onload = (e) => {
          this.processing = false
          this.file = null
          if (xhr.status === 200) {
            let resp
            try {
              resp = JSON.parse(xhr.response)
              if (resp.success) {
                this.$buefy.toast.open({
                  message: 'Woohoo - done!',
                  type: 'is-success'
                })
              } else {
                this.$buefy.toast.open({
                  message: resp.message,
                  type: 'is-danger'
                })
              }
            } catch (e) {
              console.log(xhr.response)
            }
          } else {
            console.log(xhr.response)
            console.log(e)
          }
        }
        xhr.send(fd)
      }
    }
  }
}
</script>
