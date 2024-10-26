client.on('interactionCreate', async interaction => {
    if (!interaction.isModalSubmit()) return;

    if (interaction.customId.startsWith('ticket-form')) {
        const product = interaction.fields.getTextInputValue('product');
        const quantity = interaction.fields.getTextInputValue('quantity');
        const paymentMethod = interaction.fields.getTextInputValue('payment_method');

        // Tworzenie kana³u ticketa z nazw¹ na podstawie nazwy u¿ytkownika
        const ticketChannel = await interaction.guild.channels.create({
            name: `ticket-${interaction.user.username}`,
            type: 0, // Kana³ tekstowy
            permissionOverwrites: [
                {
                    id: interaction.guild.id, // Wszyscy
                    deny: ['ViewChannel'],
                },
                {
                    id: interaction.user.id, // U¿ytkownik
                    allow: ['ViewChannel', 'SendMessages'],
                },
            ],
        });

        // Wys³anie informacji do nowego kana³u
        ticketChannel.send(`**Nowy Ticket**\n**Produkt:** ${product}\n**Iloœæ:** ${quantity}\n**Metoda p³atnoœci:** ${paymentMethod}\n\nU¿ytkownik: ${interaction.user}`);

        await interaction.reply({ content: 'Twój ticket zosta³ utworzony!', ephemeral: true });
    }
});
