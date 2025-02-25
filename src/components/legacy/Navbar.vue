<template>
  <div
    class="navbar container"
    role="navigation"
    aria-label="main navigation">
    <div class="navbar-brand">
      <router-link
        class="navbar-item"
        :to="{ name: 'home' }">
        {{ $local.countryCode }} ADMIN
      </router-link>
      <a
        class="navbar-burger"
        :class="{ 'is-active': active }"
        @click="active = !active">
        <span aria-hidden="true" />
        <span aria-hidden="true" />
        <span aria-hidden="true" />
      </a>
    </div>
    <div
      class="navbar-menu"
      :class="{ 'is-active': active }"
      @click="active = false">
      <div class="navbar-start">
        <auth-link
          class="navbar-item"
          route-name="users">
          Users
        </auth-link>
        <auth-link
          class="navbar-item"
          route-name="orders">
          Orders
        </auth-link>
        <auth-link
          class="navbar-item"
          route-name="otc">
          OTC
        </auth-link>
        <auth-link
          class="navbar-item"
          route-name="Sell">
          Sell
        </auth-link>
        <auth-link
          class="navbar-item"
          route-name="BatchPayouts">
          Payout
        </auth-link>
        <auth-link
          class="navbar-item"
          route-name="bank">
          Bank
        </auth-link>
        <auth-link
          class="navbar-item"
          route-name="verification">
          Verify
        </auth-link>
        <auth-link
          class="navbar-item"
          route-name="BankVerify">
          Verify B
        </auth-link>
        <auth-link
          class="navbar-item"
          route-name="Errors">
          Errors
        </auth-link>
        <auth-link
          class="navbar-item"
          route-name="Coins">
          Coins
        </auth-link>
        <auth-link
          class="navbar-item"
          route-name="market">
          Market
        </auth-link>
        <auth-link
          class="navbar-item"
          route-name="search">
          Search
        </auth-link>
      </div>
      <div class="navbar-end">
        <div class="navbar-item">
          <img
            v-if="$store.state.goauth.token"
            :src="$store.state.goauth.photo"
            style="border-radius: 50%"
            referrerPolicy="no-referrer">
        </div>
        <div class="navbar-item">
          <b-button
            v-if="$store.state.goauth.token"
            size="is-small"
            type="is-danger"
            outlined
            @click="logout">
            Sign out
          </b-button>
        </div>
        <div class="navbar-item">
          {{ time }}
          <span
            class="has-text-grey-lighter"
            style="padding-left:10px">v{{ $root.version }}</span>
        </div>
      </div>
    </div>
    <b-loading
      :is-full-page="true"
      :active.sync="loadingSpinner"
      :can-cancel="false" />
  </div>
</template>

<script>
import AuthLink from '../new/parts/AuthLink.vue'
import moment from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
moment.extend(utc)
moment.extend(timezone)

export default {
  name: 'Order',
  components: { AuthLink },
  props: {
    isLoading: {
      type: Boolean,
      default: false
    },
    title: {
      type: Boolean,
      default: true
    },
    colour: {
      type: String
    }
  },
  data () {
    return {
      routesinfo: null,
      hide: '.hide',
      showLogin: false,
      active: false,
      time: '',
      loadingSpinner: null
    }
  },
  created () {
    setInterval(() => {
      this.time = moment().tz(this.$local.timezone).format('HH:mm')
    }, 1000)
  },
  mounted () {
    this.loadingSpinner = this.isLoading
    // Get all "navbar-burger" elements
    let $navbarBurgers = Array.prototype.slice.call(document.querySelectorAll('.navbar-burger'), 0)

    // Check if there are any navbar burgers
    if ($navbarBurgers.length > 0) {
      // Add a click event on each of them
      $navbarBurgers.forEach(function ($el) {
        $el.addEventListener('click', function () {
          // Get the target from the "data-target" attribute
          let target = $el.dataset.target
          let $target = document.getElementById(target)

          // Toggle the class on both the "navbar-burger" and the "navbar-menu"
          $el.classList.toggle('is-active')
          $target.classList.toggle('is-active')
        })
      })
    }
  },
  methods: {
    async logout () {
      this.loadingSpinner = true
      await this.$root.signOut()
    }
  }
}
</script>

<style scoped>
.hide {
  display: none;
}
</style>
