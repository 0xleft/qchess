import axios from "axios";

export default async function handler(req, res) {

    try {
        const response = await axios.get(`http${process.env.WS_URL}/public?${req.url.split('?')[1]}`);
        return res.status(response.status).json(response.data);
    } catch (error) {
        return res.status(500).json({ error: "An error occurred" });
    }

	return res.status(500).json({ error: "An error occurred" });
}