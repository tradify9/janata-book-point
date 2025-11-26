// backend/server.js
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch'); // ✅ node-fetch@2 required

const app = express();
app.use(cors());
app.use(express.json());

// 🔐 Replace with your Shiprocket credentials
const SHIPROCKET_EMAIL = "janatabookspoint@gmail.com";
const SHIPROCKET_PASSWORD = "Website@250";
const PICKUP_LOCATION = "Basement, C-40, Sector-15, Vasundhara, Ghaziabad, Uttar Pradesh, India, 201012 Warehouse SPOC Details : Janata Books Point | 9821586944"; // As per your Shiprocket account

app.post('/place-order', async (req, res) => {
  try {
    // Step 1: Login to get token
    const loginRes = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: SHIPROCKET_EMAIL,
        password: SHIPROCKET_PASSWORD
      })
    });

    const loginData = await loginRes.json();
    if (!loginData.token) {
      return res.status(401).json({ message: "Login failed", loginData });
    }

    const token = loginData.token;
    const order = req.body;

    // Step 2: Prepare order data
    const payload = {
      order_id: "ORD" + Math.floor(Math.random() * 1000000),
      order_date: new Date().toISOString().split("T")[0],
      pickup_location: PICKUP_LOCATION,
      billing_customer_name: order.name,
      billing_address: order.address,
      billing_city: order.city,
      billing_state: order.state,
      billing_pincode: order.pincode,
      billing_country: "India",
      billing_phone: order.phone,
      order_items: [
        {
          name: order.product,
          sku: "SKU001",
          units: Number(order.quantity),
          selling_price: Number(order.price)
        }
      ],
      payment_method: "COD",
      sub_total: Number(order.price) * Number(order.quantity),
      length: 10,
      breadth: 10,
      height: 10,
      weight: 0.5
    };

    // Step 3: Create order
    const orderRes = await fetch('https://apiv2.shiprocket.in/v1/external/orders/create/adhoc', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const orderData = await orderRes.json();
    res.status(200).json(orderData);

  } catch (err) {
    console.error("Order error:", err);
    res.status(500).json({ message: "Internal Server Error", error: err });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});
