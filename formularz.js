client.on('interactionCreate', async interaction => {
    if (!interaction.isSelectMenu()) return;

    if (interaction.customId === 'ticket-category') {
        const selectedCategory = interaction.values[0];

        // Tworzenie formularza z polami: Produkt, Iloœæ, Metoda p³atnoœci
        const modal = new ModalBuilder()
            .setCustomId(`ticket-form-${selectedCategory}`)
            .setTitle('Formularz zamówienia');

        const productInput = new TextInputBuilder()
            .setCustomId('product')
            .setLabel('PRODUKT')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Przyk³ad: N1tr0 b00st na miesi¹c')
            .setRequired(true);

        const quantityInput = new TextInputBuilder()
            .setCustomId('quantity')
            .setLabel('ILOŒÆ')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Przyk³ad: 5')
            .setRequired(true);

        const paymentMethodInput = new TextInputBuilder()
            .setCustomId('payment_method')
            .setLabel('METODA P£ATNOŒCI')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Przyk³ad: Blik')
            .setRequired(true);

        const firstRow = new ActionRowBuilder().addComponents(productInput);
        const secondRow = new ActionRowBuilder().addComponents(quantityInput);
        const thirdRow = new ActionRowBuilder().addComponents(paymentMethodInput);

        modal.addComponents(firstRow, secondRow, thirdRow);

        await interaction.showModal(modal);
    }
});
