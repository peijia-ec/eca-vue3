<template>
  <div v-if="valid">
    <template v-if="!$root.mobile">
      <!-- Desktop -->
      <compliance-log-dropdown
        :uid="user.uid"
        underline
        :order-id="orderId"
      >
        <router-link :to="{name: 'user', query: {uid: user.uid}}">
          <truncate
            v-if="truncate"
            :length="18"
            :text="user.email"
          />
          <span v-else>{{ user.email }}</span>
        </router-link>
      </compliance-log-dropdown>
    </template>
    <template v-if="$root.mobile">
      <!-- Mobile -->
      <compliance-log-dropdown
        :uid="user.uid"
        mobile
        :order-id="orderId"
      >
        <span class="icon"><i class="fa fa-id-card-o" /></span>
      </compliance-log-dropdown>
      <router-link :to="{name: 'user', query: {uid: user.uid}}">
        <truncate
          v-if="truncate"
          :length="16"
          :text="user.email"
        />
        <span v-else>{{ user.email }}</span>
      </router-link>
    </template>
    <template v-if="tags">
      <b-tag
        v-if="user.fraud"
        style="transform: scale(0.75)"
        type="is-danger"
      >
        Fraud
      </b-tag>
      <b-tag
        v-else-if="user.suspicious"
        style="transform: scale(0.75)"
        type="is-danger"
      >
        SUS
      </b-tag>
      <b-tag
        v-else-if="user.pah"
        style="transform: scale(0.75)"
        type="is-dark"
      >
        P&H
      </b-tag>
    </template>
    <b-tag
      v-if="isUserAgeOver70"
      style="transform: scale(0.75)"
      type="is-dark"
    >
      Age 70+
    </b-tag>
  </div>
</template>

<script>
import Truncate from '../../Truncate.vue'
import ComplianceLogDropdown from '../ComplianceLogDropdown.vue'
import { getAge } from '@/store/helpers.js'

export default {
  name: 'EmailLink',
  components: {Truncate, ComplianceLogDropdown},
  props: {
    user: Object,
    orderId: String,
    truncate: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    valid () {
      return this.user && this.user.hasOwnProperty('uid') && this.user.uid && this.user.hasOwnProperty('email') && this.user.email
    },
    tags () {
      return this.valid && this.user.hasOwnProperty('suspicious')
    },
    isUserAgeOver70 () {
      return this.user.birthday && getAge(this.user.birthday).asYears() >= 70
    }
  }
}
</script>
