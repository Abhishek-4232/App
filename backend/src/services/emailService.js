const emailjs = require('emailjs-com');

// Initialize EmailJS
emailjs.init("service_vecze0v");

const sendStockAlert = async (product) => {
    try {
        const templateParams = {
            to_email: 'ayush.bhrg@gmail.com',
            product_name: product.name,
            current_stock: product.quantity,
            minimum_stock: product.minimumStockLevel,
            sku: product.sku,
            needed_quantity: product.minimumStockLevel - product.quantity
        };

        await emailjs.send(
            'service_vecze0v', // Service ID
            'template_stock_alert', // Template ID (you'll need to create this in EmailJS dashboard)
            templateParams
        );

        console.log(`Stock alert email sent for product: ${product.name}`);
    } catch (error) {
        console.error('Error sending stock alert email:', error);
    }
};

module.exports = { sendStockAlert };
