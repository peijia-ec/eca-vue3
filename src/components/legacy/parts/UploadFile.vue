<template>
  <div class="field">
    <label
      v-if="label"
      class="label"
    >{{ label }}</label>
    <div class="control">
      <div
        v-if="!filename && !percent"
        class="file is-primary"
      >
        <label class="file-label">
          <input
            class="file-input"
            type="file"
            @change="upload($event)"
          >
          <span class="file-cta"><span class="file-icon"><i class="fa fa-upload" /></span><span class="file-label">Select file...</span></span>
        </label>
      </div>
      <p
        v-if="!filename && !percent"
        class="help"
      >
        Upload only {{ niceTypes }} files.
      </p>
      <div v-if="!filename && percent">
        Uploading... {{ percent - 1 }}%
      </div>
      <progress
        v-if="!filename && percent"
        class="progress is-success"
        :value="percent"
        max="100"
      />
      <div v-if="filename">
        <span class="icon is-small"><i class="fa fa-check has-text-success" /></span> File uploaded.
      </div>
    </div>
    <p class="help is-danger">
      {{ message }}
    </p>
  </div>
</template>

<script>
export default {
  name: 'UploadFile',
  props: {
    label: String,
    type: {
      type: String,
      required: true
    },
    allowed: {
      type: Array,
      default: function () {
        return ['jpg', 'png', 'pdf']
      }
    }
  },
  data () {
    return {
      message: null,
      percent: 0,
      filename: null,
      niceTypes: null,
      fileTypes: {
        jpg: {
          name: 'JPG',
          ext: 'jpg',
          mime: 'image/jpeg'
        },
        png: {
          name: 'PNG',
          ext: 'png',
          mime: 'image/png'
        },
        pdf: {
          name: 'PDF',
          ext: 'pdf',
          mime: 'application/pdf'
        }
      }
    }
  },
  mounted () {
    // Create nice list
    let a = this.allowed
    let types = ''
    if (a.length === 1) {
      types = this.fileTypes[a[0]].name
    } else if (a.length === 2) {
      types = this.fileTypes[a[0]].name + ' or ' + this.fileTypes[a[1]].name
    } else {
      let l = a.slice(0, -1)
      let last = a[a.length - 1]
      types = l.map(x => this.fileTypes[x].name).join(', ') + ' or ' + this.fileTypes[last].name
    }
    this.niceTypes = types
  },
  methods: {
    upload (event) {
      this.message = null

      let file = event.target.files[0]

      if (!file) {
        this.message = 'No file selected'
        return
      }

      let maxFileSize = 20000000 // 20MB

      if (file.size > maxFileSize) {
        this.message = 'File too large. Maximum size is 20MB.'
        return
      }

      // Is it an allowed filetype?
      let allowed = false
      for (let type of this.allowed) {
        if (!this.fileTypes.hasOwnProperty(type)) {
          continue
        }
        if (this.fileTypes[type].mime === file.type.toLowerCase()) {
          allowed = true
          break
        }
      }
      if (!allowed) {
        this.message = 'Unsupported file type, please only upload ' + this.niceTypes + ' files.'
        return
      }

      let fd = new FormData()
      fd.append('afile', file)
      fd.append('uid', this.$root.user.uid)
      fd.append('type', this.type)
      fd.append('mime', file.type.toLowerCase())
      let xhr = new XMLHttpRequest()
      xhr.open('POST', this.$local.api + '/api/file-upload.php', true)

      xhr.onerror = (e) => {
        console.log(e)
        this.message = 'An error has occurred. Please try again.'
      }
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          this.percent = Math.round((e.loaded / e.total) * 100)
        }
      }
      let reset = () => {
        this.percent = 0
        this.filename = null
      }

      xhr.onload = (e) => {
        if (xhr.status === 200) {
          let resp = JSON.parse(xhr.response)
          if (resp && resp.hasOwnProperty('success') && resp.success === true) {
            // Successful upload
            this.filename = resp.data
            this.$emit('complete', {
              filename: resp.data
            })
          } else {
            this.message = 'An error has occurred. Please try again.'
            reset()
          }
        } else {
          this.message = 'An error has occurred. Please try again.'
          reset()
        }
      }
      xhr.send(fd)
    }
  }
}
</script>
