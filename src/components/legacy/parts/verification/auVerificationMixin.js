export default {
  data () {
    return {
      sourceFiles: []
    }
  },
  methods: {
    async fetchVerificationFilesIfExists () {
      this.sourceFiles = []
      if (this.user.sourceFiles) {
        this.sourceFiles = await this.ecApi('admin', 'getVerificationSourceFiles', {
          id: this.user.id
        })
      }
    }
  }
}
