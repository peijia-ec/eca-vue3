<template>
  <div v-if="data">
    <section class="section">
      <b-loading :active.sync="loading" />
      <h2 class="title is-4">
        <clipboard :icon="false">
          {{ data.order.orderId }}
        </clipboard>
        <b-tag
          rounded
          v-if="data.order.unusualActivity"
          :class="'is-size-7 ' + UNUSUAL_ACTIVITY[data.order.unusualActivity].class">
          {{ UNUSUAL_ACTIVITY[data.order.unusualActivity].label }}
        </b-tag>
      </h2>
      <p class="subtitle is-5">
        <span v-if="data.order.method === 'buy-swap'">Buy Swap</span>
        <span v-else-if="data.order.method === 'sell-swap'">Sell Swap</span>
        <span v-else-if="sell">Sell order</span>
        <span v-else-if="data.order.ownAddress">Buy own address</span>
        <span v-else>
          <span class="icon"><i class="fa fa-file-zip-o" /></span>
          EC Wallet
        </span>
        <b-tag
          :type="orderOrigin.tag"
          rounded
          class="ml-2">
          {{ orderOrigin.label }}
        </b-tag>
      </p>
      <div
        v-if="delayedCoins.length && !data.order.completed"
        class="notification is-warning">
        <span class="icon"><i class="fa fa-exclamation-triangle" /></span>
        {{ delayedCoins.join(', ') }} currently closed for withdrawal on the exchange
      </div>
      <template v-if="!data.order.cancelled && !data.order.completed">
        <p v-if="!data.order.paid && data.order.direction === 'buy'">
          <span class="icon"><i class="fa fa-exclamation-triangle" /></span>
          Order has not been paid for
        </p>
        <div
          v-else-if="!data.order.hold && data.order.holdTilReceived && !data.order.received"
          class="notification is-warning">
          <span class="icon"><i class="fa fa-exclamation-triangle" /></span>
          Automatically held until payment received in bank account
        </div>
        <p
          v-if="!data.order.received && data.order.direction === 'buy'"
          :class="{ 'notification is-warning': data.order.hold }">
          <span class="icon"><i class="fa fa-exclamation-triangle" /></span>
          Payment not yet confirmed in bank account
        </p>
        <p
          v-else-if="!data.order.paid && data.order.direction === 'sell'"
          class="notification is-warning">
          <span class="icon"><i class="fa fa-exclamation-triangle" /></span>
          Crypto not deposited
        </p>
        <div
          v-if="data.order.error && !data.order.completed"
          class="notification is-danger">
          <!-- This comes from autoec.php/logError() -->
          <span class="icon"><i class="fa fa-exclamation-triangle" /></span>
          <b>Error:</b> {{ data.order.error }}
        </div>
        <div
          v-if="hasAccess($roles.Compliance) && !data.order.completed"
          class="field"
          style="margin-top: 1em">
          <button
            class="button"
            :class="{ 'is-danger': held, 'is-primary': !held }"
            @click="toggleHold">
            {{ held ? 'Release' : 'Hold' }}
            order
          </button>
        </div>
      </template>
      <b-table :data="data.items">
        <template #default="props">
          <b-table-column label="ID">
            <span class="has-text-grey-light">{{ props.row.id }}</span>
          </b-table-column>

          <b-table-column label="Coin">
            <span v-if="data.order.direction === 'swap'">
              {{ props.row.fromSymbol }}
              <span class="icon"><i class="fa fa-arrow-right" /></span>
              {{ props.row.toSymbol }}
            </span>
            <span v-else>{{ props.row.coin }}</span>
          </b-table-column>
          <b-table-column label="Network">
            {{ data.order.direction === 'sell' ? sellDepositNetwork : props.row.network }}
          </b-table-column>
          <b-table-column
            :visible="hasSellProcessingFee"
            label="Processing Fee">
            {{ data.items[0].processingFee }}
          </b-table-column>

          <b-table-column
            :visible="data.order.direction === 'swap'"
            label="Changelly ID">
            <a
              :href="`https://changelly.com/transaction/${props.row.externalId}`"
              target="_blank">
              {{ props.row.externalId }}
              <span class="icon"><i class="fa fa-external-link" /></span>
            </a>
          </b-table-column>

          <b-table-column
            :visible="data.order.direction !== 'sell'"
            :label="sell ? 'Crypto' : $local.currency">
            {{ sell ? props.row.final : props.row.nzd }}
          </b-table-column>
          <b-table-column
            :visible="data.order.direction === 'sell'"
            label="Quoted crypto">
            {{ cryptoNum(data.order.paid ? props.row.desired : props.row.final) }}
          </b-table-column>
          <b-table-column
            :visible="data.order.direction === 'sell'"
            label="Deposited crypto">
            <template v-if="data.order.paid">
              {{ cryptoNum(props.row.final) }}
              <b-tooltip
                v-if="parseFloat(props.row.final) < parseFloat(props.row.desired) * 0.999"
                label="Deposit amount different from initial amount">
                <b-icon
                  icon="exclamation-triangle"
                  type="is-danger" />
              </b-tooltip>
            </template>
          </b-table-column>

          <b-table-column label="Quoted">
            <span v-if="data.order.direction === 'buy'">{{ cryptoNum(props.row.quoted) }}</span>
            <span v-if="data.order.direction === 'sell'">{{ price(props.row.quoted) }}</span>
            <span v-if="data.order.direction === 'swap'">{{ cryptoNum(props.row.toQuoted) }}</span>
          </b-table-column>

          <b-table-column
            label="Quoted (nett)"
            :visible="data.order.direction === 'sell' && data.items[0].processingFee">
            <span>{{ price(nettQuoted) }}</span>
            <b-tooltip
              :label="nettQuotedTooltip"
              multilined
              style="margin-left: 5px">
              <i class="fa fa-question-circle-o cursor" />
            </b-tooltip>
          </b-table-column>

          <b-table-column label="Filled">
            <span v-if="data.order.direction === 'buy'">{{ cryptoNum(props.row.filled) }}</span>
            <span v-if="data.order.direction === 'sell'">{{ price(props.row.filled) }}</span>
            <span v-if="data.order.direction === 'swap'">{{ cryptoNum(props.row.toAmount) }}</span>
          </b-table-column>

          <b-table-column label="Error">
            {{ props.row.error }}
          </b-table-column>

          <b-table-column label="Status">
            {{ props.row.status }}
            <div class="is-inline-block">
              <Refund
                :order="data.order"
                :item="props.row"
                @updated="refundUpdated" />
            </div>
          </b-table-column>

          <b-table-column label="Diff">
            <template v-if="diff && data.order.direction === 'sell'">
              {{ diff.toFixed(2) }}%
              {{ price(props.row.filled - nettQuoted) }}
              <span
                class="icon has-text-danger"
                v-if="Math.abs(diff) >= 0.1"><i class="fa fa-exclamation-triangle" /></span><br>
            </template>
            <template
              v-if="data.order.direction === 'buy' && props.row.filled && props.row.quoted && Math.abs(props.row.filled - props.row.quoted) / props.row.quoted > 0.001">
              {{ (((props.row.filled / props.row.quoted) - 1) * 100).toFixed(2) }}%
              <span class="icon has-text-danger"><i class="fa fa-exclamation-triangle" /></span><br>
              {{ cryptoNum(props.row.filled - props.row.quoted) }} {{ props.row.coin }}
            </template>
          </b-table-column>

          <b-table-column label="Address">
            <blockchain-link
              :symbol="props.row.coin"
              :address="props.row.address"
              :network="props.row.network" />
            <br>
            <chainalysis-link
              :symbol="props.row.coin"
              :address="props.row.address" />
            <br>
            <div v-if="canEditAddress">
              <a
                title="Edit address"
                class="is-size-7 no-break"
                @click="editAddress(props.row)">
                <span class="icon"><i
                    class="fa"
                    :class="settingAddress ? 'fa-refresh' : 'fa-pencil'" /></span>
                Edit Address
              </a>
              <br>
              <a
                class="is-size-7 no-break"
                @click="invalidAddress(props.row, 'address')"><span class="icon"><i class="fa fa-envelope" /></span> Bad
                address</a><br>
              <a
                class="is-size-7 no-break"
                @click="invalidAddress(props.row, 'memo')"><span class="icon"><i class="fa fa-envelope" /></span> Bad
                memo</a>
            </div>
          </b-table-column>

          <b-table-column label="Memo">
            {{ props.row.memo }}
          </b-table-column>

          <b-table-column label="TXID">
            <blockchain-link
              v-if="props.row.txid"
              :symbol="props.row.coin"
              :txid="props.row.txid" />
          </b-table-column>
        </template>
      </b-table>
      <b-modal :active.sync="editModal">
        <div class="box content">
          <h3>Edit address:</h3>
          <b-field label="Address">
            <b-input v-model="newAddress" />
          </b-field>
          <b-field label="Memo/Tag">
            <b-input v-model="newMemo" />
          </b-field>
          <div class="buttons">
            <button
              :class="{ 'is-loading': settingAddress }"
              class="button is-success"
              @click="addressSet()">
              Set address
            </button>
            <button
              class="button"
              @click="addressCancel()">
              Cancel
            </button>
          </div>
        </div>
      </b-modal>
      <br>
      <div class="columns">
        <div class="column">
          <!-- Special functions for NZ refund's user -->
          <article
            v-if="data.order.uid === 'sauwgyXf5VWDCwa9IglQCAQXCtI3' && data.order.completed && data.order.direction === 'sell'"
            class="message is-danger">
            <div class="message-body is-size-7 content">
              <p>Link to customer {{ manualMatchMethod || 'sell or sell-swap' }} order.</p>
              <p v-if="!manualMatchMethod || manualMatchMethod !== 'sell-swap'">
                <b-icon icon="exclamation-triangle" />
                <b>Sell order: This will send {{ currency(sellTotal, 2) }} to the customer's bank account!</b>
              </p>
              <p v-if="!manualMatchMethod || manualMatchMethod === 'sell-swap'">
                <b-icon icon="exclamation-triangle" />
                <b>Sell Swap order: This action marks the order as paid, triggers a related Swap Buy order, and transfers
                  the bought crypto to the linked wallet address!</b>
              </p>
              <b-field
                :message="error.manualMatch"
                :type="error.manualMatch && 'is-danger'">
                <div class="is-flex">
                  <b-input
                    v-model="manualMatch"
                    @input="error.manualMatch = null"
                    placeholder="Customer order ID" />
                  <p class="control">
                    <b-button
                      class="button is-primary"
                      :loading="loading"
                      :disabled="invalidOrderId"
                      @click="manualOrderLink">
                      Link
                    </b-button>
                  </p>
                </div>
              </b-field>
              <p v-if="manualMatchMethod">
                This is a <b>{{ manualMatchMethod }}</b> order
              </p>
            </div>
          </article>
          <table class="table">
            <tr>
              <td>Email</td>
              <td v-if="!$route.query.uid">
                <router-link :to="{ name: 'user', query: { uid: data.order.uid } }">
                  {{ data.order.email }}
                </router-link>
              </td>
              <td v-else>
                {{ data.order.email }}
              </td>
            </tr>
            <tr>
              <td>Name</td>
              <td>{{ data.order.displayName }}</td>
            </tr>
            <tr>
              <td>Total</td>
              <td v-if="data.order.direction === 'sell'">
                {{ currency(sellTotal) }}
              </td>
              <td v-else>
                {{ currency(toFloat(data.order.total) + toFloat(data.order.fee), 2) }}
              </td>
            </tr>
            <tr>
              <td>To pay</td>
              <td> {{ currency(data.order.toPay, 2) }}</td>
            </tr>
            <tr>
              <td>Fee</td>
              <td>{{ currency(data.order.fee, 2) }}</td>
            </tr>
            <tr v-if="hasAccess($roles.Admin)">
              <td>
                Margin
                <b-tooltip
                  label="Easy Crypto fee applied to the order. Related to “What does Easy Crypto charge” % on the order."
                  multilined
                  style="margin-left: 5px">
                  <i class="fa fa-question-circle-o cursor" />
                </b-tooltip>
              </td>
              <td>
                {{ data.items[0].margin }}
                <span v-if="data.order.direction !== 'sell'">{{ matesTier(data.items[0].margin) }}</span>
              </td>
            </tr>
            <tr v-if="hasAccess($roles.Admin) && data.items[0].crypto_buffer">
              <td>Crypto buffer</td>
              <td>{{ data.items[0].crypto_buffer }}</td>
            </tr>
            <tr v-if="hasAccess($roles.Admin) && data.items[0].fiat_buffer">
              <td>Fiat buffer</td>
              <td>{{ data.items[0].fiat_buffer }}</td>
            </tr>
            <tr>
              <td>USD rate</td>
              <td>{{ niceNumber(data.order.usdRate, 4) }}</td>
            </tr>
            <tr v-if="!isSwap">
              <td>Bank account</td>
              <td>{{ data.order.bank }}</td>
            </tr>
            <tr v-if="!isSwap">
              <td>Bank name</td>
              <td>{{ data.order.bankName }}</td>
            </tr>
            <tr v-if="!data.order.ownAddress">
              <td>Pass phrase</td>
              <td>{{ data.order.passPhrase }}</td>
            </tr>
            <tr>
              <td>Created</td>
              <td>{{ data.order.created }}</td>
            </tr>
            <tr>
              <td>Cancelled</td>
              <td>
                <template v-if="!data.order.completed">
                  <b-tag
                    v-if="data.order.cancelled"
                    type="is-warning">
                    {{ data.order.cancelled }}
                  </b-tag>
                  <a
                    v-if="!data.order.cancelled"
                    @click="cancelOrder">Cancel order
                    <span class="icon"><i class="fa fa-exclamation-triangle" /></span>
                  </a>
                  <a
                    v-if="data.order.cancelled && !data.order.processed"
                    @click="cancelOrder('uncancel')">Un-cancel order
                    <span class="icon"><i class="fa fa-exclamation-triangle" /></span>
                  </a>
                </template>
              </td>
            </tr>
            <tr>
              <td>Paid</td>
              <td>{{ data.order.paid }}</td>
            </tr>
            <tr>
              <td>Received</td>
              <td>{{ data.order.received }}</td>
            </tr>
            <tr>
              <td>Processed</td>
              <td>{{ data.order.processed }}</td>
            </tr>
            <tr>
              <td>Completed</td>
              <td>
                <b-tag
                  v-if="data.order.completed"
                  type="is-success">
                  {{ data.order.completed }}
                </b-tag>
              </td>
            </tr>
            <tr>
              <td>Method</td>
              <td>{{ data.order.method }}</td>
            </tr>
            <tr v-if="data.order.method === 'eftpos'">
              <td>
                Payer ID
                <b-tooltip
                  label="Defines the type of consumer personal identifier that has been used, during the payment method journey"
                  multilined
                  style="margin-left: 5px">
                  <i class="fa fa-question-circle-o cursor" />
                </b-tooltip>
              </td>
              <td>{{ payerId }}</td>
            </tr>
            <tr>
              <td>
                IP Address
                <b-tooltip
                  label="IP address of user, when the order was made."
                  multilined
                  style="margin-left: 5px">
                  <i class="fa fa-question-circle-o cursor" />
                </b-tooltip>
              </td>
              <td>{{ data.order.ipAddress }}</td>
            </tr>
            <template v-if="data.order.poliId">
              <tr v-if="$local.countryCode === 'ZA'">
                <td>Moonpay ID</td>
                <td>
                  <a
                    target="_blank"
                    :href="`https://www.moonpay.io/transactions/${data.order.poliId}/`">
                    {{ data.order.poliId }}
                    <span class="icon"><i class="fa fa-external-link" /></span>
                  </a>
                </td>
              </tr>
              <tr v-if="$local.countryCode === 'NG'">
                <td>AZA ID</td>
                <td>
                  <a
                    target="_blank"
                    :href="`https://developers.transferzero.com/organizations/46100115-0916-4a64-a691-4db25bc59012/mto/transactions/${data.order.poliId}?environment_id=live`">
                    {{ data.order.poliId }}
                    <span class="icon"><i class="fa fa-external-link" /></span>
                  </a>
                </td>
              </tr>
              <tr v-else-if="data.order.method === 'indacoin'">
                <td>Indacoin ID</td>
                <td>
                  <a
                    target="_blank"
                    :href="`https://api.easycrypto.nz/apiv2/scripts/get-indacoin-info.php?id=${data.order.poliId}`">
                    {{ data.order.poliId }}
                    <span class="icon"><i class="fa fa-external-link" /></span>
                  </a>
                </td>
              </tr>
              <tr v-else>
                <td>External ID</td>
                <td>{{ data.order.poliId }}</td>
              </tr>
            </template>
            <tr>
              <td>Security hash</td>
              <td>{{ data.order.hash }}</td>
            </tr>
            <tr>
              <td>Site version</td>
              <td>{{ data.order.siteVersion }}</td>
            </tr>
            <tr>
              <td>System</td>
              <td>{{ data.order.new_core ? 'Core' : 'Legacy' }}</td>
            </tr>
            <tr v-if="data.order.direction !== 'sell' && $local.countryCode === 'NZ'">
              <td>
                Address Info:
                <b-tooltip
                  label="Visible if customer has selected no to to owning the addresses in this order"
                  multilined
                  style="margin-left: 5px">
                  <i class="fa fa-question-circle-o cursor" />
                </b-tooltip>
              </td>
              <td>
                <div
                  v-for="(record, i) in data.items"
                  :key="'ptr' + i">
                  <div v-if="record.ptrInformation.length && !record.ptrInformation[0].ownAddress">
                    <strong>Coin: </strong>
                    <span class="crypto-address">{{ data.items[i].coin }}</span><br>
                    <strong>Address Owner:</strong> {{ record.ptrInformation[0].addressType }}
                    <div v-if="record.ptrInformation[0].addressType === 'Individual'">
                      <strong>Name:</strong> {{ record.ptrInformation[0].firstName + ' ' +
                        record.ptrInformation[0].lastName }}
                    </div>
                    <div v-else>
                      <strong>Company Name:</strong> {{ record.ptrInformation[0].companyName }}
                    </div>
                    <div>
                      <strong>Country:</strong> {{ record.ptrInformation[0].country }}
                    </div>
                    <br>
                  </div>
                </div>
              </td>
            </tr>
            <tr v-if="data.order.instantPayLink">
              <td>Instant Pay Link (Stitch)</td>
              <td>
                <clipboard>{{ data.order.instantPayLink }}</clipboard>
              </td>
            </tr>
            <tr v-if="data.items[0].ratesPayload">
              <td>
                Rates Payload
                <b-tooltip
                  label="Rates used in frontend to quote during order creation."
                  multilined
                  style="margin-left: 5px">
                  <i class="fa fa-question-circle-o cursor" />
                </b-tooltip>
              </td>
              <td>
                <pre
                  v-for="(item, i) in data.items"
                  :key="i"
                  class="rates-payload">{{ item.ratesPayload }}</pre>
              </td>
            </tr>
            <tr v-if="data.order.direction === 'sell' && data.items[0].networkSelected">
              <td>
                Selected Network
                <b-tooltip
                  label="This is the network the user selected to use during the sell process, if no selection is available the default network is filled. Note this may differ from the network used for final deposit."
                  multilined
                  style="margin-left: 5px">
                  <i class="fa fa-question-circle-o cursor" />
                </b-tooltip>
              </td>
              <td>
                {{ data.items[0].networkSelected }}
              </td>
            </tr>
          </table>
        </div>
        <div class="column">
          <div v-if="data.swaps.length">
            <span class="is-size-5">Swap Order</span>
            <b-table :data="data.swaps">
              <template #default="props">
                <b-table-column label="ID">
                  <span class="has-text-grey-light">{{ props.row.id }}</span>
                </b-table-column>

                <b-table-column label="Coin">
                  {{ props.row.fromSymbol }}
                  <span class="icon"><i class="fa fa-arrow-right" /></span>
                  {{ props.row.toSymbol }}
                </b-table-column>

                <b-table-column label="Quoted">
                  {{ props.row.fromQuoted }}
                  <span class="icon"><i class="fa fa-arrow-right" /></span>
                  {{ props.row.toQuoted }}
                </b-table-column>

                <b-table-column
                  v-if="data.order.direction === 'sell'"
                  label="Buy Swap">
                  <router-link
                    v-if="!$route.query.orderId"
                    :to="{ name: 'user', query: { uid: props.row.uid, orderId: props.row.orderId } }">
                    {{ props.row.externalId }}
                  </router-link>
                  <a
                    v-else
                    @click="switchOrder(props.row.externalId)">
                    {{ props.row.externalId }}
                  </a>
                </b-table-column>

                <b-table-column
                  v-if="data.order.direction === 'buy'"
                  label="Sell Swap">
                  <router-link
                    v-if="!$route.query.orderId"
                    :to="{ name: 'user', query: { uid: props.row.uid, orderId: props.row.orderId } }">
                    {{ props.row.orderId }}
                  </router-link>
                  <a
                    v-else
                    @click="switchOrder(props.row.orderId)">
                    {{ props.row.orderId }}
                  </a>
                </b-table-column>
              </template>
            </b-table>
          </div>

          <compliance-log
            :uid="uid"
            :order-id="data.order.orderId" />
        </div>
      </div>
      <section
        v-if="hasAccess($roles.Admin)"
        class="section content">
        <h1>SQL quick commands</h1>
        <h4>Recover private key</h4>
        <pre><clipboard>SELECT orderId, coin, privateKey FROM addresses where `orderId`='{{ data.order.orderId }}';</clipboard></pre>
        <template v-if="data.order.processed && !data.order.completed">
          <hr>
          <h3>Refund a processed order</h3>
          <b-field>
            <b-checkbox v-model="refundToCustomer">
              Send the refund back to the customer's bank account
            </b-checkbox>
          </b-field>
          <b-field>
            <b-checkbox v-model="refundOriginalAmount">
              Refund the original amount of the order, not the current market value
            </b-checkbox>
          </b-field>
          <b-message
            v-if="refundToCustomer && !data.order.bank"
            type="is-warning">
            This customer has no bank account details on the order, so we can't send it back to their account.
          </b-message>
          <template v-else>
            <p><a @click="createRefund">Refund this order</a></p>
            <h5>PDB</h5>
            <pre><clipboard>{{ refundSql }}</clipboard></pre>
            <h5>UDB</h5>
            <pre><clipboard>{{ refundSqlUdb }}</clipboard></pre>
          </template>
        </template>
        <template v-if="!data.order.paid && !data.order.cancelled">
          <hr>
          <h3>Mark the order as paid</h3>
          <b-field>
            <b-checkbox v-model="markReceived">
              Tick if we have definitely received the funds in our bank account
            </b-checkbox>
          </b-field>
          <h5>UDB</h5>
          <pre><clipboard>
            UPDATE orders SET paid = NOW(){{ markReceived ? ', received = NOW()' : '' }} WHERE orderId = '{{ data.order.orderId }}' AND paid IS NULL;
          </clipboard></pre>
          <h5>PDB (if needed)</h5>
          <pre><clipboard>
          INSERT INTO `payments` (`orderId`, `total`, `paid`) VALUES ('{{ data.order.orderId }}', '{{ data.order.toPay }}', NOW());
        </clipboard></pre>
        </template>
        <template v-if="data.order.paid && !data.order.processed">
          <hr>
          <h3>Refund an unprocessed fiat payment</h3>
          <b-field label="Add a fee for this refund">
            <b-input
              v-model="refundFee"
              type="number"
              placeholder="Enter fee amount" />
          </b-field>
          <h5>UDB</h5>
          <pre><clipboard>
            UPDATE orders SET cancelled = NOW() WHERE orderId = '{{ data.order.orderId }}' AND cancelled IS NULL;
          </clipboard></pre>
          <h5>PDB</h5>
          <pre v-if="data.order.bankAccount"><clipboard>
            INSERT INTO `sell_payouts` (`orderId`, `amount`, `bank1`, `bank2`, `queued`)
            VALUES ('{{ data.order.orderId }}', '{{ Math.max(0, data.order.toPay - (parseFloat(refundFee) || 0)) }}', '{{ data.order.bankAccount.replace(/[^\d-]/, '') }}', '{{ safeBankName }}', NOW());
            </clipboard></pre>
        </template>
        <template v-if="!data.order.cancelled">
          <h3>Manually mark order as complete</h3>
          <h5>UDB</h5>
          <pre v-if="data.order.direction === 'buy'"><clipboard>
        UPDATE items SET filled=quoted, completed=NOW() WHERE orders_id = (SELECT id FROM orders WHERE orderId='{{ data.order.orderId }}');
        UPDATE orders SET completed=NOW(), processed=NOW(), received=NOW(), cancelled=NULL WHERE orderId='{{ data.order.orderId }}';
        </clipboard></pre>
          <template v-if="data.order.direction === 'sell' && data.items[0]">
            <!-- Sell order -->
            <pre><clipboard>
        UPDATE sell_testing SET filled=quoted, processed=NOW(), completed=NOW(), cancelled=NULL WHERE orderId='{{ data.order.orderId }}';
        UPDATE orders SET paid=NOW(), completed=NOW(), processed=NOW(), received=NOW(), cancelled=NULL WHERE orderId='{{ data.order.orderId }}';
          </clipboard></pre>
            <h5>PDB</h5>
            <pre><clipboard>
            INSERT INTO `sell_payouts` (`orderId`, `amount`, `bank1`, `bank2`, `queued`) VALUES ('{{ data.order.orderId }}', '{{ data.items[0].filled || data.items[0].quoted }}', '{{ data.order.bankAccount }}', '{{ safeBankName }}', NOW());
          </clipboard></pre>
          </template>
          <section>
            <hr>
            <p>Stuff below for trading server only</p>
            <h3>Remove from batch sending</h3>
            <pre><clipboard>
            UPDATE transactions SET `batchPending`=null WHERE orderId='{{ data.order.orderId }}' AND coin='BTC' AND `nextStep`=-1;
            SELECT `orderId`, `toAddress`, `toAmount` FROM transactions WHERE `batchPending` IS NULL AND orderId='{{ data.order.orderId }}' AND coin='BTC' AND `nextStep`=-1 AND `datePlaced` IS NOT NULL AND `toAmount` IS NOT NULL;
          </clipboard></pre>
            <h3>Manually close a pending alt order and get delivery details</h3>
            <pre><clipboard>
            UPDATE transactions SET datePlaced=NOW(), toAmount=fromAmount WHERE `orderId`='{{ data.order.orderId }}' AND nextStep = -1;
            SELECT a.coin, a.address, a.memo, t.toAmount+t.withdrawFee AS amount FROM addresses a LEFT JOIN transactions t ON a.orderId=t.orderId WHERE a.orderId='{{ data.order.orderId }}' AND t.nextStep=-1;
          </clipboard></pre>
          </section>
        </template>
      </section>
    </section>
    <b-button
      type="is-primary"
      rounded
      class="sticky-update-btn"
      icon-left="refresh"
      @click="refreshPage"
      :class="{ 'is-loading': loading }">
      Refresh
    </b-button>
  </div>
</template>

<script>
import BlockchainLink from './parts/BlockchainLink.vue'
import ComplianceLog from './parts/ComplianceLog.vue'
import Clipboard from './parts/Clipboard.vue'
import ChainalysisLink from './parts/ChainalysisLink.vue'
import { UNUSUAL_ACTIVITY } from './parts/user/UnusualActivityDropdown.vue'
import router from '@/router'
import Refund from './parts/order/Refund.vue'

export default {
  name: 'Order',
  components: { Refund, BlockchainLink, ComplianceLog, Clipboard, ChainalysisLink },
  props: {
    selectedOrderId: {
      type: String,
      required: false
    }
  },
  data () {
    return {
      orderId: null,
      data: null,
      settingAddress: false,
      refundSql: null,
      refundSqlUdb: null,
      loading: false,
      editModal: false,
      addressSet: null,
      addressCancel: null,
      manualMatch: '',
      newAddress: '',
      newMemo: '',
      refundFee: '',
      refundToCustomer: true,
      refundOriginalAmount: false,
      markReceived: false,
      manualMatchMethod: null,
      error: {
        manualMatch: null
      },
      UNUSUAL_ACTIVITY,
      payerId: null,
      lifetimeValue: 0,
      nettQuotedTooltip: ''
    }
  },
  head () {
    if (this.selectedOrderId) {
      return this.head(this.selectedOrderId)
    } else {
      return this.head(this.$route.query.orderId) // previous version
    }
  },
  computed: {
    sellDepositNetwork () {
      const deposit = this.$store.state.info.deposits.find(
        x => x.orderId === this.orderId
      )
      if (deposit && deposit.network) {
        return deposit.network
      }
      return ''
    },
    safeBankName () {
      const name = this.data.order.displayName || 'NULL'
      return name.replace(/[^\w ]/, '')
    },
    sellTotal () {
      // Sum up the total of all the items in this order
      return this.data && this.data.order.direction === 'sell' ? this.data.items.reduce((a, b) => a + (b.filled || 0), 0) : 0
    },
    held () {
      return this.data && (this.data.order.hold || this.data.order.holdTilReceived)
    },
    delayedCoins () {
      let delayedCoins = []
      for (let e of this.data.items) {
        if (this.$store.state.coins.coins.hasOwnProperty(e.coin) && this.$store.state.coins.coins[e.coin].delayed) {
          delayedCoins.push(e.coin)
        }
      }
      return delayedCoins
    },
    uid () {
      return this.data ? this.data.order.uid : null
    },
    sell () {
      return this.data && this.data.order.direction === 'sell'
    },
    isSwap () {
      return this.data && ((this.data.order.direction === 'sell' && this.data.order.method === 'sell-swap') || (this.data.order.direction === 'buy' && this.data.order.method === 'buy-swap'))
    },
    canEditAddress () {
      return this.data && !this.data.order.completed && this.data.order.direction === 'buy'
    },
    invalidOrderId () {
      return !this.manualMatch || !!this.error.manualMatch
    },
    orderOrigin () {
      switch (this.data.order.isFromWalletApp) {
        case 1:
          return {
            label: 'App',
            tag: 'is-info'
          }
        case 2:
          return {
            label: 'W2A',
            tag: 'is-primary'
          }
        default:
          return {
            label: 'Web',
            tag: ''
          }
      }
    },
    hasSellProcessingFee () {
      return this.data.order.direction === 'sell' && this.data.items[0].processingFee
    },
    nettQuoted () {
      // Todo: If Core rate does not exist, temporarily use the FE rate in ratesPayload
      // this.nettQuotedTooltip = 'Nett quoted price. Processing fee is deducted. Processing fee fiat value is calculated based on Core sell rate.'
      const item = this.data.items[0]
      const sellRate = item.ratesPayload && JSON.parse(item.ratesPayload).sellRate
      if (!sellRate) {
        this.nettQuotedTooltip = 'Unknown sell rate. Nett quoted value cannot be determined, fallback to display raw quote.'
        return item.quoted
      }
      const quotedCrypto = this.data.order.paid ? item.desired : item.final
      this.nettQuotedTooltip = 'Nett quoted price. Processing fee is deducted. Processing fee fiat value is calculated based on frontend sell rate.'
      return (quotedCrypto - item.processingFee) * sellRate
    },
    diff () {
      const item = this.data.items[0]
      if (!item.quoted || !item.filled) {
        return 0
      }
      return ((item.filled / this.nettQuoted) - 1) * 100
    }
  },
  watch: {
    '$route.query.orderId' () {
      this.getData(this.$route.query.orderId)
    }
  },
  mounted () {
    if (this.selectedOrderId) {
      this.getData(this.selectedOrderId)
    } else {
      this.getData(this.$route.query.orderId)
    }
  },
  methods: {
    async refundUpdated () {
      this.$emit('updated')
    },
    async manualOrderLink () {
      if (this.loading) {
        return
      }
      this.loading = true
      let ourId = this.data.order.orderId
      try {
        // Update the order in UDB
        const res = await this.apiv2('admin', 'matchUnknownDeposit', {
          theirId: this.manualMatch.trim(),
          ourId: ourId
        })
        if (res) {
          this.manualMatchMethod = res.method
          if (res.method !== 'sell-swap') {
            // Update the order in PDB (Only create payout when method is sell)
            await this.pdbApi('/pdb/eca/match-unknown-sell-order', {
              orderId: ourId
            })
          }
          this.$buefy.toast.open('Order manually matched!')
        }
        await this.getData(ourId)
      } catch (e) {
        if (e === 'Error 71') {
          this.error.manualMatch = 'Order ID is invalid please try another input.'
        } else {
          this.error.manualMatch = e
        }
      }
      this.loading = false
    },
    invalidAddress (item, type) {
      let coin = this.$store.state.coins.coins[item.coin]
      let coinFull = coin.name.toUpperCase() === coin.symbol.toUpperCase() ? coin.name : `${coin.name} (${coin.symbol})`
      let body
      if (type === 'memo') {
        body = `Hi ${this.data.order.firstName}

I've just had a look at your order and can see you haven't included a memo/tag with the ${coinFull} address.

It is absolutely critical to include the right memo/tag when your exchange account has asked for it, otherwise your ${coin.symbol} could be lost forever.

Luckily in this case our system picked up that you needed one, but we can't guarantee that will always happen.

Please let us know the right memo/tag for this order and we'll be able to send it out for you.`
      } else {
        body = `Hi ${this.data.order.firstName}

We haven't been able to send your order as your ${coinFull} address doesn't appear to be valid.

The address you used was ${item.address}

Can you please let us know your ${coin.name} address and we'll get that order out to you ASAP.

Please make sure to copy and paste the address. Do not type it by hand as that can lead to errors.\n\n`

        // Check for wallet suggestion
        if (coin.wallet) {
          body += `If you don't already have a ${coin.name} wallet, you can download one from here:\n\n${coin.wallet}`
        }
      }

      this.sendEmail({
        email: this.data.order.email,
        subject: `Issue with order ${this.orderId}`,
        body: body
      })
        .then(() => {
          // Hold the order
          return this.ecApi('admin', 'setValue', {
            orderId: this.data.order.orderId,
            why: `Invalid ${coin.symbol} ${type} on order ${this.orderId}. The customer has been emailed and the order is held.`,
            table: 'order',
            field: 'hold',
            value: 1
          })
        })
        .then(() => {
          this.$buefy.toast.open('Email sent!')
          this.loading = false
          this.getData(this.data.order.orderId)
        })
        .catch((e) => {
          this.$buefy.toast.open('Failed to send email :(')
          console.log(e)
          this.loading = false
        })
    },
    async editAddress (item) {
      if (this.settingAddress) {
        return
      }
      this.newAddress = item.address
      this.newMemo = item.memo
      try {
        await new Promise((resolve, reject) => {
          this.editModal = true
          this.addressSet = resolve
          this.addressCancel = reject
        })
        this.settingAddress = true
        await this.ecApi('admin', 'setItemAddress', {
          itemId: item.id,
          address: this.newAddress.trim(),
          memo: this.newMemo ? this.newMemo.trim() : null
        })
        await this.getData(this.orderId)
      } catch (e) {
        // nothing
        console.log(e)
      }
      this.settingAddress = false
      this.editModal = false
    },
    cancelOrder (type) {
      let orderId = this.data.order.orderId
      let text = type === 'uncancel' ? 'uncancel' : 'cancel'
      this.$buefy.dialog.confirm({
        message: `Are you sure you want to ${text} ${orderId}?`,
        onConfirm: () => {
          this.ecApi('admin', 'setValue', {
            orderId: orderId,
            table: 'order',
            field: `${text}led`
          })
            .then(() => {
              this.$buefy.toast.open(this.ucFirst(text) + 'led!')
              this.getData(orderId)
            })
            .catch(r => console.log(r))
        }
      })
    },
    async getData (orderId) {
      try {
        let data = await this.ecApi('admin', 'getOrder', {
          orderId: orderId
        })
        this.orderId = orderId

        // Update the page title
        this.$emit('updateHead')

        // Set swap addresses to common property name
        if (data.order.direction === 'swap') {
          for (let item of data.items) {
            item.coin = item.toSymbol
            item.address = item.toAddress
            item.memo = item.toMemo
            item.txid = item.toTxid
          }
        }

        // get eftpos payer ID
        if (data.order.method === 'eftpos') {
          this.getEftposPayerId()
        }

        let bank
        if (data.order.bankAccount && data.order.bankAccount.match(/^\d{2}-\d{4}-\d{7}-\d{2,3}$/)) {
          bank = data.order.bankAccount
        } else {
          bank = this.formatBank(data.order.bsb, data.order.account, data.order.suffix, data.order.bankAccount)
        }
        data.order.bank = bank
        let bankName
        if (data.order.bankName) {
          bankName = data.order.bankName
        } else {
          bankName = data.order.bankFirst + ' ' + data.order.bankLast
        }
        data.order.bankName = bankName
        this.data = data
        // if uid mismatches uid of order redirect to old order page
        if (this.$route.query.uid && this.$route.query.uid !== this.data.order.uid) {
          this.$router.push({ path: '/order', query: { orderId } })
        }
      } catch (e) {
        console.log(e)
      }
    },
    toggleHold () {
      let text = this.held ? 'will no longer be held' : 'will be held indefinitely'
      this.$buefy.dialog.confirm({
        message: 'This order ' + text + ', are you sure?',
        onConfirm: () => {
          this.ecApi('admin', 'setValue', {
            orderId: this.data.order.orderId,
            table: 'order',
            field: 'hold',
            value: this.held ? 0 : 1
          })
            .then(() => {
              this.$buefy.toast.open('Order ' + this.data.order.orderId + ' ' + text)
              // this.getData(this.$route.query.orderId)
              this.getData(this.selectedOrderId)
            })
        }
      })
    },
    paymentStatus (row) {
      let status, tag, date
      if (row.completed) {
        status = 'Complete'
        tag = 'is-success'
        date = row.completed
      } else if (row.processed) {
        status = 'Hold'
        tag = 'is-warning'
        date = row.paid
      } else if (row.paid) {
        status = 'Paid'
        tag = 'is-light'
        date = row.paid
      }
      return {
        status: status,
        tag: tag,
        date: date
      }
    },
    async createRefund () {
      // Create a refund for this order amount, and provide the UDB/PDB SQL
      if (!this.hasAccess(this.$roles.Admin)) {
        return
      }

      // Generic internal refund account details - this will deliver the funds internally back to EC
      const refundUid = '00YYuuw7CqNmLoHU73nSgmh7Jad2'
      const refundBank = '00-0000-0000000-00'

      const originalOrder = this.data.order
      const bankAccount = this.refundToCustomer && !this.refundOriginalAmount ? originalOrder.bank : refundBank

      let orderId
      try {
        let res = await this.ecApi('order-admin', 'createSell', {
          uid: refundUid,
          total: originalOrder.total,
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
      try {
        let item = this.data.items[0]
        let res = await this.apiv2('sell-admin', 'queueOrder', {
          orderId: orderId,
          exchange: 'refund',
          coins: [
            {
              'symbol': item.coin,
              'name': item.coin,
              'amount': item.filled,
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

        // Set the final amount (in case it changes due to a queued order
        item.filled = res.coins[0].final
        this.refundSql = `INSERT INTO deposits (exchange, \`date\`, orderId, coin, amount, txId)
                          VALUES ('refund', now(), '${orderId}', '${item.coin}', '${item.filled}', 'Refund for order ${originalOrder.orderId}');`

        // If we're sending the full refund back to the customer, add it to PDB SQL
        let suffix = ''
        if (this.refundToCustomer && this.refundOriginalAmount) {
          this.refundSql += `\n\nINSERT INTO \`sell_payouts\` (\`orderId\`, \`amount\`, \`bank1\`, \`bank2\`, \`queued\`)
          VALUES ('${originalOrder.orderId}', '${originalOrder.toPay}', '${originalOrder.bank}', 'REFUND', NOW());`
          suffix = `, and the customer has been paid out the original order amount of ${originalOrder.toPay}. (Their bank reference will be: ${originalOrder.orderId})`
        } else if (this.refundToCustomer) {
          suffix = `, and the completed amount from the refund order has been paid out to the customer. (Their bank reference will be: ${orderId})`
        }

        let who = this.$store.state.goauth.name || 'ECA agent'
        this.refundSqlUdb = `
          INSERT INTO suspect_logs (date, uid, what, why, who)
          VALUES (NOW(), '${originalOrder.uid}', 'Refunded order', 'Order ${originalOrder.orderId} refunded in order ${orderId}${suffix}', '${who}');

          INSERT INTO suspect_logs (date, uid, what, why, who)
          VALUES (NOW(), '${refundUid}', 'Refunded order', '${orderId} = ${originalOrder.orderId} refunded', '${who}');`
      } catch (e) {
        this.$buefy.toast.open('An error occured 3, please try again')
        console.log(e)
      }
    },
    async getEftposPayerId () {
      try {
        const res = await this.apiv2('api-admin/index', 'wordline/getPayerId', {
          orderId: this.orderId
        })
        this.payerId = res.payerId
      } catch (e) {
        console.error(e)
      }
    },
    switchOrder (orderId) {
      this.$emit('update', orderId)
      this.getData(orderId)
    },
    async refreshPage () {
      this.loading = true
      try {
        if (this.selectedOrderId) {
          this.getData(this.selectedOrderId)
        } else {
          this.getData(this.$route.query.orderId)
        }
        if (this.sell) {
          await this.$store.dispatch('info/deposits')
        }
      } catch (e) {
        console.error(e)
      }
      this.loading = false
    },
    matesTier (margin) {
      if (this.$local.countryCode !== 'NZ') {
        return ''
      }
      const baseMargin = this.$store.state.coins.buyMargin
      const discount = Math.round(((baseMargin - margin) / baseMargin) * 100)
      // Returns the mates rates tier based off margin
      if (+parseFloat(margin).toFixed(4) === 0.000) {
        return ''
      } else if (discount === 20) {
        return '(Tier 3)'
      } else if (discount === 15) {
        return '(Tier 2)'
      } else if (discount === 10) {
        return '(Tier 1)'
      } else {
        return ''
      }
    }
  }
}
</script>

<style scoped>
.rates-payload {
  max-width: 300px;
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
