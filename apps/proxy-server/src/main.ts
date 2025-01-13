import express from 'express';
import axios, { AxiosRequestConfig } from 'axios';
import cors from 'cors';
import https from 'https';
import path from 'path';
import fs from 'fs';
import { CookieJar } from 'tough-cookie';

// Environment setup
const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = express();

// Load the CA bundle (for HTTPS requests)
const caBundlePath = path.resolve('./ca-bundle.crt');
const caCertificates = fs.readFileSync(caBundlePath, 'utf-8');

const httpsAgent = new https.Agent({
  ca: caCertificates,
  minVersion: 'TLSv1.2',
  rejectUnauthorized: true, // Ensure only trusted certificates are accepted
});

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Create a cookie jar for storing cookies
const cookieJar = new CookieJar();

// Utility function to attach cookies from the jar to the request
const attachCookies = (url: string) => {
  return cookieJar.getCookieStringSync(url);
};

// Utility function to store cookies from the response
const storeCookies = (url: string, setCookieHeaders: string[] | undefined) => {
  if (setCookieHeaders) {
    setCookieHeaders.forEach((cookie) => cookieJar.setCookieSync(cookie, url));
  }
};

// Start the Express server
app.listen(port, () => {
  console.log(`Proxy server is running at http://${host}:${port}`);
});

/**
 * Login endpoint - Retrieves cookies and stores them for subsequent requests
 */
app.post('/walmart-bot-login', async (req, res) => {
  try {
    const url = 'https://retaillink.login.wal-mart.com/api/login';
    const config: AxiosRequestConfig = {
      method: 'post',
      url,
      data: req.body,
      headers: {
        'Content-Type': 'application/json',
        Cookie: 'lang=en',
        Referer: 'https://retaillink.login.wal-mart.com/',
        'X-Bot-Token':
          'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJsb2dpbklkIjoiY2FuZHJhZGVnOTE4MkBnbWFpbC5jb20iLCJpc3MiOiJrcmFrZW4iLCJleHAiOjE3MzkyMTU0MDksImlhdCI6MTczNDAzMTQwOSwianRpIjoiYTJhNGIxMWYtNjZmMi00YzdlLTk2MTctZjQwOTU4MjFmOTMyIn0.EvVZVyUbeAD540h3zmwNKPi6dDhnjxTneYxKdQULdDlgRoCYfcSWi1og5-3b66kVKL-KNTmSOeeXLu20T1P4ZwwXEAV3nYj7N7V12mlPhHO_3SMdMcMMk_y_ZdpQAdlYKE7zidcTbrYeCvcB0m1mGIyELE_ZnmNrIyB1HbOtHurb8idRXy10D3S5SynXKgztzWDWlyZTnLM-JASAalzab8rvbNDTa3_10qgIzLTgBOsQBzsJyHgpGmtIGRo3rq6RtAs4_mlK-jFG1--QfoXaNxZHx36wToGNIj7s96z2zCMBIK8PRV1ThnfzkEvYl5h3xG3Z8Jy4tvjIzKKJcd7n3w',
      },
      httpsAgent,
    };

    const response = await axios(config);

    // Store cookies from the response
    storeCookies(url, response.headers['set-cookie']);

    res.status(response.status).send({
      message: 'Login successful',
      cookies: cookieJar.toJSON(), // Return the stored cookies for debugging
    });
  } catch (error) {
    console.error('Login Error:', error.message);
    res.status(error.response?.status || 500).send(error.response?.data || error.message);
  }
});

/**
 * Get Inbound Documents endpoint - Uses stored cookies for the request
 */
app.get('/inbound-documents', async (req, res) => {
  try {
    const url = 'https://retaillink2.wal-mart.com/Webedi2/Inbound/GetInboundDocuments/51619';

    const config: AxiosRequestConfig = {
      method: 'get',
      url,
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
        Cookie: attachCookies(url), // Attach cookies from the jar
        ...req.headers, // Include headers from the client request
      },
      httpsAgent,
    };

    const response = await axios(config);

    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Proxy Error:', error.message);
    res.status(error.response?.status || 500).send(error.response?.data || error.message);
  }
});

// import express from 'express';
// import axios from 'axios';
// import cors from 'cors';

// const host = process.env.HOST ?? 'localhost';
// const port = process.env.PORT ? Number(process.env.PORT) : 3000;

// const app = express();

// app.use(cors());
// app.use(express.json());

// app.listen(port, () => {
//   console.log(`Proxy server is running at http://localhost:${port}`);
// });

// app.post('/walmart-bot-login', async (req, res) => {
//   try {
//     // Forward the login request to Walmart's login endpoint
//     const loginResponse = await axios.post(
//       'https://retaillink.login.wal-mart.com/api/login',
//       req.body,
//       {
//         headers: {
//           'Content-Type': 'application/json',
//           Referer: 'https://retaillink.login.wal-mart.com/',
//         },
//       }
//     );

//     // Extract the relevant cookies from the response headers
//     const setCookieHeaders = loginResponse.headers['set-cookie'];
//     const cookies = setCookieHeaders.map(cookie => cookie.split(';')[0]).join('; ');

//     console.log('these are the cookies,')

//     res.status(loginResponse.status).json({
//       message: 'Login successful',
//       cookies, // Send cookies back to client if needed
//     });
//   } catch (error) {
//     console.error('Login Error:', error.message);
//     res.status(error.response?.status || 500).send(error.message);
//   }
// });

// app.get('/inbound-documents', async (req, res) => {
//   try {
//     const response = await axios.get('https://retaillink2.wal-mart.com/Webedi2/Inbound/GetInboundDocuments/51619', {
//       params: {
//         documentNumber: '',
//         documentType: '',
//         vendorNumber: '',
//         store: '',
//         taSlipNumber: '',
//         mailboxId: '51619',
//         readStatus: '',
//         documentCountry: '',
//         newSearch: 'true',
//         pageNum: '0',
//         pageSize: '10',
//         sortDataField: 'CreatedTimestamp',
//         sortOrder: 'desc',
//         skipWork: 'true',
//       },
//       headers: req.headers,
//     });
//     res.status(response.status).json(response.data); // Ensure JSON response
//   } catch (error) {
//     console.error('Proxy Error:', error.message);
//     res.status(error.response?.status || 500).send(error.response?.data || error.message);
//   }
// });
