<template>
  <div
    class="box content"
  >
    <h2>Edit address</h2>
    <b-field
      v-for="(row, i) in Object.keys(addressLabels)"
      :key="i"
      :label="addressLabels[row]"
    >
      <b-input
        v-if="row !== 'country'"
        type="text"
        :value="newAddress[row]"
        v-model="newAddress[row]"
        :maxlength="maxLength[row]"
      />
      <b-select
        v-if="row === 'country'"
        :label="newAddress[row]"
        v-model="newAddress[row]"
      >
        <option
          v-for="country in countries"
          :key="country.id"
          :value="country.id"
        >
          {{ country.name }}
        </option>
      </b-select>
    </b-field>
    <p
      v-if="invalidChar"
      class="error has-text-danger"
    >
      {{ invalidCharMsg }}
    </p>
    <b-button
      type="submit"
      class="button"
      @click="submitAddress"
    >
      Submit
    </b-button>
  </div>
</template>

<script>

const addressFieldPattern = /^[a-zA-Z0-9\s\/().,-]*$/;
const alphabeticPattern = /^[a-zA-Z\s]+$/;

export default {
  name: 'EditUserAddress',
  props: {
    addressData: {
      type: Object,
      required: true
    },
    uid: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      invalidChar: false,
      invalidCharMsg: '',
      newAddress: {
        address: this.addressData.address,
        postcode: this.addressData.postcode,
        suburb: this.addressData.suburb,
        city: this.addressData.city,
        address1: this.addressData.address1,
        address2: this.addressData.address2,
        address3: this.addressData.address3,
        country: this.addressData.country
      },
      addressLabels: {
        address: 'Address',
        postcode: 'Postcode',
        suburb: 'Suburb',
        city: 'City',
        address1: 'Unit No./House No.',
        address2: 'Complement',
        address3: 'State',
        country: 'Country'
      },
      maxLength: {
        address: 35,
        postcode: 10,
        suburb: 15,
        city: 15,
        address1: 10,
        address2: 15,
        address3: 15,
        country: 2
      },
      countries: []
    }
  },
  created () {
    this.loadCountries()
  },
  methods: {
    validateAddressFields(fieldValue) {
      switch (fieldValue) {
      case 'address':
      case 'suburb':
      case 'address1':
      case 'address2':
      case 'country':
        return addressFieldPattern.test(this.newAddress[fieldValue])
      case 'postcode':
        const postcode = this.newAddress[fieldValue].toString()
        return addressFieldPattern.test(postcode)
      case 'address3':
      case 'city':
        if(!this.newAddress[fieldValue]){
          return true
        }
        return alphabeticPattern.test(this.newAddress[fieldValue])
      }
    },
    async submitAddress() {
      try {
        for(const field in this.newAddress){
          if(!this.validateAddressFields(field)){
            this.invalidChar = true
            this.invalidCharMsg = `Invalid ${this.addressLabels[field]}`
            return field
          }
        }
        await this.ecApi('admin', 'setValue', {
          uid: this.uid,
          table: 'verification',
          address: this.newAddress.address,
          postcode: this.newAddress.postcode,
          suburb: this.newAddress.suburb,
          city: this.newAddress.city,
          address1: this.newAddress.address1,
          address2: this.newAddress.address2,
          address3: this.newAddress.address3,
          country: this.newAddress.country
        })
        this.$buefy.toast.open('Done!')
        await this.$emit('update')
      } catch(e){
        console.error(e)
      }
    },
    async loadCountries() {
      try {
        let res = await this.apiv2('verify-admin', 'loadCountries')
        if (res) {
          let nzIndex = res.countries.findIndex(country => country.name === 'New Zealand')
          if (nzIndex > -1) {
            let nz = res.countries.splice(nzIndex, 1)
            res.countries.unshift(nz[0])
          }
          this.countries = res.countries
        }
      } catch (e) {
        console.error(e)
      }
    }
  }
}
</script>
