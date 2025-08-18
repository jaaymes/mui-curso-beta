/// <reference types="cypress" />

// Custom command to login
Cypress.Commands.add('login', () => {
  cy.visit('/login')
  cy.get('[data-testid="username-input"] input').clear().type('emilys')
  cy.get('[data-testid="password-input"] input').clear().type('emilyspass')
  cy.get('[data-testid="login-button"]').click()
  cy.url({ timeout: 10000 }).should('include', '/dashboard')
})

// Custom command to logout
Cypress.Commands.add('logout', () => {
  cy.get('[data-testid="user-menu"]').click()
  cy.get('[data-testid="logout-button"]').click()
  cy.url({ timeout: 10000 }).should('include', '/login')
})

declare global {
  namespace Cypress {
    interface Chainable {
      login(): Chainable<void>
      logout(): Chainable<void>
    }
  }
}