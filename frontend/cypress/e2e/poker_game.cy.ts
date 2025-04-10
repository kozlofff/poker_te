/// <reference types="cypress" />

describe('Poker Game', () => {
  beforeEach(() => {
    // Visit the main page before each test
    cy.visit('http://localhost:3000')
  })

  it('should create a new game and display the game interface', () => {
    // Click the create game button
    cy.get('[data-testid="create-game-btn"]').click()

    // Verify that the game interface is displayed
    cy.get('[data-testid="game-container"]').should('be.visible')
    
    // Verify that player positions are displayed
    cy.get('[data-testid="player-position"]').should('have.length.at.least', 2)
    
    // Verify that the pot is displayed and starts at 0
    cy.get('[data-testid="pot-amount"]').should('contain', '0')
  })

  it('should allow a player to perform basic actions', () => {
    // Create a new game
    cy.get('[data-testid="create-game-btn"]').click()
    
    // Wait for the game to be created
    cy.get('[data-testid="game-container"]').should('be.visible')
    
    // Verify action buttons are present
    cy.get('[data-testid="action-fold"]').should('be.visible')
    cy.get('[data-testid="action-call"]').should('be.visible')
    cy.get('[data-testid="action-raise"]').should('be.visible')
    
    // Test performing a call action
    cy.get('[data-testid="action-call"]').click()
    
    // Verify the action was recorded
    cy.get('[data-testid="action-history"]').should('contain', 'Call')
  })

  it('should display hand history after game completion', () => {
    // Create and play through a game
    cy.get('[data-testid="create-game-btn"]').click()
    
    // Simulate playing through a hand (this will need to be adjusted based on your actual game flow)
    cy.get('[data-testid="action-fold"]').click()
    
    // Verify hand history is updated
    cy.get('[data-testid="hand-history"]').should('be.visible')
    cy.get('[data-testid="hand-history"]')
      .should('contain', 'Hand #')
      .and('contain', 'Fold')
  })
}) 