import { gql } from 'apollo-server-express';

export const creditAccount = {
  GET_CREDIT_ACCOUNTS: gql`
    query {
      getCreditAccounts {
        id
        name
        bank
        initialBalance
        billingDay
        paymentDay
        currency {
          id
          name
        }
      }
    }
  `,
  GET_CREDIT_ACCOUNT: gql`
    query($id: ID!) {
      getCreditAccount(id: $id) {
        id
        name
        bank
        initialBalance
        billingDay
        paymentDay
        currency {
          id
          name
        }
      }
    }
  `,
  CREATE_CREDIT_ACCOUNT: gql`
    mutation(
      $name: String!
      $bank: String!
      $initialBalance: Int!
      $currencyId: ID!
      $billingDay: Int!
      $paymentDay: Int!
    ) {
      createCreditAccount(
        name: $name
        bank: $bank
        initialBalance: $initialBalance
        currencyId: $currencyId
        billingDay: $billingDay
        paymentDay: $paymentDay
      ) {
        id
        name
        bank
        initialBalance
        billingDay
        paymentDay
        currency {
          id
          name
        }
      }
    }
  `,
  UPDATE_CREDIT_ACCOUNT: gql`
    mutation(
      $id: ID!
      $name: String
      $bank: String
      $initialBalance: Int
      $currencyId: ID
      $billingDay: Int
      $paymentDay: Int
    ) {
      updateCreditAccount(
        id: $id
        name: $name
        bank: $bank
        initialBalance: $initialBalance
        currencyId: $currencyId
        billingDay: $billingDay
        paymentDay: $paymentDay
      ) {
        id
        name
        bank
        initialBalance
        billingDay
        paymentDay
        currency {
          id
          name
        }
      }
    }
  `,
  DELETE_CREDIT_ACCOUNT: gql`
    mutation($id: ID!) {
      deleteCreditAccount(id: $id)
    }
  `,
};

export const debitAccount = {
  GET_DEBIT_ACCOUNTS: gql`
    query {
      getDebitAccounts {
        id
        name
        bank
        initialBalance
        allowsNegative
        currency {
          id
          name
        }
      }
    }
  `,
  GET_DEBIT_ACCOUNT: gql`
    query($id: ID!) {
      getDebitAccount(id: $id) {
        id
        name
        bank
        initialBalance
        allowsNegative
        currency {
          id
          name
        }
      }
    }
  `,
  CREATE_DEBIT_ACCOUNT: gql`
    mutation(
      $name: String!
      $bank: String!
      $initialBalance: Int!
      $allowsNegative: Boolean!
      $currencyId: ID!
    ) {
      createDebitAccount(
        name: $name
        bank: $bank
        initialBalance: $initialBalance
        allowsNegative: $allowsNegative
        currencyId: $currencyId
      ) {
        id
        name
        bank
        initialBalance
        allowsNegative
        currency {
          id
          name
        }
      }
    }
  `,
  UPDATE_DEBIT_ACCOUNT: gql`
    mutation(
      $id: ID!
      $name: String
      $bank: String
      $initialBalance: Int
      $currencyId: ID
    ) {
      updateDebitAccount(
        id: $id
        name: $name
        bank: $bank
        initialBalance: $initialBalance
        currencyId: $currencyId
      ) {
        id
        name
        bank
        initialBalance
        allowsNegative
        currency {
          id
          name
        }
      }
    }
  `,
  DELETE_DEBIT_ACCOUNT: gql`
    mutation($id: ID!) {
      deleteDebitAccount(id: $id)
    }
  `,
};

export const currency = {
  GET_CURRENCIES: gql`
    query {
      getCurrencies {
        id
        name
      }
    }
  `,
  GET_CURRENCY: gql`
    query($id: ID!) {
      getCurrency(id: $id) {
        id
        name
      }
    }
  `,
  CREATE_CURRENCY: gql`
    mutation($name: String!) {
      createCurrency(name: $name) {
        id
        name
      }
    }
  `,
  UPDATE_CURRENCY: gql`
    mutation($id: ID!, $name: String!) {
      updateCurrency(id: $id, name: $name) {
        id
        name
      }
    }
  `,
  DELETE_CURRENCY: gql`
    mutation($id: ID!) {
      deleteCurrency(id: $id)
    }
  `,
};
