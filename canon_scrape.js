const cheerio = require("cheerio");
const axios = require("axios");
const tough = require('tough-cookie');
const { wrapper } = require('axios-cookiejar-support');

async function performScraping() {
	
	// Create a cookie jar to store cookies
	const cookieJar = new tough.CookieJar();
	const client = wrapper(axios.create({ jar: cookieJar, withCredentials: true }));

	// Step 1: Log in to the server
	const login = async () => {
	  try {
		console.log('Attempting to log in...');
		
		// Initial GET request to load the login page and extract hidden fields
		const initialResponse = await client.get('http://172.19.117.75/login.html');
		const $ = cheerio.load(initialResponse.data);
		
		const formData = {};
		const formAction = $('form[name="loginFrm"]').attr('action');

		$('input').each((i, el) => {
		  const name = $(el).attr('name');
		  const value = $(el).attr('value') || '';
		  formData[name] = value;
		});

		formData.i0012 = '2';  // System Manager Mode
		formData.i0019 = '';  // Fill in if needed, else leave empty
		formData.i2101 = '';  // Your password

		console.log('Form data to be submitted:', formData);
		console.log('Form action URL:', formAction);

		const loginResponse = await client.post(`http://172.19.117.75${formAction}`, new URLSearchParams(formData), {
		  headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		  }
		});

		console.log('Login response status:', loginResponse.status);
		console.log('Login response headers:', loginResponse.headers);
		console.log('Login response data:', loginResponse.data);

		// Log the Set-Cookie headers
		console.log('Set-Cookie headers:', loginResponse.headers['set-cookie']);

		// Log the cookies after login
		const cookies = await cookieJar.getCookies('http://172.19.117.75');
		console.log('Cookies after login:', cookies);

		if (loginResponse.status === 200) {
		  console.log('Login successful');
		} else {
		  console.error('Login failed with status:', loginResponse.status);
		}

		return cookies;
	  } catch (error) {
		console.error('Error logging in:', error.message);
		throw error;
	  }
	};

	// Step 2: Access the protected resource
	const getProtectedPage = async (cookies) => {
	  try {
		console.log('Attempting to access protected page...');

		const protectedResponse = await client.get('http://172.19.117.75/d_counter.html', {
		  headers: {
			'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
		  },
		  maxRedirects: 0, // Avoid following redirects
		  validateStatus: function (status) {
			return status >= 200 && status < 400; // Accept all 2xx and 3xx status codes
		  }
		});

		console.log('Protected page response status:', protectedResponse.status);
		console.log('Protected page response headers:', protectedResponse.headers);
		console.log('Protected page content:', protectedResponse.data);
		
		const $ = cheerio.load(protectedResponse.data);

		// Parse the specific numeric data from the table rows
		let total1, totalBW, total2Sided;
		
		$('tr').each((i, el) => {
		  const thText = $(el).find('th').text().trim();
		  const valueText = $(el).find('td').text().trim();
		  if (valueText && !isNaN(valueText)) {
			const value = parseInt(valueText, 10);
			if (thText.includes('101: Total 1')) {
			  total1 = value;
			} else if (thText.includes('113: Total (Black & White/Small)')) {
			  totalBW = value;
			} else if (thText.includes('114: Total 1 (2-Sided)')) {
			  total2Sided = value;
			}
		  }
		});

		console.log('Total 1:', total1);
		console.log('Total Black & White/Small:', totalBW);
		console.log('Total 1 (2-Sided):', total2Sided);

		return { total1, totalBW, total2Sided };
		
	  } catch (error) {
		if (error.response) {
		  if (error.response.status === 302) {
			console.log('Redirect detected to:', error.response.headers.location);
		  } else {
			console.log('Error response status:', error.response.status);
			console.log('Error response headers:', error.response.headers);
			console.log('Error response data:', error.response.data);
		  }
		} else {
		  console.error('Error accessing protected page:', error.message);
		}
		throw error;
	  }
	};
	
	// Step 3: Access the second protected page and parse serial number
	const getSerialNumberPage = async (cookies) => {
	  try {
		console.log('Attempting to access serial number page...');

		const serialNumberResponse = await client.get('http://172.19.117.75/d_info.html', {
		  headers: {
			'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
		  },
		  maxRedirects: 0, // Avoid following redirects
		  validateStatus: function (status) {
			return status >= 200 && status < 400; // Accept all 2xx and 3xx status codes
		  }
		});

		console.log('Serial number page response status:', serialNumberResponse.status);
		console.log('Serial number page response headers:', serialNumberResponse.headers);
		console.log('Serial number page content:', serialNumberResponse.data);

		const $ = cheerio.load(serialNumberResponse.data);

		// Parse the serial number from the page
		let serialNumber;
		
		$('tr').each((i, el) => {
		  const thText = $(el).find('th').text().trim();
		  const valueText = $(el).find('td').text().trim();
		  if (thText.includes('Serial Number')) {
			serialNumber = valueText;
		  }
		});

		console.log('Serial Number:', serialNumber);

		return serialNumber;
	  } catch (error) {
		if (error.response) {
		  if (error.response.status === 302) {
			console.log('Redirect detected to:', error.response.headers.location);
		  } else {
			console.log('Error response status:', error.response.status);
			console.log('Error response headers:', error.response.headers);
			console.log('Error response data:', error.response.data);
		  }
		} else {
		  console.error('Error accessing serial number page:', error.message);
		}
		throw error;
	  }
	};

	// Execute the login and then access the protected page
	const main = async () => {
	  try {
		const cookies = await login();
		const totals = await getProtectedPage(cookies);
		const serialNumber = await getSerialNumberPage(cookies);
		
		console.log('Extracted totals:', totals);
		console.log('Extracted serial number:', serialNumber);
	  } catch (error) {
		console.error('Error in main execution:', error.message);
	  }
	};

	main();
	
	/*
	axios({
		method: 'get',
		url: 'http://172.19.117.75',
		//url: 'http://172.19.117.75/login.html',
		//url: 'http://172.19.117.75/d_counter.html',
		//url: 'http://172.19.117.75/checkLogin.cgi',
		data: {
		  //login: 'agizdulic',
		  //password: 'ag789ga'
		},
		headers: { "Content-type": "application/json" } 
	  })
	  .then(response=>{
		console.log(response.data);
		//console.log(response.headers);
	  })
	  .catch(error=>{
		  //console.log(error)
		  //console.error(err.response.data.data.message);
		  if (error.response) {
			 // The request was made and the server responded with a status code
			 // that falls out of the range of 2xx
			 console.log(error.response.data);
			 console.log(error.response.status);
			 console.log(error.response.headers);
		   } else if (error.request) {
			 // The request was made but no response was received
			 console.log(error.request);
		   } else {
			 // Something happened in setting up the request that triggered an Error
			 console.log('Error', error.message);
		   }
		   console.log(error.config);
	  });
	 */
	 /*
	//const axiosInstance = axios.create({ baseURL: 'http://172.19.117.75/login.html' });
	const axiosInstance = axios.create({ baseURL: 'http://172.19.117.75/' });
	  
	const createSession = async () => {
	  console.log("create session");
	  const authParams = {
		//username: "agizdulic",
		//password: "ag789ga",
		headers: { "Content-type": "application/json" }
	  };
	  
	  //const resp = await axios.get('http://172.19.117.75/d_counter.html', authParams);
	  const resp = await axios.get('http://172.19.117.75/', authParams);
	  const cookie = resp.headers["set-cookie"][0]; // get cookie from request
	  axiosInstance.defaults.headers.Cookie = cookie;   // attach cookie to axiosInstance for future requests
	};
	
	createSession().then(() => {
	  axios.get('http://172.19.117.75/d_counter.html') // with new cookie
	  .then(({ data }) => console.log(data))
	  .catch(error=>{
		  console.log(error);
		  console.error(err.response.data.data.message);
	  });
	});
	
	/*
	axios.get('http://172.19.117.75/d_counter.html') 
	//axios.get('http://172.19.117.75/login.html')
	.then(({ data }) => console.log(data))
	.catch(error=>{
		  //console.log(error)
		  console.error(err.response.data.data.message);
	  });
	*/
	/*
    // downloading the target web page
    // by performing an HTTP GET request in Axios
    const axiosResponse = await axios.request({
        method: "GET",
		//url: "https://www.w3schools.com/html/html_tables.asp",
        url: "http://172.19.117.75/d_counter.html",
        headers: {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36"
        }
    });
	
	
	// parsing the HTML source of the target web page with Cheerio
    const $ = cheerio.load(axiosResponse.data);
	console.log($);
	
	// Select the table element
	//const table = $('table');
	const table = $('table').first();
	console.log(table);

    // initializing the data structures
    // that will contain the scraped data
    const totalPages = [];
	const tableData = [];
	
	/*
    // scraping the "Learn how web data is used in your market" section
    $(".ModuleElement")
        .find("table")
		.find("tbody")
		.find("tr")
		.find("td")
        .each((index, element) => {
            // extracting the data of interest
            const total = totalPages.push($(element).find('td').eq(0).text().trim())
			console.log($(element).find('td').eq(0).text().trim());

            // filtering out not interesting data
            if (total) {
                // converting the data extracted into a more
                // readable object
                const totalPages = {
                    to: total
                }

                // adding the object containing the scraped data
                // to the industries array
                //industries.push(industry)
            }
        });
	*/
	/*
	// Iterate over each row of the table using the find and each methods
	table.find('tr').each((i, row) => {
		console.log('1');
		// Initialize an empty object to store the row data
		const rowData = {};

		// Iterate over each cell of the row using the find and each methods
		$(row).find('th, td').each((j, cell) => {
			// Add the cell data to the row data object
			rowData[$(cell).text()] = j;
		});

		// Add the row data to the table data array
		tableData.push(rowData);
	});

	// Print the table data
	//console.log(tableData);
	console.log('out');
	*/
}

performScraping();