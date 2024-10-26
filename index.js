require('dotenv').config(); // Załaduj zmienne z pliku .env
const { Client, GatewayIntentBits, SlashCommandBuilder, ActionRowBuilder, SelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder } = require('discord.js');

// Odczyt tokenu i ID serwera z process.env
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const TOKEN = process.env.BOT_TOKEN; // TOKEN bota
const GUILD_ID = process.env.GUILD_ID; // ID serwera

client.once('ready', () => {
    console.log(`Zalogowano jako ${client.user.tag}`);
});

// Przykładowa baza danych produktów
const productsByChannel = {
    'nitro': [
        { name: 'Nitro Boost', description: '💰 10% zniżki na Nitro Boost', price: '49.99 zł' },
        { name: 'Nitro Gift', description: '🎁 5% zniżki na Nitro Gift', price: '45.99 zł' },
    ],
    'gaming': [
        { name: 'Game Pass', description: '🎮 15% zniżki na Game Pass', price: '39.99 zł' },
        { name: 'DLC', description: '🕹️ 20% taniej', price: '29.99 zł' },
    ],
    // Dodaj inne kanały i ich oferty
};

// Przechowuje opinie o produktach
const productReviews = {};

// Rejestracja komend
const registerCommands = async () => {
    const commands = [
        new SlashCommandBuilder()
            .setName('ticket')
            .setDescription('Stwórz zamówienie lub zgłoś problem'),

        new SlashCommandBuilder()
            .setName('products')
            .setDescription('Wyświetl dostępne produkty'),

        new SlashCommandBuilder()
            .setName('addproduct')
            .setDescription('Dodaj nowy produkt (tylko dla adminów)')
            .addStringOption(option =>
                option.setName('name').setDescription('Nazwa produktu').setRequired(true))
            .addStringOption(option =>
                option.setName('description').setDescription('Opis produktu').setRequired(true)),

        new SlashCommandBuilder()
            .setName('removeproduct')
            .setDescription('Usuń produkt (tylko dla adminów)')
            .addStringOption(option =>
                option.setName('name').setDescription('Nazwa produktu').setRequired(true)),

        new SlashCommandBuilder()
            .setName('updateproduct')
            .setDescription('Aktualizuj cenę produktu (tylko dla adminów)')
            .addStringOption(option =>
                option.setName('name').setDescription('Nazwa produktu').setRequired(true))
            .addNumberOption(option =>
                option.setName('price').setDescription('Nowa cena produktu').setRequired(true)),

        new SlashCommandBuilder()
            .setName('orderhistory')
            .setDescription('Wyświetl historię zamówień'),

        new SlashCommandBuilder()
            .setName('faq')
            .setDescription('Wyświetl najczęściej zadawane pytania'),

        new SlashCommandBuilder()
            .setName('promotions')
            .setDescription('Wyświetl aktualne promocje'),

        new SlashCommandBuilder()
            .setName('addreview')
            .setDescription('Dodaj recenzję do produktu')
            .addStringOption(option =>
                option.setName('product').setDescription('Nazwa produktu').setRequired(true))
            .addStringOption(option =>
                option.setName('review').setDescription('Twoja recenzja').setRequired(true)),

        new SlashCommandBuilder()
            .setName('viewreviews')
            .setDescription('Wyświetl recenzje produktu')
            .addStringOption(option =>
                option.setName('product').setDescription('Nazwa produktu').setRequired(true)),

        new SlashCommandBuilder()
            .setName('notify')
            .setDescription('Powiadomienia o promocjach')
            .addBooleanOption(option =>
                option.setName('subscribe').setDescription('Zapisz się na powiadomienia')),

        new SlashCommandBuilder()
            .setName('stats')
            .setDescription('Wyświetl statystyki i raporty')
    ].map(command => command.toJSON()); // Konwertujemy na JSON

    try {
        // Rejestracja komend w określonym serwerze
        const existingCommands = await client.application.commands.fetch({ guildId: GUILD_ID });
        const existingCommandNames = existingCommands.map(cmd => cmd.name);

        // Tylko rejestruj nowe komendy, które nie istnieją
        const commandsToRegister = commands.filter(cmd => !existingCommandNames.includes(cmd.name));

        if (commandsToRegister.length > 0) {
            await client.application.commands.set(commandsToRegister, GUILD_ID);
            console.log(`Zarejestrowano nowe komendy w serwerze o ID: ${GUILD_ID}`);
        } else {
            console.log(`Brak nowych komend do zarejestrowania w serwerze o ID: ${GUILD_ID}`);
        }
    } catch (error) {
        console.error('Błąd podczas rejestracji komend:', error);
    }
};

// Zarejestruj komendy po uruchomieniu bota
client.once('ready', registerCommands);

// Obsługa interakcji
client.on('interactionCreate', async interaction => {
    if (interaction.isChatInputCommand()) {
        switch (interaction.commandName) {
            case 'ticket':
                const menu = new SelectMenuBuilder()
                    .setCustomId('ticket-category')
                    .setPlaceholder('❌|Wybierz ofertę z listy')
                    .addOptions([
                        { label: '📩|Zamówienie', description: 'Kliknij aby, dokonać zakupu', value: 'order' },
                        { label: '❌|Exchange', description: 'Kliknij aby, dokonać wymiany', value: 'exchange' },
                        { label: '❌|Reklamacja', description: 'Kliknij aby, dokonać reklamacji', value: 'complaint' },
                    ]);

                const row = new ActionRowBuilder().addComponents(menu);

                await interaction.reply({
                    content: '🧾 **STWÓRZ ZAMÓWIENIE**\nWybierz odpowiednią kategorię, aby stworzyć ticketa!',
                    components: [row],
                    ephemeral: false // widoczne dla wszystkich
                });
                break;

            case 'products':
                const channelName = interaction.channel.name; // Nazwa bieżącego kanału
                const products = productsByChannel[channelName] || [];

                const embed = new EmbedBuilder()
                    .setColor('#0099ff') // Kolor embedu
                    .setTitle('📦 Dostępne produkty:')
                    .setDescription(`Oferty dostępne w kanale **${channelName}**:`)
                    .setThumbnail('https://example.com/your-thumbnail-image.png'); // Link do miniatury

                if (products.length > 0) {
                    products.forEach(product => {
                        embed.addFields(
                            { name: product.name, value: `${product.description}\n**Cena:** ${product.price}`, inline: true }
                        );
                    });
                } else {
                    embed.setDescription('Brak ofert dla tego kanału.');
                }

                await interaction.reply({ embeds: [embed], ephemeral: false });
                break;

            case 'addproduct':
                // Dodaj produkt do listy
                const isAdminAdd = interaction.member.permissions.has('ADMINISTRATOR'); // Sprawdź, czy użytkownik ma uprawnienia administratora
                if (!isAdminAdd) {
                    await interaction.reply({ content: '❌ Nie masz uprawnień do użycia tej komendy.', ephemeral: true });
                    return;
                }

                const productName = interaction.options.getString('name');
                const productDescription = interaction.options.getString('description');

                const productsAdd = productsByChannel[interaction.channel.name] || [];
                // Sprawdzamy, czy produkt już istnieje
                if (productsAdd.some(p => p.name.toLowerCase() === productName.toLowerCase())) {
                    await interaction.reply({ content: `❌ Produkt o nazwie **${productName}** już istnieje.`, ephemeral: true });
                } else {
                    productsAdd.push({ name: productName, description: productDescription });
                    productsByChannel[interaction.channel.name] = productsAdd; // Zaktualizuj listę produktów w kanale
                    await interaction.reply({ content: `✅ Dodano produkt: **${productName}**`, ephemeral: true });
                }
                break;

            case 'removeproduct':
                // Usuń produkt z listy
                const isAdminRemove = interaction.member.permissions.has('ADMINISTRATOR'); // Sprawdź, czy użytkownik ma uprawnienia administratora
                if (!isAdminRemove) {
                    await interaction.reply({ content: '❌ Nie masz uprawnień do użycia tej komendy.', ephemeral: true });
                    return;
                }

                const removeProductName = interaction.options.getString('name');

                const productsRemove = productsByChannel[interaction.channel.name] || [];
                const productIndex = productsRemove.findIndex(p => p.name.toLowerCase() === removeProductName.toLowerCase());
                if (productIndex === -1) {
                    await interaction.reply({ content: `❌ Produkt o nazwie **${removeProductName}** nie został znaleziony.`, ephemeral: true });
                } else {
                    productsRemove.splice(productIndex, 1);
                    productsByChannel[interaction.channel.name] = productsRemove; // Zaktualizuj listę produktów w kanale
                    await interaction.reply({ content: `✅ Usunięto produkt: **${removeProductName}**`, ephemeral: true });
                }
                break;

            case 'orderhistory':
                // Logika dla komendy /orderhistory
                await interaction.reply({ content: '📜 **Historia zamówień:**\nNie masz jeszcze żadnych zamówień.', ephemeral: true });
                break;

            case 'faq':
                // Logika dla komendy /faq
                await interaction.reply({ content: '❓ **Najczęściej zadawane pytania:**\nQ: Jak mogę złożyć zamówienie?\nA: Użyj komendy /ticket.', ephemeral: true });
                break;

            case 'promotions':
                // Logika dla komendy /promotions
                await interaction.reply({ content: '🎉 **Aktualne promocje:**\n- 10% zniżki na wszystkie produkty do końca miesiąca!', ephemeral: true });
                break;

            case 'addreview':
                const reviewProduct = interaction.options.getString('product');
                const reviewText = interaction.options.getString('review');
                if (!productReviews[reviewProduct]) {
                    productReviews[reviewProduct] = [];
                }
                productReviews[reviewProduct].push(reviewText);
                await interaction.reply({ content: `✅ Dodano recenzję do produktu **${reviewProduct}**`, ephemeral: true });
                break;

            case 'viewreviews':
                const viewProduct = interaction.options.getString('product');
                const reviews = productReviews[viewProduct] || [];
                if (reviews.length === 0) {
                    await interaction.reply({ content: `❌ Nie ma recenzji dla produktu **${viewProduct}**.`, ephemeral: true });
                } else {
                    const reviewsEmbed = new EmbedBuilder()
                        .setColor('#0099ff')
                        .setTitle(`Recenzje dla produktu: **${viewProduct}**`)
                        .setDescription(reviews.join('\n'));

                    await interaction.reply({ embeds: [reviewsEmbed], ephemeral: true });
                }
                break;

            case 'notify':
                const subscribe = interaction.options.getBoolean('subscribe');
                // Logika subskrypcji powiadomień
                await interaction.reply({ content: subscribe ? '✅ Zapisano na powiadomienia o promocjach!' : '❌ Wypisano z powiadomień o promocjach.', ephemeral: true });
                break;

            case 'stats':
                // Logika dla komendy /stats
                await interaction.reply({ content: '📊 **Statystyki i raporty:**\nAktualnie brak dostępnych statystyk.', ephemeral: true });
                break;

            default:
                await interaction.reply({ content: 'Nieznana komenda!', ephemeral: true });
                break;
        }
    }

    // Obsługa wyboru kategorii i formularza
    if (interaction.isSelectMenu()) {
        if (interaction.customId === 'ticket-category') {
            const selectedCategory = interaction.values[0];

            const modal = new ModalBuilder()
                .setCustomId(`ticket-form-${selectedCategory}`)
                .setTitle('Formularz zamówienia');

            const productInput = new TextInputBuilder()
                .setCustomId('product')
                .setLabel('PRODUKT')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('Przykład: N1tr0 b00st na miesiąc')
                .setRequired(true);

            const quantityInput = new TextInputBuilder()
                .setCustomId('quantity')
                .setLabel('ILOŚĆ')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('Przykład: 5')
                .setRequired(true);

            const paymentMethodInput = new TextInputBuilder()
                .setCustomId('payment_method')
                .setLabel('METODA PŁATNOŚCI')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('Przykład: Blik')
                .setRequired(true);

            const firstRow = new ActionRowBuilder().addComponents(productInput);
            const secondRow = new ActionRowBuilder().addComponents(quantityInput);
            const thirdRow = new ActionRowBuilder().addComponents(paymentMethodInput);

            modal.addComponents(firstRow, secondRow, thirdRow);

            await interaction.showModal(modal);
        }
    }

    // Obsługa wypełnionego formularza
    if (interaction.isModalSubmit()) {
        if (interaction.customId.startsWith('ticket-form')) {
            const product = interaction.fields.getTextInputValue('product');
            const quantity = interaction.fields.getTextInputValue('quantity');
            const paymentMethod = interaction.fields.getTextInputValue('payment_method');

            const ticketChannel = await interaction.guild.channels.create({
                name: `ticket-${interaction.user.username}`,
                type: 0, // Kanał tekstowy
                permissionOverwrites: [
                    {
                        id: interaction.guild.id,
                        deny: ['ViewChannel'],
                    },
                    {
                        id: interaction.user.id,
                        allow: ['ViewChannel', 'SendMessages'],
                    },
                ],
            });

            await ticketChannel.send(`**Nowy Ticket**\n**Produkt:** ${product}\n**Ilość:** ${quantity}\n**Metoda płatności:** ${paymentMethod}\n\nUżytkownik: ${interaction.user}`);

            await interaction.reply({ content: 'Twój ticket został utworzony!', ephemeral: true });
        }
    }
});

// Logowanie do Discorda z użyciem tokenu
client.login(TOKEN);
