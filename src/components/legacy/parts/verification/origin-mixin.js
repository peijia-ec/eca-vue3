export default {
  props: ['payload'],
  computed: {
    validOrigin () {
      return typeof this.payload === 'object' && this.payload.hasOwnProperty('details')
    }
  }
}
