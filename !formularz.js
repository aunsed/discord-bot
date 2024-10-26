client.on('interactionCreate', async interaction => {
    if (!interaction.isModalSubmit()) return;

    if (interaction.customId.startsWith('ticket-form')) {
        const product = interaction.fields.getTextInputValue('product');
        const quantity = interaction.fields.getTextInputValue('quantity');
        const paymentMethod = interaction.fields.getTextInputValue('payment_method');

        // Tworzenie kana�u ticketa z nazw� na podstawie nazwy u�ytkownika
        const ticketChannel = await interaction.guild.channels.create({
            name: `ticket-${interaction.user.username}`,
            type: 0, // Kana� tekstowy
            permissionOverwrites: [
                {
                    id: interaction.guild.id, // Wszyscy
                    deny: ['ViewChannel'],
                },
                {
                    id: interaction.user.id, // U�ytkownik
                    allow: ['ViewChannel', 'SendMessages'],
                },
            ],
        });

        // Wys�anie informacji do nowego kana�u
        ticketChannel.send(`**Nowy Ticket**\n**Produkt:** ${product}\n**Ilo��:** ${quantity}\n**Metoda p�atno�ci:** ${paymentMethod}\n\nU�ytkownik: ${interaction.user}`);

        await interaction.reply({ content: 'Tw�j ticket zosta� utworzony!', ephemeral: true });
    }
});
