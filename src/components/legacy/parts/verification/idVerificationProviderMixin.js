const SMILE_ID_TYPE_WITH_PHOTO = 'NATIONAL_ID'
const SMILE_ID_TYPE_NO_PHOTO = 'NATIONAL_ID_NO_PHOTO'
const MAX_LONG_POLL_COUNT = 3

export default {
  data () {
    return {
      refreshComplianceLogFlag: 0,
      smileIdFetchLoading: true,
      smileJobId: null,
      longPollCount: 0,
      smileIdResponse: null,
      smileIdHealth: [{
        type: SMILE_ID_TYPE_WITH_PHOTO,
        last_check_status: '',
        last_checked: '',
        last_hour_success_rate: ''
      }, {
        type: SMILE_ID_TYPE_NO_PHOTO,
        last_check_status: '',
        last_checked: '',
        last_hour_success_rate: ''
      }]
    }
  },
  mounted () {
    if (this.$local.countryCode === 'ZA') {
      try {
        const smileIdWithPhotoHealth = this.apiv2('smileid', 'CheckSmileIDHealth', {
          idType: SMILE_ID_TYPE_WITH_PHOTO
        })
        const smileIdNoPhotoHealth = this.apiv2('smileid', 'CheckSmileIDHealth', {
          idType: SMILE_ID_TYPE_NO_PHOTO
        })

        this.allSettled([smileIdWithPhotoHealth, smileIdNoPhotoHealth]).then((res) => {
          this.smileIdHealth = [{
            ...this.smileIdHealth[0], ...res[0]
          }, {
            ...this.smileIdHealth[1], ...res[1]
          }]
        })
      } catch (e) {
        console.log('err', e)
      }
    }
  },
  computed: {
    idVerificationProvider () {
      if (this.$local.countryCode === 'ZA') {
        return {
          name: 'Smile ID',
          type: 'smileId'
        }
      }
      return {
        name: 'Centrix',
        type: 'centrix'
      }
    },
    isSmileIdOnline () {
      return this.$local.countryCode === 'ZA' &&
        (this.isSmileIdWithPhotoOnline || this.isSmileIdWithoutPhotoOnline)
    },
    isSmileIdWithPhotoOnline () {
      return this.smileIdHealth.find(item => item.type === SMILE_ID_TYPE_WITH_PHOTO).last_check_status === 'success'
    },
    isSmileIdWithoutPhotoOnline () {
      return this.smileIdHealth.find(item => item.type === SMILE_ID_TYPE_NO_PHOTO).last_check_status === 'success'
    },
    smileIdPayload () {
      return this.smileIdResponse && this.smileIdResponse.result
    },
    isSmileIdResultSuccess () {
      return this.smileIdPayload && this.smileIdPayload.ResultCode === '1012'
    },
    base64SmileIdPhoto () {
      return this.smileIdPayload && this.smileIdPayload.Photo && this.smileIdPayload.Photo !== 'Not Available' && 'data:image/jpg;base64,' + this.smileIdPayload.Photo
    }
  },
  watch: {
    'user.uid': async function (newVal, oldVal) {
      if (this.$local.countryCode === 'ZA' && this.user && newVal !== oldVal) {
        // Reset smile id result
        this.longPollCount = 0
        this.smileJobId = null
        this.smileIdResponse = null
        await this.fetchUserData()
        this.initialFetchSmileIdStatus(this.user.uid)
      }
    }
  },
  methods: {
    allSettled (promises) {
      return Promise.all(promises.map(p => p
        .then(v => ({
          status: 'fulfilled',
          ...v
        }))
        .catch(e => ({
          status: 'rejected',
          reason: e
        }))
      ))
    },
    runIdCheck (user) {
      this.configs.checklistCentrix.show = false
      this.configs.checklistCentrix.disabled = true
      if (this.loading) {
        return
      }
      let message = 'Are you sure want to check '
      if (this.$local.countryCode === 'ZA') {
        message += `<b>${this.user.idNumber}</b> with ${this.idVerificationProvider.name}?
                    <br> <b>This will create a new ${this.idVerificationProvider.name} Job ID for this customer</b>`
      } else {
        message += `<b>${this.user.verifiedFirst} ${this.user.verifiedLast}</b> with ${this.idVerificationProvider.name}? 
                    <br> <b>Please make sure all data is completed before send to ${this.idVerificationProvider.name}</b>`
      }
      this.$buefy.dialog.confirm({
        message,
        onConfirm: async () => {
          this.loading = true
          this.isCentrix = true
          if (this.$local.countryCode === 'ZA') {
            await this.checkSmileId(user)
          } else {
            await this.checkCentrix(user)
          }
          this.loading = false
        },
        onCancel: () => {
          if (this.isDisabled === true) {
            this.configs.checklistCentrix.disabled = true
            this.configs.checklistCentrix.show = false
          } else {
            this.configs.checklistCentrix.disabled = false
            this.configs.checklistCentrix.show = true
          }
        }
      })
    },
    async checkCentrix (user) {
      try {
        let ores = await this.saveOdata()
        if (!ores) {
          this.loading = false
          return
        }
        let res = await this.apiv2('admin', 'checkCentrix', {
          uid: user.uid
        })
        let row = this.queue[this.queue.findIndex(x => x.id === user.id)]
        if (res) {
          if (res === 20) {
            this.processRow(row, 'verified')
          }
          if (res === 10) {
            await this.apiv2('admin', 'addressRequired', {
              id: user.id,
              uid: user.uid,
              email: user.email,
              firstName: user.firstName,
              centrix: true
            })
            this.processRow(row, 'address')
          }
        } else {
          this.$buefy.toast.open('Customer not verified :\\')
        }
      } catch (e) {
        console.log(e)
      }
    },
    async checkSmileId (user) {
      const { idNumber, uid } = user
      try {
        const data = await this.apiv2('smileid', 'CheckNationalID', {
          idNumber,
          uid,
          ...(!this.isSmileIdWithPhotoOnline && this.isSmileIdWithoutPhotoOnline && {
            withoutPhoto: true
          })
        })
        if (data.jobId) {
          this.smileJobId = data.jobId
          this.pollSmileIdResponse(uid, data.jobId)
        }
        this.$buefy.toast.open('Successfully sent data to Smile ID')
        return data
      } catch (e) {
        console.log(e)
        this.$buefy.toast.open('Error: ' + e)
        this.loading = false
      }
    },
    async fetchUserData () {
      try {
        const res = await this.ecApi('admin', 'getUser', { uid: this.user.uid })
        if (res) {
          this.user = {
            ...this.user,
            verifiedFirst: res.user.verifiedFirst,
            verifiedLast: res.user.verifiedLast,
            birthday: res.user.birthday,
            gender: res.user.gender
          }
          this.smileJobId = res.externalIds && !!res.externalIds.length && res.externalIds.find(item => item.provider === 'smileid').id
        }
      } catch (e) {
        console.log(e)
        this.$buefy.toast.open('Error: ' + e)
      }
    },
    async initialFetchSmileIdStatus (uid) {
      this.smileIdFetchLoading = true
      try {
        const res = await this.apiv2('api-admin/index', 'smileid/getSmileIDStatus', {
          uid
        })
        if (res) {
          this.smileIdResponse = {
            result: {
              ResultCode: res.resultCode,
              ResultText: res.resultText,
              Photo: res.photo,
            }
          }
        }
        this.smileIdFetchLoading = false
        return res
      } catch (e) {
        console.log(e)
        this.$buefy.toast.open('Error: ' + e)
        this.smileIdFetchLoading = false
      }
    },
    async fetchCurrentSmileIdStatus (uid, jobId, reverify = false) {
      this.smileIdFetchLoading = true
      try {
        const res = await this.apiv2('smileid', 'GetCurrentSmileIDStatus', {
          uid,
          jobId,
          reverify
        })
        if (res) {
          this.smileIdResponse = res
        }
        this.smileIdFetchLoading = false
        return res
      } catch (e) {
        console.log(e)
        this.$buefy.toast.open('Error: ' + e)
        this.smileIdFetchLoading = false
      }
    },
    async pollSmileIdResponse (uid, jobId) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      try {
        const res = await this.fetchCurrentSmileIdStatus(uid, jobId)
        this.longPollCount += 1
        if (res && res.job_complete) {
          await this.delayRefreshComplianceLog()
          this.fetchUserData()
        } else if (this.longPollCount < MAX_LONG_POLL_COUNT) {
          await this.pollSmileIdResponse(uid, jobId)
        } else {
          this.$buefy.toast.open('Failed to retrieve data from Smile ID, please try again.')
        }
      } catch (e) {
        console.log(e)
        this.$buefy.toast.open('Error: ' + e)
      }
    },
    async refreshCurrentSmileIdStatus () {
      await this.fetchCurrentSmileIdStatus(this.user.uid, this.smileJobId, true)
      await this.delayRefreshComplianceLog()
      this.fetchUserData()
    },
    async delayRefreshComplianceLog () {
      await new Promise(resolve => setTimeout(resolve, 2000))
      this.refreshComplianceLogFlag += 1
    }
  }
}
