<template>
  <div>
    <section class="section">
      <h1 class="title is-4">
        Balances summed
      </h1>
      <b-table :data="$store.getters['info/coinBalances']">
        <template #default="props">
          <b-table-column
            field="currency"
            label="Currency"
          >
            {{ props.row.currency }}
          </b-table-column>
          <b-table-column
            field="balance"
            label="Balance"
          >
            {{ cryptoNum(props.row.balance, 8) }}
          </b-table-column>
        </template>
      </b-table>
    </section>
    <section class="section">
      <h1 class="title is-4">
        Held crypto owing to customers
      </h1>
      <b-table :data="$root.info.heldCrypto">
        <template #default="props">
          <b-table-column
            field="currency"
            label="Currency"
          >
            {{ props.row.coin }}
          </b-table-column>
          <b-table-column
            field="balance"
            label="Balance"
          >
            {{ cryptoNum(props.row.total) }}
          </b-table-column>
        </template>
      </b-table>
    </section>
    <section class="section">
      <h1 class="title is-4">
        Balances detailed
      </h1>
      <b-table :data="$store.state.info.balances">
        <template #default="props">
          <b-table-column
            field="exchange"
            label="Exchange"
          >
            {{ props.row.exchange }}
          </b-table-column>
          <b-table-column
            field="currency"
            label="Currency"
          >
            {{ props.row.currency }}
          </b-table-column>
          <b-table-column
            field="balance"
            label="Balance"
          >
            {{ cryptoNum(props.row.balance, 8) }}
          </b-table-column>
        </template>
      </b-table>
    </section>
  </div>
</template>

<script>
export default {
  name: 'Bank'
}
</script>
