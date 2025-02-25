<template>
  <div class="container is-desktop mb-3">
    <div class="columns">
      <div class="column">
        <div class="message is-warning">
          <div class="message-body">
            This page, which currently lacks data integration, is designed for the compliance team to explore and
            interact with the user interface. If you have any feedback, kindly communicate it to the development team.
          </div>
        </div>
        <FindUser @selected="selectUser" />
        <p
          class="title is-5"
          v-if="payload.uid"
        >
          Select orders to include in the report
        </p>
        <table class="table">
          <thead>
            <tr>
              <th
                class="cursor"
                @click="selectAll"
              >
                Select all
              </th>
              <th>Date</th>
              <th>ID</th>
              <th>Order Direction</th>
              <th>Total</th>
              <th>Coins</th>
              <th>Addr</th>
              <th>Method</th>
              <th>Account</th>
              <th>Name</th>
              <th>Completed At</th>
              <th>Canceled At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <div
              v-for="order of orders"
              :key="order.orderId"
            >
              <tr>
                <th>
                  <label class="radio">
                    <input
                      type="checkbox"
                      :value="order.orderId"
                      v-model="order.selected"
                      @click="populateDescription(order.orderId)"
                    >
                  </label>
                </th>
                <td>
                  {{ $moment(order.created).format('D MMM, HH:mm') }}
                </td>
                <td>
                  <router-link :to="{ name: 'order', query: { orderId: order.orderId } }">
                    {{ order.orderId }}
                  </router-link>
                </td>
                <td>{{ order.direction }}</td>
                <td>{{ currency(order.total) }}</td>
                <td>-</td>
                <td>-</td>
                <td>{{ order.method ? order.method : '-' }}</td>
                <td>{{ order.bankAccount ? order.bankAccount : '-' }}</td>
                <td>{{ order.bankName ? order.bankName : '-' }}</td>
                <td>{{ (order.completed) ? $moment(order.completed).format('D MMM, HH:mm') : "-" }}</td>
                <td>{{ (order.cancelled) ? $moment(order.cancelled).format('D MMM, HH:mm') : "-" }}</td>
                <td>
                  <div
                    class="field is-grouped"
                    v-if="order.selected"
                  >
                    <div
                      class="control"
                      v-if="order.direction === 'sell'"
                    >
                      <button
                        class="button is-link is-small"
                        @click="toggleSuspiciousParty(order, 'p1')"
                      >
                        <i class="fa fa-caret-down pull-left" /> Suspicious 1st party
                      </button>
                    </div>
                    <div class="control">
                      <button
                        class="button is-link is-small"
                        @click="toggleSuspiciousParty(order, 'p3')"
                        v-if="order.direction === 'buy'"
                      >
                        <i class="fa fa-caret-down pull-left" /> Suspicious 3rd party
                      </button>
                    </div>
                    <div class="control">
                      <button
                        class="button is-link is-small"
                        @click="toggleSuspiciousParty(order, 'p4')"
                      >
                        <i class="fa fa-caret-down pull-left" /> Suspicious 4th party
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
              <tr
                class="txn-description"
                :key="order.orderId + 'txn-description'"
                v-if="order.selected"
              >
                <td colspan="13">
                  <div class="field is-horizontal">
                    <div class="field-label is-normal">
                      <label class="label">Transaction Description ({{ order.orderId }})</label>
                    </div>
                    <div class="field-body">
                      <div class="field">
                        <div class="control">
                          <input
                            class="input"
                            type="text"
                            v-model="order.transactionDescription"
                          >
                          <p class="help">
                            (Optional) The transaction description will generated automatically to be added to the STR
                            report if it is not provided by the user.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="field is-horizontal">
                    <div class="field-label is-normal">
                      <label class="label">Transaction Comments</label>
                    </div>
                    <div class="field-body">
                      <div class="field">
                        <div class="control">
                          <input
                            class="input"
                            type="text"
                            v-model="order.transactionComments"
                          >
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
              <tr
                class="third-party"
                :key="order.orderId + 'p1'"
                v-if="order.p1 && order.selected"
              >
                <td colspan="13">
                  <div class="field is-horizontal">
                    <div class="field-label">
                      <!-- Left empty for spacing -->
                    </div>
                    <div class="field-body">
                      <div class="field">
                        <div class="control">
                          <p class="is-size-6">
                            Suspicious 1st party ({{ order.orderId }})
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="field is-horizontal">
                    <div class="field-label is-normal">
                      <label class="label">Institution name</label>
                    </div>
                    <div class="field-body">
                      <div class="field">
                        <div class="control">
                          <input
                            class="input"
                            type="text"
                            v-model="order.firstParty.institutionName"
                          >
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="field is-horizontal">
                    <div class="field-label is-normal">
                      <label class="label">Institution code</label>
                    </div>
                    <div class="field-body">
                      <div class="field">
                        <div class="control">
                          <input
                            class="input"
                            type="text"
                            v-model="order.firstParty.institutionCode"
                          >
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="field is-horizontal">
                    <div class="field-label is-normal">
                      <label class="label">Account name</label>
                    </div>
                    <div class="field-body">
                      <div class="field">
                        <div class="control">
                          <input
                            class="input"
                            type="text"
                            v-model="order.firstParty.accountName"
                          >
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="field is-horizontal">
                    <div class="field-label is-normal">
                      <label class="label">Account number</label>
                    </div>
                    <div class="field-body">
                      <div class="field">
                        <div class="control">
                          <input
                            class="input"
                            type="text"
                            v-model="order.firstParty.account"
                          >
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="field is-horizontal">
                    <div class="field-label is-normal">
                      <label class="label">Comments</label>
                    </div>
                    <div class="field-body">
                      <div class="field">
                        <div class="control">
                          <input
                            class="input"
                            type="text"
                            v-model="order.firstParty.comments"
                          >
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="field is-horizontal">
                    <div class="field-label is-normal">
                      <label class="label">Country</label>
                    </div>
                    <div class="field-body">
                      <div class="field">
                        <div class="select">
                          <select v-model="order.firstParty.country">
                            <option
                              v-for="(country, code) in countries"
                              :value="code"
                              :key="code"
                            >
                              {{ code }}
                            </option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
              <tr
                class="third-party"
                :key="order.orderId + 'p3'"
                v-if="order.p3 && order.selected"
              >
                <td colspan="13">
                  <div class="field is-horizontal">
                    <div class="field-label">
                      <!-- Left empty for spacing -->
                    </div>
                    <div class="field-body">
                      <div class="field">
                        <div class="control">
                          <p class="is-size-6">
                            Suspicious 3rd party ({{ order.orderId }})
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="field is-horizontal">
                    <div class="field-label is-normal">
                      <label class="label">Institution name</label>
                    </div>
                    <div class="field-body">
                      <div class="field">
                        <div class="control">
                          <input
                            class="input"
                            type="text"
                            v-model="order.thirdParty.institutionName"
                          >
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="field is-horizontal">
                    <div class="field-label is-normal">
                      <label class="label">Institution code</label>
                    </div>
                    <div class="field-body">
                      <div class="field">
                        <div class="control">
                          <input
                            class="input"
                            type="text"
                            v-model="order.thirdParty.institutionCode"
                          >
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="field is-horizontal">
                    <div class="field-label is-normal">
                      <label class="label">Account name</label>
                    </div>
                    <div class="field-body">
                      <div class="field">
                        <div class="control">
                          <input
                            class="input"
                            type="text"
                            v-model="order.thirdParty.accountName"
                          >
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="field is-horizontal">
                    <div class="field-label is-normal">
                      <label class="label">Account number</label>
                    </div>
                    <div class="field-body">
                      <div class="field">
                        <div class="control">
                          <input
                            class="input"
                            type="text"
                            v-model="order.thirdParty.account"
                          >
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="field is-horizontal">
                    <div class="field-label is-normal">
                      <label class="label">Comments</label>
                    </div>
                    <div class="field-body">
                      <div class="field">
                        <div class="control">
                          <input
                            class="input"
                            type="text"
                            v-model="order.thirdParty.comments"
                          >
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="field is-horizontal">
                    <div class="field-label is-normal">
                      <label class="label">Country</label>
                    </div>
                    <div class="field-body">
                      <div class="field">
                        <div class="select">
                          <select v-model="order.thirdParty.country">
                            <option
                              v-for="(country, code) in countries"
                              :value="code"
                              :key="code"
                            >
                              {{ code }}
                            </option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
              <tr
                class="forth-party"
                :key="order.orderId + 'p4'"
                v-if="order.p4 && order.selected"
              >
                <td colspan="13">
                  <div class="field is-horizontal">
                    <div class="field-label">
                      <!-- Left empty for spacing -->
                    </div>
                    <div class="field-body">
                      <div class="field">
                        <div class="control">
                          <p class="is-size-6">
                            Suspicious 4th party ({{ order.orderId }})
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="field is-horizontal">
                    <div class="field-label is-normal">
                      <label class="label">Institution name</label>
                    </div>
                    <div class="field-body">
                      <div class="field">
                        <div class="control">
                          <input
                            class="input"
                            type="text"
                            v-model="order.forthParty.institutionName"
                          >
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="field is-horizontal">
                    <div class="field-label is-normal">
                      <label class="label">Institution code</label>
                    </div>
                    <div class="field-body">
                      <div class="field">
                        <div class="control">
                          <input
                            class="input"
                            type="text"
                            v-model="order.forthParty.institutionCode"
                          >
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="field is-horizontal">
                    <div class="field-label is-normal">
                      <label class="label">Account number</label>
                    </div>
                    <div class="field-body">
                      <div class="field">
                        <div class="control">
                          <input
                            class="input"
                            type="text"
                            v-model="order.forthParty.account"
                          >
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="field is-horizontal">
                    <div class="field-label is-normal">
                      <label class="label">Account name</label>
                    </div>
                    <div class="field-body">
                      <div class="field">
                        <div class="control">
                          <input
                            class="input"
                            type="text"
                            v-model="order.forthParty.accountName"
                          >
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="field is-horizontal">
                    <div class="field-label is-normal">
                      <label class="label">Comments</label>
                    </div>
                    <div class="field-body">
                      <div class="field">
                        <div class="control">
                          <input
                            class="input"
                            type="text"
                            v-model="order.forthParty.comments"
                          >
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="field is-horizontal">
                    <div class="field-label is-normal">
                      <label class="label">Country</label>
                    </div>
                    <div class="field-body">
                      <div class="field">
                        <div class="select">
                          <select v-model="order.forthParty.country">
                            <option
                              v-for="(country, code) in countries"
                              :value="code"
                              :key="code"
                            >
                              {{ code }}
                            </option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            </div>
          </tbody>
        </table>

        <div
          class="field"
          v-if="payload.uid"
        >
          <label class="label">Reason</label>
          <div class="control">
            <input
              class="input"
              type="text"
              placeholder="Reason"
              v-model="payload.reason"
            >
          </div>
          <p class="help">
            REMINDER: If you're reporting scam, or other information "for intelligence purposes only",
            remember to add "For intelligence purposes only" and if reporting a scam then add "SCAM" to
            the reason field.
          </p>
        </div>
        <br>
        <div
          class="field"
          v-if="payload.uid"
        >
          <label class="label">Action taken</label>
          <div class="control">
            <div class="select">
              <select v-model="payload.actionTaken">
                <option
                  v-for="(action, index) in actions"
                  :value="action"
                  :key="index"
                >
                  {{ action }}
                </option>
              </select>
            </div>
          </div>
        </div>
        <br>
        <div
          class="field"
          v-if="payload.uid"
        >
          <label class="label">Select Indicators</label>
          <table class="table">
            <thead>
              <tr>
                <th>Select</th>
                <th>Indicator</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="indicator of indicators"
                :key="indicator.code"
              >
                <th>
                  <label class="radio">
                    <input
                      type="checkbox"
                      name="indicator"
                      v-model="indicator.selected"
                    >
                  </label>
                </th>
                <td>
                  {{ indicator.description }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <div
      class="message is-danger"
      v-if="validationErrors.length > 0"
    >
      <div class="message-body">
        You have the following errors. Please fix them and try again.
        <ul>
          <li
            v-for="(error, idx) in validationErrors"
            :key="idx"
          >
            • {{ error }}
          </li>
        </ul>
      </div>
    </div>
    <div>
      <button
        class="button is-primary"
        v-if="orders.length > 0 && payload.uid"
        @click="generateReport"
        :disabled="loading || !orders.filter(order => order.selected).length"
        v-text="loading ? 'Generating...' : 'Generate Report'"
      />
    </div>
    <div v-if="xml">
      <br>
      <pre>{{ xml }}</pre>
    </div>
    <br>
    <br>
    <br>
  </div>
</template>
<script>
import FindUser from './../parts/user/FindUser.vue'
import api from '@/api'

export default {
  components: { FindUser },
  data() {
    return {
      xml: null,
      uid: null,
      indicators: [],
      orders: [],
      actions: ['Account Banned', 'Account Held', 'No Action Taken'],
      token: '',
      result: '',
      selectedOrderId: null,
      countries: {
        'AF': 'Afghanistan',
        'AX': 'Aland Islands',
        'AL': 'Albania',
        'DZ': 'Algeria',
        'AS': 'American Samoa',
        'AD': 'Andorra',
        'AO': 'Angola',
        'AI': 'Anguilla',
        'AQ': 'Antarctica',
        'AG': 'Antigua And Barbuda',
        'AR': 'Argentina',
        'AM': 'Armenia',
        'AW': 'Aruba',
        'AU': 'Australia',
        'AT': 'Austria',
        'AZ': 'Azerbaijan',
        'BS': 'Bahamas',
        'BH': 'Bahrain',
        'BD': 'Bangladesh',
        'BB': 'Barbados',
        'BY': 'Belarus',
        'BE': 'Belgium',
        'BZ': 'Belize',
        'BJ': 'Benin',
        'BM': 'Bermuda',
        'BT': 'Bhutan',
        'BO': 'Bolivia',
        'BA': 'Bosnia And Herzegovina',
        'BW': 'Botswana',
        'BV': 'Bouvet Island',
        'BR': 'Brazil',
        'IO': 'British Indian Ocean Territory',
        'BN': 'Brunei Darussalam',
        'BG': 'Bulgaria',
        'BF': 'Burkina Faso',
        'BI': 'Burundi',
        'KH': 'Cambodia',
        'CM': 'Cameroon',
        'CA': 'Canada',
        'CV': 'Cape Verde',
        'KY': 'Cayman Islands',
        'CF': 'Central African Republic',
        'TD': 'Chad',
        'CL': 'Chile',
        'CN': 'China',
        'CX': 'Christmas Island',
        'CC': 'Cocos (Keeling) Islands',
        'CO': 'Colombia',
        'KM': 'Comoros',
        'CG': 'Congo',
        'CD': 'Congo, Democratic Republic',
        'CK': 'Cook Islands',
        'CR': 'Costa Rica',
        'CI': 'Cote D"Ivoire',
        'HR': 'Croatia',
        'CU': 'Cuba',
        'CY': 'Cyprus',
        'CZ': 'Czech Republic',
        'DK': 'Denmark',
        'DJ': 'Djibouti',
        'DM': 'Dominica',
        'DO': 'Dominican Republic',
        'EC': 'Ecuador',
        'EG': 'Egypt',
        'SV': 'El Salvador',
        'GQ': 'Equatorial Guinea',
        'ER': 'Eritrea',
        'EE': 'Estonia',
        'ET': 'Ethiopia',
        'FK': 'Falkland Islands (Malvinas)',
        'FO': 'Faroe Islands',
        'FJ': 'Fiji',
        'FI': 'Finland',
        'FR': 'France',
        'GF': 'French Guiana',
        'PF': 'French Polynesia',
        'TF': 'French Southern Territories',
        'GA': 'Gabon',
        'GM': 'Gambia',
        'GE': 'Georgia',
        'DE': 'Germany',
        'GH': 'Ghana',
        'GI': 'Gibraltar',
        'GR': 'Greece',
        'GL': 'Greenland',
        'GD': 'Grenada',
        'GP': 'Guadeloupe',
        'GU': 'Guam',
        'GT': 'Guatemala',
        'GG': 'Guernsey',
        'GN': 'Guinea',
        'GW': 'Guinea-Bissau',
        'GY': 'Guyana',
        'HT': 'Haiti',
        'HM': 'Heard Island & Mcdonald Islands',
        'VA': 'Holy See (Vatican City State)',
        'HN': 'Honduras',
        'HK': 'Hong Kong',
        'HU': 'Hungary',
        'IS': 'Iceland',
        'IN': 'India',
        'ID': 'Indonesia',
        'IR': 'Iran, Islamic Republic Of',
        'IQ': 'Iraq',
        'IE': 'Ireland',
        'IM': 'Isle Of Man',
        'IL': 'Israel',
        'IT': 'Italy',
        'JM': 'Jamaica',
        'JP': 'Japan',
        'JE': 'Jersey',
        'JO': 'Jordan',
        'KZ': 'Kazakhstan',
        'KE': 'Kenya',
        'KI': 'Kiribati',
        'KR': 'Korea',
        'KP': 'North Korea',
        'KW': 'Kuwait',
        'KG': 'Kyrgyzstan',
        'LA': 'Lao People"s Democratic Republic',
        'LV': 'Latvia',
        'LB': 'Lebanon',
        'LS': 'Lesotho',
        'LR': 'Liberia',
        'LY': 'Libyan Arab Jamahiriya',
        'LI': 'Liechtenstein',
        'LT': 'Lithuania',
        'LU': 'Luxembourg',
        'MO': 'Macao',
        'MK': 'Macedonia',
        'MG': 'Madagascar',
        'MW': 'Malawi',
        'MY': 'Malaysia',
        'MV': 'Maldives',
        'ML': 'Mali',
        'MT': 'Malta',
        'MH': 'Marshall Islands',
        'MQ': 'Martinique',
        'MR': 'Mauritania',
        'MU': 'Mauritius',
        'YT': 'Mayotte',
        'MX': 'Mexico',
        'FM': 'Micronesia, Federated States Of',
        'MD': 'Moldova',
        'MC': 'Monaco',
        'MN': 'Mongolia',
        'ME': 'Montenegro',
        'MS': 'Montserrat',
        'MA': 'Morocco',
        'MZ': 'Mozambique',
        'MM': 'Myanmar',
        'NA': 'Namibia',
        'NR': 'Nauru',
        'NP': 'Nepal',
        'NL': 'Netherlands',
        'AN': 'Netherlands Antilles',
        'NC': 'New Caledonia',
        'NZ': 'New Zealand',
        'NI': 'Nicaragua',
        'NE': 'Niger',
        'NG': 'Nigeria',
        'NU': 'Niue',
        'NF': 'Norfolk Island',
        'MP': 'Northern Mariana Islands',
        'NO': 'Norway',
        'OM': 'Oman',
        'PK': 'Pakistan',
        'PW': 'Palau',
        'PS': 'Palestinian Territory, Occupied',
        'PA': 'Panama',
        'PG': 'Papua New Guinea',
        'PY': 'Paraguay',
        'PE': 'Peru',
        'PH': 'Philippines',
        'PN': 'Pitcairn',
        'PL': 'Poland',
        'PT': 'Portugal',
        'PR': 'Puerto Rico',
        'QA': 'Qatar',
        'RE': 'Reunion',
        'RO': 'Romania',
        'RU': 'Russian Federation',
        'RW': 'Rwanda',
        'BL': 'Saint Barthelemy',
        'SH': 'Saint Helena',
        'KN': 'Saint Kitts And Nevis',
        'LC': 'Saint Lucia',
        'MF': 'Saint Martin',
        'PM': 'Saint Pierre And Miquelon',
        'VC': 'Saint Vincent And Grenadines',
        'WS': 'Samoa',
        'SM': 'San Marino',
        'ST': 'Sao Tome And Principe',
        'SA': 'Saudi Arabia',
        'SN': 'Senegal',
        'RS': 'Serbia',
        'SC': 'Seychelles',
        'SL': 'Sierra Leone',
        'SG': 'Singapore',
        'SK': 'Slovakia',
        'SI': 'Slovenia',
        'SB': 'Solomon Islands',
        'SO': 'Somalia',
        'ZA': 'South Africa',
        'GS': 'South Georgia And Sandwich Isl.',
        'ES': 'Spain',
        'LK': 'Sri Lanka',
        'SD': 'Sudan',
        'SR': 'Suriname',
        'SJ': 'Svalbard And Jan Mayen',
        'SZ': 'Swaziland',
        'SE': 'Sweden',
        'CH': 'Switzerland',
        'SY': 'Syrian Arab Republic',
        'TW': 'Taiwan',
        'TJ': 'Tajikistan',
        'TZ': 'Tanzania',
        'TH': 'Thailand',
        'TL': 'Timor-Leste',
        'TG': 'Togo',
        'TK': 'Tokelau',
        'TO': 'Tonga',
        'TT': 'Trinidad And Tobago',
        'TN': 'Tunisia',
        'TR': 'Turkey',
        'TM': 'Turkmenistan',
        'TC': 'Turks And Caicos Islands',
        'TV': 'Tuvalu',
        'UG': 'Uganda',
        'UA': 'Ukraine',
        'AE': 'United Arab Emirates',
        'GB': 'United Kingdom',
        'US': 'United States',
        'UM': 'United States Outlying Islands',
        'UY': 'Uruguay',
        'UZ': 'Uzbekistan',
        'VU': 'Vanuatu',
        'VE': 'Venezuela',
        'VN': 'Vietnam',
        'VG': 'Virgin Islands, British',
        'VI': 'Virgin Islands, U.S.',
        'WF': 'Wallis And Futuna',
        'EH': 'Western Sahara',
        'YE': 'Yemen',
        'ZM': 'Zambia',
        'ZW': 'Zimbabwe'
      },
      payload: {
        actionTaken: 'Account Banned',
        indicators: [],
        orders: [],
        reason: '',
        uid: ''
      },
      selectAllFlag: false,
      loading: false,
      validationErrors: []
    }
  },
  mounted() {
    this.loadIndicators().then(data => {
      this.indicators = data.map(indicator => {
        indicator.selected = false
        if (indicator.code === 'DIA' || indicator.code === 'USE1') {
          indicator.selected = true
        }
        return indicator
      })
    })
  },
  methods: {
    selectAll() {
      if (this.selectAllFlag) {
        this.selectAllFlag = false
        this.orders.forEach(order => {
          order.selected = false
        })
      } else {
        this.selectAllFlag = true
        this.orders.forEach(order => {
          order.selected = true
        })
      }
    },
    async loadFirstPartyData(orderId, showAccountOnly = false) {
      const res = await fetch(this.$local.apiBaseUrl + `/api/v2/eca-str/first-party-detail/${orderId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`
        },
      })
      const data = await res.json()

      this.orders.find(order => order.orderId === orderId).firstParty = {
        institutionName: '',
        institutionCode: '',
        account: '',
        accountName: '',
        country: 'NZ'
      }

      if (!showAccountOnly) {
        this.orders.find(order => order.orderId === orderId).firstParty = {
          ...data.data,
          institutionName: 'Wallet',
          institutionCode: 'Wallet',
          accountName: `${data.data.symbol} address customer sent deposit from.`,
          country: 'NZ'
        }
      }
    },
    async loadThirdPartyData(orderId, showAccountOnly = false) {
      const res = await fetch(this.$local.apiBaseUrl + `/api/v2/eca-str/third-party-detail/${orderId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`
        },
      })
      const data = await res.json()

      this.orders.find(order => order.orderId === orderId).thirdParty = {
        institutionName: '',
        institutionCode: '',
        account: '',
        accountName: '',
        country: 'NZ',
        comments: ''
      }

      if (showAccountOnly) {
        this.orders.find(order => order.orderId === orderId).thirdParty.account = data.data.account
      } else {
        this.orders.find(order => order.orderId === orderId).thirdParty = {
          ...data.data,
          institutionName: 'Wallet',
          institutionCode: 'Wallet',
          country: 'NZ'
        }
      }

    },
    toggleSuspiciousParty(order, party) {
      if (party === 'p3') {
        this.orders.find(o => o.orderId === order.orderId).p3 = !this.orders.find(o => o.orderId === order.orderId).p3

        if (this.orders.find(o => o.orderId === order.orderId).p4 === true) {
          this.orders.find(o => o.orderId === order.orderId).p4 = false
        }

        // If the user click on the third party and it's true, populate the data to the third party
        if (this.orders.find(o => o.orderId === order.orderId).p3) {
          this.loadThirdPartyData(order.orderId, true)
        }
      } else if (party === 'p1') {
        this.orders.find(o => o.orderId === order.orderId).p1 = !this.orders.find(o => o.orderId === order.orderId).p1

        if (this.orders.find(o => o.orderId === order.orderId).p4 === true) {
          this.orders.find(o => o.orderId === order.orderId).p4 = false
        }

        // If the user click on the first party and it's true, populate the data to the first party
        if (this.orders.find(o => o.orderId === order.orderId).p1) {
          this.loadFirstPartyData(order.orderId, true)
        }
      } else if (party === 'p4') {
        this.orders.find(o => o.orderId === order.orderId).p4 = !this.orders.find(o => o.orderId === order.orderId).p4

        if (this.orders.find(o => o.orderId === order.orderId).p3 === false && this.orders.find(o => o.orderId === order.orderId).direction === 'buy') {
          this.orders.find(o => o.orderId === order.orderId).p3 = true
        }

        if (this.orders.find(o => o.orderId === order.orderId).p1 === false && this.orders.find(o => o.orderId === order.orderId).direction === 'sell') {
          this.orders.find(o => o.orderId === order.orderId).p1 = true
        }

        if (this.orders.find(o => o.orderId === order.orderId).p1) {
          this.loadFirstPartyData(order.orderId)
        }

        if (this.orders.find(o => o.orderId === order.orderId).p3) {
          this.loadThirdPartyData(order.orderId)
        }
      }
    },
    getToken() {
      return this.$store.state.goauth.token
    },
    async selectUser(user) {
      this.payload.uid = user.uid
      this.loadOrders(this.payload.uid).then(data => {
        data.forEach(order => {
          order.walletAddress = ''
          order.selected = false
          order.p1 = false
          order.p3 = false
          order.p4 = false
          order.transactionDescription = ''
          order.firstParty = {
            institutionName: '',
            institutionCode: '',
            account: '',
            accountName: '',
            country: 'NZ'
          }
          order.thirdParty = {
            institutionName: '',
            institutionCode: '',
            account: '',
            accountName: '',
            country: 'NZ'
          }
          order.forthParty = {
            institutionName: '',
            institutionCode: '',
            account: '',
            accountName: '',
            country: 'NZ'
          }
        })
        this.orders = data
      })
    },
    async generateReport() {
      this.loading = true
      this.payload.orders = []
      this.payload.indicators = []
      this.validationErrors = []

      this.indicators.filter(indicator => indicator.selected).forEach(indicator => {
        this.payload.indicators.push(indicator.code)
      })

      this.orders.filter(order => order.selected).forEach(order => {
        const payloadOrder = {
          orderId: order.orderId,
          firstParty: null,
          thirdParty: null,
          forthParty: null
        }

        if (order.p1) {
          payloadOrder.firstParty = order.firstParty
        }

        if (order.p3) {
          payloadOrder.thirdParty = order.thirdParty
        }

        if (order.p4) {
          payloadOrder.forthParty = order.forthParty
        }

        if (order.transactionDescription) {
          payloadOrder.transactionDescription = order.transactionDescription
        }

        if (order.transactionComments) {
          payloadOrder.transactionComments = order.transactionComments
        }

        this.payload.orders.push(payloadOrder)
      })

      if (!this.payload.orders.length) {
        this.validationErrors.push('Please select at least one order.')
      }

      if (!this.payload.reason) {
        this.validationErrors.push('Please provide a reason.')
      }

      if (!this.payload.actionTaken) {
        this.validationErrors.push('Please select an action taken.')
      }

      if (this.payload.indicators.length === 0) {
        this.validationErrors.push('Please select at least one indicator.')
      }

      if (this.validationErrors.length) {
        this.loading = false
        return
      }

      const res = await fetch(this.$local.apiBaseUrl + '/api/v2/eca-str', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`
        },
        method: 'POST',
        body: JSON.stringify(this.payload)
      }).catch(err => {
        this.validationErrors.push('Something went wrong with goaml server, please try again later.')
        this.loading = false
      })

      this.xml = this.formatXml(await res.text())
      this.loading = false
    },
    formatXml(xml, tab) { // tab = optional indent value, default is tab (\t)
      let formatted = '', indent = '';
      tab = tab || '\t';
      xml.split(/>\s*</).forEach(function (node) {
        if (node.match(/^\/\w/)) {
          indent = indent.substring(tab.length);
        } // decrease indent by one 'tab'
        formatted += indent + '<' + node + '>\r\n';
        if (node.match(/^<?\w[^>]*[^/]$/)) {
          indent += tab;
        } // increase indent
      });
      return formatted.substring(1, formatted.length - 3);
    },
    async loadIndicators() {
      const res = await fetch(this.$local.apiBaseUrl + '/api/v2/eca-lookups/lookups/report-indicators', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`
        },
      })
      return res.json()
    },
    async populateDescription(orderId) {
      const res = await fetch(this.$local.apiBaseUrl + `/api/v2/eca-str/txn-description/${orderId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`
        },
      })
      const data = await res.json()
      this.orders.find(order => order.orderId === orderId).transactionDescription = data.data
    },
    async loadOrders(uid) {
      const res = await api('api-admin/index', {
        action: 'order/getOrdersByUID',
        version: 2,
        uid
      });

      return res.data
    },
  }
}
</script>

<style scoped>
.third-party {
  background-color: #f5f5f5;
}

.third-party td {
  padding: 20px 0 20px 0;
}

.forth-party {
  background-color: #f5f5f5;
}

.forth-party td {
  padding: 20px 0 20px 0;
}
</style>
