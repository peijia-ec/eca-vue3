<template>
  <b-dropdown
    custom
    :mobile-modal="mobile"
    :hoverable="!mobile"
    :style="styles"
    @mouseenter="show(true)"
    @mouseleave="show(false)"
  >
    <slot slot="trigger" />
    <b-dropdown-item
      :focusable="false"
      custom
    >
      <p><clipboard>{{ uid }}</clipboard></p>
      <p class="has-text-grey-light">
        Compliance log:
      </p>
      <compliance-log
        style="width:400px"
        :uid="loadUid"
        :order-id="orderId"
        :compliance="complianceStatus"
      />
    </b-dropdown-item>
  </b-dropdown>
</template>

<script>
import ComplianceLog from './ComplianceLog.vue'
import Clipboard from './Clipboard.vue'

export default {
  name: 'ComplianceLogDropdown',
  components: {ComplianceLog, Clipboard},
  props: {
    uid: String,
    underline: Boolean,
    mobile: Boolean,
    orderId: String,
    compliance: Number

  },
  data () {
    return {
      loadUid: null,
      timer: null,
      complianceStatus: this.compliance
    }
  },
  computed: {
    styles () {
      return this.underline ? 'border-bottom: 1px dashed #b5b5b5;' : ''
    }
  },
  methods: {
    show (val) {
      if (!val) {
        this.loadUid = null
        clearTimeout(this.timer)
      } else {
        this.timer = setTimeout(() => {
          // Add a timer delay so that it doesn't launch the dropdown loading just for the mouse passing over
          this.loadUid = this.uid
        }, 800)
      }
    }
  }
}
</script>
