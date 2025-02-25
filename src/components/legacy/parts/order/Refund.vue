<template>
  <div
    v-if="visible && alphaAccess"
    style="position:relative;"
  >
    <div>
      <div v-if="dataRefundActions.loaded">
        <b-tooltip
          v-if="dataRefundActions.errorMessage"
          :label="dataRefundActions.errorMessage"
          type="is-dark"
        >
          <button
            disabled="disabled"
            class="button is-small"
          >
            <b-loading
              :is-full-page="false"
              :active="loading"
            />
            <span class="icon"><i class="fa fa-warning" /></span>
            <span>Refund n/a</span>
          </button>
        </b-tooltip>
        <button
          v-else-if="dataRefundActions.isRefunded"
          disabled="disabled"
          class="button is-small"
        >
          <b-loading
            :is-full-page="false"
            :active="loading"
          />
          <span class="icon"><i class="fa fa-check" /></span>
          <span>Refunded</span>
        </button>

        <button
          v-else-if="!dataRefundActions.isRefunded"
          class="button is-small"
          @click="openModal"
        >
          <b-loading
            :is-full-page="false"
            :active="loading"
          />
          <span class="icon"><i class="fa fa-dollar" /></span>
          <span>Refund</span>
        </button>
      </div>
      <div v-else>
        <button
          class="button is-small"
        >
          <b-loading
            :is-full-page="false"
            :active="loading"
          />
          <span class="icon"><i class="fa fa-dollar" /></span>
          <span>Loading</span>
        </button>
      </div>
    </div>
    <b-modal
      id="modal"
      :active.sync="uiShow"
    >
      <div
        v-if="uiReasonStep"
        class="box content"
      >
        <h4 style="margin-bottom: 5px">
          Reason for Refund
        </h4>
        <span
          style="display:block; margin-bottom: 20px"
          v-html="topWarningTextReasonsScreen"
        />
        <div
          v-for="action in reasonsWithRadio"
          :key="action.radio.label"
          class="field"
        >
          <b-radio
            v-model="reasonRadio"
            :native-value="action.radio.value"
            :disabled="action.radio.disabled"
          >
            <div>
              <div
                style="display: inline-block"
                v-html="action.radio.label"
              />
            </div>
          </b-radio>
        </div>
        <div v-if="uiShowOther">
          <span>* Reason</span>
          <b-input
            v-model="reasonOther"
            type="textarea"
          />
          <br>
        </div>
        <div
          v-for="action in reasonsWithCheckbox"
          :key="action.checkbox.key"
          class="field"
        >
          <b-checkbox
            v-model="reasonCheckboxes[action.checkbox.key]"
            :true-value="1"
            :false-value="0"
          >
            {{ action.checkbox.label }}
          </b-checkbox>
        </div>
        <div
          v-if="errorMessage"
          class="field"
        >
          <p class="error has-text-danger">
            {{ errorMessage }}
          </p>
        </div>
        <div
          v-if="bottomWarningTextReasonsScreen"
          style="position: relative;width: 80%;left: 10%;right: 20%"
          v-html="bottomWarningTextReasonsScreen"
        />
        <br>
        <div
          class="field"
          style="position: relative;left: 40%;width: 60%"
        >
          <b-button
            type="is-primary"
            :loading="loading"
            @click="save"
          >
            <span class="icon"><i class="fa fa-save" /></span>
            <span>Confirm</span>
          </b-button>
        </div>
      </div>
      <div
        v-else
        class="box content"
      >
        <h4 style="margin-bottom: 5px">
          Refund Actions
        </h4>
        <small style="display:block; margin-bottom: 20px">***Note: Disabled actions are upcoming features. Meanwhile make a Fixit ticket if it is any of the below</small>
        <div
          v-for="action in dataRefundActions.actions"
          :key="action.radio.label"
          class="field"
        >
          <b-radio
            v-model="refundOption"
            :native-value="action.radio.value"
            :disabled="action.radio.disabled"
          >
            <div>
              <b-tooltip
                :label="action.radio.help"
                multilined
                position="is-right"
                style="margin-right: 5px"
              >
                <i class="fa fa-question-circle-o cursor" />
              </b-tooltip>
              <div
                style="display: inline-block"
                v-html="action.radio.label"
              />
            </div>
          </b-radio>
        </div>
        <br>
        <div
          v-if="errorMessage"
          class="field"
        >
          <p class="error has-text-danger">
            {{ errorMessage }}
          </p>
        </div>
        <div class="field is-flex">
          <b-button
            type="is-primary"
            :loading="loading"
            @click="nextStep"
          >
            <span>Next</span>
          </b-button>
        </div>
      </div>
    </b-modal>
  </div>
</template>

<script>
import store from '../../../store'
export default {
  name: 'Refund',
  props: {
    uid: String,
    order: Object,
    item: Object,
  },
  data () {
    return {
      visible: true,
      alphaAccess: false,
      loading: false,
      uiShow: false,
      uiShowOther: false,
      uiReasonStep: false,
      dataRefundActions: {
        loaded: false,
        actions: []
      },
      refundOption: null,
      reasonOther: null,
      reasonRadio: null,
      reasonCheckboxes: {},
      errorMessage: null
    }
  },
  async mounted() {
    let user = store.state.goauth
    if(user.email === 'angela@easycrypto.ai' || user.email === 'bronte@easycrypto.ai'){
      this.alphaAccess = true
    }
    await this.update()
  },
  watch:{
    uiShow (value) {
      if (value === false) {
        this.previousStep()
      }
    },
    reasonRadio(value) {
      if (value === 'other'){
        this.uiShowOther = true
      }else{
        this.uiShowOther = false
      }
    }
  },
  computed: {
    reasonsWithCheckbox() {
      return this.dataRefundActions.actions.find((x)=>x.radio.value===this.refundOption).radio.reasons.items.filter(reason=>reason.checkbox)
    },
    reasonsWithRadio() {
      return this.dataRefundActions.actions.find((x)=>x.radio.value===this.refundOption).radio.reasons.items.filter(reason=>reason.radio)
    },
    topWarningTextReasonsScreen() {
      return this.dataRefundActions.actions.find((x)=>x.radio.value===this.refundOption).radio.reasons.topWarning
    },
    bottomWarningTextReasonsScreen() {
      return this.dataRefundActions.actions.find((x)=>x.radio.value===this.refundOption).radio.reasons.bottomWarning
    },
    calculatedValues() {
      let originalOrderValue = Number(this.order.total) - Number(this.order.fee)
      let feeAmount = Math.min(Math.max(originalOrderValue * 0.1, 10), 50)
      let finalToPay = this.item.nzd - feeAmount
      return {
        originalOrderValue: originalOrderValue,
        itemValue: this.item.nzd,
        feeAmount: feeAmount,
        orderToPayValue: Number(this.order.toPay),
        finalToPay: finalToPay
      }
    }
  },
  methods: {
    createScreenObject (toPayValue) {

      function createProcessedOrderAction ({label, value, disabled, help, reasons}) {
        return {radio: {label, value, disabled, help, reasons}};
      }

      function createReasonItems () {
        return [
          createRadioItem('Scam/Fraud', 'scam'),
          createRadioItem('Requested by Customer', 'customer'),
          createRadioItem('Beyond EC risk profile', 'risk'),
          createRadioItem('Order error', 'error'),
          createRadioItem('Other', 'other'),
          //createCheckboxItem('I confirm I have made a request for refund', 'confirm'),
        ];
      }

      function createRadioItem (label, value) {
        return {radio: {label, value}};
      }

      function createCheckboxItem (label, key) {
        return {checkbox: {label, key}};
      }

      return {
        loaded: true,
        isRefunded: false,
        actions: [createProcessedOrderAction({
          label: `<b>Processed Order:</b> Reconvert and refund, less fee of 10% of original order value (Approximately: ~ ${toPayValue} NZD)`,
          value: 'standard',
          disabled: false,
          help: 'Standard refund - a 10% fee (min $10, max $50) will be charged. Please use this for any scam refunds, or where the customer has changed their mind. Customers should have been advised via Intercom about the fee',
          reasons: {
            bottomWarning: '<b>Warning:</b> Clicking this button will process an actual refund to the customer. Please ensure all details are correct before proceeding. This action cannot be undone.',
            items: createReasonItems()
          }
        }), createProcessedOrderAction({
          label: '<b>Processed Order:</b> Reconvert and refund resulting amount value, zero fee',
          value: 'no-fee',
          disabled: true,
          help: 'No-fee refund - in some circumstances we may choose to waive a fee. This would apply where the customer is not at fault (eg system error) or where we have chosen to refund their order and they do not agree with our decision',
          reasons: {
            bottomWarning: '<b>Warning:</b> Clicking this button will process an actual refund to the customer. Please ensure all details are correct before proceeding. This action cannot be undone.',
            items: createReasonItems()
          }
        }), createProcessedOrderAction({
          label: '<b>Processed Order:</b> Refund original order value (*Only enabled for people with full Refund authority)',
          value: 'full',
          disabled: true,
          help: 'Full refund - this will result in the customer receiving back the original value they paid. EC will wear the loss of any cryptocurrency movement',
          reasons: {
            topWarning: '<b>!!! Action: Create a Fix-it Jira ticket !!!</b>',
            items: [
              createCheckboxItem('I confirm I have made a request for refund', 'confirm'),
            ]
          }
        }), createProcessedOrderAction({
          label: '<b>Processed Order:</b> Reconvert Unpaid Order (*Only enabled for people with full Refund authority)',
          value: 'reconvert',
          disabled: true,
          help: 'Reconvert - if payment has not been received for an order there is no refund to the customer, however we are still holding the crypto amount. This option will sell the crypto and revert it back to NZD in EC’s account.'
        }),]
      };
    },
    async getCurrentOrder() {
      const isEmpty = param => (param === null) || (param === '') || (typeof param === 'undefined')
      return new Promise((resolve) => {
        setTimeout(() => {
          this.loading = false;
          let errorMessage = ''
          let alreadyRefunded = false
          const supportedMethods = ['manual', 'poli', 'pxpay'];
          if (this.order.direction !== 'buy'){
            errorMessage = 'order must be buy order'
            this.visible = false
          } else if (isEmpty(this.order.paid)){
            errorMessage = 'order must be paid'
          } else if (isEmpty(this.order.received)){
            errorMessage = 'order must be received'
          } else if (isEmpty(this.order.processed)){
            errorMessage = 'order must be processed'
          } else if (isEmpty(this.order.cancelled)){
            errorMessage = 'order must be cancelled'
          } else if (!isEmpty(this.order.completed)) {
            errorMessage = 'order must not be completed'
          } else if (isEmpty(this.order.bankAccount)) {
            errorMessage = 'bank account empty'
          } else if (!supportedMethods.includes(this.order.method)){
            errorMessage = `payment method (${this.order.method}) not supported. we only support (${supportedMethods.join(', ')})`
          } else if (!isEmpty(this.item.completed)) {
            errorMessage = 'item must not have status completed'
          } else if (this.item.status === 'Refunded') {
            errorMessage = ''
            alreadyRefunded = true
          } else if (this.item.status === 'Send') {
            errorMessage = 'item must not have status send'
          } else if (this.item.status === 'Completed') {
            errorMessage = 'item must not have status completed'
          } else if (!(this.item.status === 'Processed' || isEmpty(this.item.status))) {
            errorMessage = 'item must have status processed'
          }
          if (errorMessage || alreadyRefunded){
            resolve({
              loaded: true,
              isRefunded: alreadyRefunded,
              errorMessage: errorMessage,
              actions: [],
            })
          }
          let calculatedValue = this.calculatedValues
          console.log('calculation: ' + JSON.stringify(calculatedValue))
          resolve(this.createScreenObject(calculatedValue.finalToPay));
        }, 300)
      })
    },
    async getAlreadyRequestedRefundActions() {
      return new Promise((resolve) => {
        setTimeout(() => {
          this.loading = false;
          resolve({
            loaded: true,
            isRefunded: true,
            actions: [],
          })
        }, 300)
      })
    },
    nextStep: function (){
      if (this.refundOption == null){
        this.errorMessage = 'You have to select the refund action first!'
      }else{
        this.uiReasonStep = true
      }
    },
    previousStep: function (){
      this.errorMessage = null
      this.uiReasonStep = false
    },
    openModal: function (value) {
      this.uiShow = true
      this.uiShowOther = false
      this.refundOption = null
      this.reasonRadio = null
      this.reasonCheckboxes = {}
    },
    async update () {
      if (this.loading || !this.order.orderId) {
        return
      }
      this.loading = true
      try {
        this.dataRefundActions = await this.getCurrentOrder()
      } catch (e) {
        // nothing
        console.log('error' + e)
      }
      this.loading = false
    },
    async createRefundSellOrder(refundUid, total, bankAccount){
      let orderId
      try {
        let res = await this.ecApi('order-admin', 'createSell', {
          uid: refundUid,
          total: total,
          bankAccount: bankAccount
        })
        if (res && res.hasOwnProperty('orderId')) {
          orderId = res.orderId
        } else {
          return
        }
      } catch (e) {
        console.log(e)
        this.$buefy.toast.open('An error occured, please try again')
        return
      }
      return orderId
    },
    async requestQueueOrder(orderId, symbol, symbolName, amount){
      let res = await this.apiv2('sell-admin', 'queueOrder', {
        orderId: orderId,
        exchange: 'refund',
        coins: [
          {
            'symbol': symbol,
            'name': symbolName,
            'amount': amount,
            'final': null,
            'quoted': null,
            'address': 'Refund Order',
            'memo': null,
            'coinText': null
          }
        ]
      })
      if (!res) {
        console.log('error')
        this.$buefy.toast.open('An error occured 2, please try again')
        return
      }
      return res.coins[0].final;
    },
    async postPdbRefundDeposit(orderId, coin, amount, txId) {
      await this.pdbApi('/pdb/eca/refund-deposit', {
        orderId: orderId,
        coin: coin,
        amount: amount,
        txId: txId
      })
    },
    async postPdbRefundSellPayout(originalOrderId, originalOrderToPay, originalOrderBank) {
      await this.pdbApi('/pdb/eca/refund-sell-payout', {
        orderId: originalOrderId,
        toPay: originalOrderToPay,
        bank: originalOrderBank
      })
    },
    async finishRefund(originalUid, refundUid, what, who, why, refundWhy, itemId){
      let res = await this.apiv2('admin', 'refund', {
        originalUid: originalUid,
        refundUid: refundUid,
        what: what,
        who: who,
        why: why,
        refundWhy: refundWhy,
        itemId: itemId
      })
      if (!res) {
        console.log('error')
        this.$buefy.toast.open('An error occured 2, please try again')
      }
    },
    async emailRefund(email, subject, body) {
      await this.sendEmail({
        email: email,
        subject: subject,
        body: body
      })
    },
    async createRefundFull (refundOption, reason) {
      // Generic internal refund account details - this will deliver the funds internally back to EC
      const refundUid = 'cJan0oAAi1WfxgdnplbLmIoKRTI2'
      let refundBank
      let refundOriginalAmount = false

      const originalOrder = this.order
      switch (refundOption){
      case 'standard':
        refundBank = originalOrder.bankAccount
        break;
      case 'no-fee':
        refundBank = originalOrder.bankAccount
        break;
      case 'full':
        refundBank = '00-0000-0000000-00'
        refundOriginalAmount = true
        break;
      case 'reconvert':
        refundBank = originalOrder.bankAccount
        break;
      default:
        console.log('not supported option');
        return
      }
      let newOrderId = await this.createRefundSellOrder(refundUid, this.order.total, refundBank);
      // Set the final amount (in case it changes due to a queued order
      let newFilledAmount = await this.requestQueueOrder(newOrderId, this.item.coin, this.item.coin, this.item.filled);
      await this.postPdbRefundDeposit(newOrderId, this.item.coin, newFilledAmount, `Refund for order ${originalOrder.orderId}`)
      if(refundOriginalAmount) {
        await this.postPdbRefundSellPayout(originalOrder.orderId, originalOrder.toPay, originalOrder.bankAccount);
      }
      let who = this.$store.state.goauth.name || 'ECA agent'
      let what
      let why
      let subject = 'Refund'
      let body
      let refundWhy = `${newOrderId} = ${originalOrder.orderId} refunded`
      let itemId = this.item.id
      switch (refundOption){
      case 'standard':
        what = 'Refunded order - standard'
        why = `Order ${originalOrder.orderId} reconverted in order ${newOrderId}, and the completed amount from the refund order has been paid out to customer, less ${this.calculatedValues.feeAmount} fee. (Their bank reference will be: ${newOrderId}) Reason: ${reason}`
        await this.finishRefund(originalOrder.uid, refundUid, what, who, why, refundWhy, itemId)
        body = `Hi ${originalOrder.firstName}

Order number ${originalOrder.orderId} has been processed for a refund.

A refund service fee has been deducted, the order amount has bee reconverted back into NZD and refunded into the bank account the payment was received from.

Due to fluctuations in currency the amount refunded may be different to the amount paid.

Payments may take up to 3 working days to appear back into the bank account that the payment was made from.`
        await this.emailRefund(originalOrder.email, subject, body)
        break;
      case 'no-fee':
        what = 'Refunded order - no fee'
        why = `Order ${originalOrder.orderId} reconverted in order ${newOrderId}, and the completed amount from the refund order has been paid out to the customer. (Their bank reference will be: ${originalOrder.orderId}) Reason: ${reason}`
        await this.finishRefund(originalOrder.uid, refundUid, what, who, why, refundWhy, itemId)
        body = `Hi ${orginalOrder.firstName}

Order number ${originalOrder.orderId} has been processed for a refund.

The order amount has been reconverted back into NZD and refunded into the bank account the payment was received from.

Due to fluctuations in currency the amount refunded may be different to the amount paid.

Payments may take up to 3 working days to appear back into the bank account that the payment was made from.`
        await this.emailRefund(originalOrder.email, subject, body)
        break;
      case 'full':
        what = 'Refunded order - full'
        why = `Order ${originalOrder.orderId} reconverted in order ${newOrderId}, and the original amount of the order has been paid out to the customer. (Their bank reference will be: ${originalOrder.orderId}) Reason: ${reason}`
        await this.finishRefund(originalOrder.uid, refundUid, what, who, why, refundWhy, itemId)
        body = `Hi ${originalOrder.firstName}

Order number ${originalOrder.orderId} has been processed for a refund and will be returned to the bank account the payment was received from.

Payments may take up to 3 working days to appear back into the bank account that the payment was made from.

The refund services fee have been waived in this instance. Please ensure future orders are correct as service fees may be applied.`
        await this.emailRefund(originalOrder.email, subject, body)
        break;
      case 'reconvert':
        what = 'Order reconverted'
        why = `Order ${originalOrder.orderId} reconverted in order ${newOrderId}`
        await this.finishRefund(originalOrder.uid, refundUid, what, who, why, refundWhy, itemId)
        break;
      default:
        console.log('not supported option');
        return
      }
    },
    async save () {
      if (this.loading) {
        return
      }
      this.loading = true
      let updated = false

      try {
        if(this.reasonRadio === 'other' && this.reasonOther === null){
          this.errorMessage = 'Other Reason is a required field'
          this.loading = false
          return
        }
        let reason = this.reasonRadio
        if (this.reasonOther !== null){
          reason += ' - ' . this.reasonOther
        }
        await this.createRefundFull(this.refundOption, reason)
        this.uiShow = false
        this.$emit('updated')
        updated = true
      } catch (e) {
        console.log(e)
      }
      this.loading = false
      if (updated) {
        await this.update()
        this.dataRefundActions = await this.getAlreadyRequestedRefundActions()
      }
    }
  }
}
</script>
