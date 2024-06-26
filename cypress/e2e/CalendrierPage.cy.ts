describe('Calendar Page', () => {
    beforeEach(() => {
        cy.visit('/Calendrier');
    });

    // Teste si la date actuelle s'affiche quand on arrive sur la page
    it('Affiche la date actuelle quand on arrive sur le calendrier', () => {
        const today = new Date().toLocaleDateString("fr-FR", {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric",
        });

        cy.contains('.date-actuelle p', today).should('exist');
    });

    // Teste si on peut reculer ou avancer d'un jour en cliquant sur les flèches
    it('Recule ou avance un jour si on clique sur une fleche', () => {
        const today = new Date();
        cy.get('.button-week').first().click();

        let previousDay = new Date(today.setDate(today.getDate() - 1)).toLocaleDateString("fr-FR", {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric",
        });
        cy.contains('.date-actuelle p', previousDay).should('exist');

        cy.get('.button-week').last().click();

        let currentDate = new Date().toLocaleDateString("fr-FR", {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric",
        });
        cy.contains('.date-actuelle p', currentDate).should('exist');
    });

});
