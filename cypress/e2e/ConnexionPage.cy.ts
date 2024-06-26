describe('Login Page Tests', () => {
    beforeEach(() => {
      cy.visit('/connexion');
    });
   
    // Teste si lorsque l'on ne met pas de login et de mot de passe cela affiche un message d'erreur
    it('Login et mdp vide', () => {
      cy.get('.btn-success').click();
      cy.get('.error-message-login').should('contain', 'Veuillez fournir un login et un mot de passe.');
    });

    // Teste si lorsque l'on met un login et un mot de passe incorrecte cela affiche un message d'erreur
    it('Mauvais login et mdp', () => {
        cy.get('.login-input').type('wronglogin');
        cy.get('.password-input').type('wrongpassword');
        
        cy.get('.btn-success').click();
        cy.get('.btn-success').click();
        cy.get('.error-message-login').should('contain', 'Identifiants incorrects.');
      });

      // Teset si avec de bons identifiants, la connexion fonctionne et redirige sur la page calendrier
      it('Bons identifiants, redirige sur la page calendrier', () => {
    
        cy.get('.login-input').type('lvedel');
        cy.get('.password-input').type('lvedel');
    
        cy.get('.btn-success').click();
        cy.get('.btn-success').click();
    
        cy.url().should('include', '/Calendrier');
      });

  });
  