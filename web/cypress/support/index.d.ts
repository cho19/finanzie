/* eslint-disable @typescript-eslint/no-explicit-any */
/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    /* Helpers */
    /**
     * Custom command to press a submit button in a form
     * @example cy.submitForm()
     */
    submitForm(): Chainable<Element>;
    /**
     * Custom command to get change options of a Material UI
     * select field
     * @example cy.changeSelectOption('testInput, 2);
     */
    changeSelectOption(testId: string, idx: number): Chainable<void>;

    /* Users */
    /**
     * Login to the platform with user and password
     * @example cy.login('user', 'password')
     */
    login(username: string, password: string): Chainable<string>;
    /**
     * Gets the data of the logged in user
     * @example cy.getMe()
     */
    getMe(): Chainable<MeQuery['me']>;
    /**
     * Creates a user
     * @example cy.createUser(buildUser())
     */
    createUser(
      user: CreateUserMutationVariables['input'],
    ): Chainable<CreateUserMutation['createUser']>;
    /**
     * Deletes a user
     * @example cy.deleteUser(1)
     */
    deleteUser(id: Scalars['ID']): Chainable<DeleteUserMutation['deleteUser']>;

    /* Database */
    /**
     * Command to setup database in backend side
     * @example cy.setupDatabase()
     */
    setupDatabase(): Chainable<SetupDatabaseMutation['setupDatabase']>;

    /* Main */
    /**
     * Custom command to send a GraphQL request
     * @example cy.graphQLRequest({ request: gql`...`, variables: { foo: 'bar' } })
     */
    graphQLRequest(request: {
      request: any;
      variables: { [key: string]: any };
    }): Chainable<Cypress.Response>;
  }
}