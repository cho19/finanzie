import { buildTransaction } from '../../support/build/transaction';
import { validationMatchers } from '../../support/matchers';
import { buildAccount } from '../../support/build/account';

const { requiredField, nonZero } = validationMatchers;

describe('debit transactions table', () => {
  let testAccount: GQLCreateDebitAccountMutation['createAccount'];

  beforeEach(() => {
    cy.fixture('adminUser')
      .then((user) => cy.login(user.username, user.password))
      .then(() =>
        cy.createAccount(buildAccount({ map: (account) => ({ ...account, initialBalance: 0 }) })),
      )
      .then((createdAccount) => {
        testAccount = createdAccount;
      });

    cy.visit('/transactions');
  });

  it('should be able to create an transaction', () => {
    const newTransaction = buildTransaction();

    /* open dialog and verify */
    cy.findByTestId('createTransactionButton').should('exist').click();

    /* change fields and submit */
    cy.findByTestId(`amountInput`).within(() =>
      cy.get('input').clear().type(`${newTransaction.amount}`),
    );
    cy.changeSelectOption('accountIdInput', 0);
    cy.submitForm();

    /* should notify changes */
    cy.findByText(/transaction created/i).should('exist');

    /* should show created transaction */
    cy.get('tbody tr').should('have.length', 1);
  });

  it('should validate transaction fields', () => {
    /* open dialog and verify */
    cy.findByTestId('createTransactionButton').should('exist').click();

    /* required */
    cy.submitForm();
    cy.findByTestId('amountInput').within(() => {
      cy.get('input').clear();
      cy.contains(requiredField).should('exist');
    });
    cy.findByTestId('accountIdInput').within(() => cy.contains(requiredField).should('exist'));

    /* non zero value */
    cy.findByTestId('amountInput').within(() => {
      cy.get('input').clear().type('0');
      cy.contains(nonZero).should('exist');
    });
  });

  it('should be able to delete a transaction', () => {
    // eslint-disable-next-line jest/valid-expect-in-promise
    cy.createTransaction({ ...buildTransaction(), accountId: testAccount.id }).then(
      (transaction) => {
        /* Delete and it shouldn't exist anymore */
        cy.findByTestId(`deleteTransaction${transaction.id}`)
          .should('exist')
          .should('not.be.disabled')
          .click();

        cy.findByTestId(`row${transaction.id}`).should('not.exist');
      },
    );
  });
});
