export default {
  data () {
    return {
      externalDocuments: []
    }
  },
  methods: {
    resetVerificationDocuments () {
      this.externalDocuments = []
    },
    /**
     * Fetch the remote URLs for verification documents
     * @param {string} uid
     * @param {string} [provider]
     * @returns {Promise<void>}
     */
    async getExternalUserDocuments (uid, provider = 'Sumsub') {
      const docs = []
      try {
        const data = await this.ecApi('admin', 'getExternalUserPayload', {
          uid: uid,
          provider: provider
        })
        if (data.payload !== null) {
          JSON.parse(data.payload)
            .forEach(index => {
              const link = index.url + '/apiv2/sumsub.php?action=displayImage&inspectionId=' + index.inspectionId + '&imageId=' + index.imageId
              docs.push({'link': link})
            })
        }
      } catch (e) {
        console.log(e)
      }
      this.externalDocuments = docs
    },
    getVerificationProvider (verificationData) {
      // TODO this is a temporary fix until we have a verification method column in the retrieved data
      try {
        const payload = JSON.parse(verificationData.payload)
        if (payload.hasOwnProperty('applicantId')) {
          // SumSub
          return {
            icon: 'fa fa-plus-square',
            name: 'Sumsub',
            link: `https://api.sumsub.com/checkus#/applicant/${payload.applicantId}/basicInfo?clientId=easycrypto`
          }
        } else if (payload.hasOwnProperty('details')) {
          // Centrix
          return {
            icon: 'fa fa-id-card-o',
            name: 'Centrix',
            link: 'https://ws.centrix.co.nz/Bureau/Secure/SmartIDVerification.aspx'
          }
        } else if (payload.hasOwnProperty('entityResult')) {
          // FrankieOne
          return {
            icon: 'fa fa-plus-square',
            name: 'FrankieOne',
            link: process.env.VITE_FRANKIEONE_URL.replace('{entityId}', payload.entityResult.entityId)
          }
        }
      } catch (e) {
        // nothing
      }
      return {
        icon: null,
        name: 'Manual',
        link: ''
      }
    }
  }
}
