describe('Event Creation in DisplayEvents', () => {
    beforeEach(() => {
        cy.visit('/calendrier');
    });

    // Teste l'ouverture du modal d'ajout d'événement
    it('displays the Add Event modal when the button is clicked', () => {
        cy.get('.btn-addEvent').click();
        cy.get('ion-modal').should('be.visible');
       
    });
    

});
