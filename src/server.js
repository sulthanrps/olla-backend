const app = require('./app');
const { connectToDb } = require('./config/db');

const PORT = process.env.PORT || 3000;

async function startServer() {
    await connectToDb();
    
    app.listen(PORT, () => {
        console.log(`🚀 Server is running on port ${PORT}`);
    });
}

startServer();