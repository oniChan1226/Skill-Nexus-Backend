import dotenv from "dotenv"
dotenv.config({
    path: "./.env",
});

import connectDB from "./db/index.js";
import app from "./app.js"

const port = process.env.PORT || 8080;

; (async () => {
    try {
        await connectDB();
        app.listen(port, () => console.log(`server is running on port: ${port}`));
    } catch (error) {
        console.log("Error: ", error?.message);
    }
})();