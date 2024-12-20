import express from 'express';
import axios from 'axios';
import cors from 'cors';

const app = express();

// Enable CORS for local development
app.use(cors());
app.use(express.json());

// Proxy endpoint
app.post('/walmart-bot-login', async (req, res) => {
  try {
    // Forward the request to the target API
    const response = await axios.post(
      'https://retaillink.login.wal-mart.com/api/login',
      req.body,
      {
        headers: {
          'Content-Type': 'application/json',
          Cookie: 'lang=en',
          Referer: 'https://retaillink.login.wal-mart.com/',
          'X-Bot-Token':
            'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJsb2dpbklkIjoiY2FuZHJhZGVnOTE4MkBnbWFpbC5jb20iLCJpc3MiOiJrcmFrZW4iLCJleHAiOjE3MzkyMTU0MDksImlhdCI6MTczNDAzMTQwOSwianRpIjoiYTJhNGIxMWYtNjZmMi00YzdlLTk2MTctZjQwOTU4MjFmOTMyIn0.EvVZVyUbeAD540h3zmwNKPi6dDhnjxTneYxKdQULdDlgRoCYfcSWi1og5-3b66kVKL-KNTmSOeeXLu20T1P4ZwwXEAV3nYj7N7V12mlPhHO_3SMdMcMMk_y_ZdpQAdlYKE7zidcTbrYeCvcB0m1mGIyELE_ZnmNrIyB1HbOtHurb8idRXy10D3S5SynXKgztzWDWlyZTnLM-JASAalzab8rvbNDTa3_10qgIzLTgBOsQBzsJyHgpGmtIGRo3rq6RtAs4_mlK-jFG1--QfoXaNxZHx36wToGNIj7s96z2zCMBIK8PRV1ThnfzkEvYl5h3xG3Z8Jy4tvjIzKKJcd7n3w',
        },
      }
    );
    res.status(response.status).send(response.data);
  } catch (error) {
    console.error('Proxy Error:', error.message);
    res.status(error.response?.status || 500).send(error.message);
  }
});

app.get('/inbound-documents', async (req, res) => {
  try {
    const response = await axios.get(
      'https://retaillink2.wal-mart.com/Webedi2/Inbound/GetInboundDocuments/51619',
      {
        params: {
          documentNumber: '',
          documentType: '',
          vendorNumber: '',
          store: '',
          taSlipNumber: '',
          mailboxId: '51619',
          readStatus: '',
          documentCountry: '',
          newSearch: 'true',
          pageNum: '0',
          pageSize: '10',
          sortDataField: 'CreatedTimestamp',
          sortOrder: 'desc',
          skipWork: 'true',
        },
        headers: {
          accept: 'application/json',
          'accept-language': 'en-US,en;q=0.9,es;q=0.8',
          priority: 'u=1, i',
          referer: 'https://retaillink2.wal-mart.com/Webedi2/inbound/51619',
          'sec-ch-ua':
            '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"Windows"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-origin',
          'user-agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
          'x-requested-with': 'XMLHttpRequest',
          'x-bot-token': '<your-bot-token>', // Replace with your bot token
          Cookie:
            'PA.PA_Retaillink=<your-cookie-data>; RETAILLINKSESSION=<your-cookie-session>; ...', // Include necessary cookies
        },
      }
    );
    res.status(response.status).json(response.data); // Ensure JSON response
  } catch (error) {
    console.error('Proxy Error:', error.message);
    res
      .status(error.response?.status || 500)
      .send(error.response?.data || error.message);
  }
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Proxy server is running at http://localhost:${port}`);
});
